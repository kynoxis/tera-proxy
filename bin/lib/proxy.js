const { Connection, RealClient } = require('tera-proxy-game'),
	{ protocol } = require('tera-data-parser'),
	{ region: REGION, cacheModules } = require('../config.json'),
	REGIONS = require('./regions'),
	currentRegion = REGIONS[REGION]

if(!currentRegion) {
	console.error('Unsupported region: ' + REGION)
	return
}

const fs = require('fs'),
	net = require('net'),
	path = require('path'),
	dns = require('dns'),
	hosts = require('./hosts'),
	{ customServers, listenHostname, hostname } = currentRegion

// Test if we're allowed to modify the hosts file
try { hosts.remove(listenHostname, hostname) }
catch(e) {
	switch(e.code) {
		case 'EACCES':
			console.error(`ERROR: Hosts file is set to read-only.

* Make sure no anti-virus software is running.
* Locate "${e.path}", right click the file, click 'Properties', uncheck 'Read-only' then click 'OK'.`)
			break
		case 'EPERM':
			console.error(`ERROR: Insufficient permission to modify hosts file.

* Make sure no anti-virus software is running.
* Right click TeraProxy.bat and select 'Run as administrator'.`)
			break
		default:
			throw e
	}

	process.exit(1)
}

const moduleBase = path.join(__dirname, '..', 'node_modules')
let modules

function populateModulesList() {
	if(modules && cacheModules) return

	modules = []

	for(let name of fs.readdirSync(moduleBase))
		if(name[0] !== '.' && name[0] !== '_' && checkMod(name, path.join(moduleBase, name))) modules.push(name)
}

function checkMod(modName, file) {
	if(!fs.lstatSync(file).isDirectory()) return true // Standalone script

	try {
		const {packets} = JSON.parse(fs.readFileSync(path.join(file, 'mod.json'), 'utf8'))

		if(packets) {
			if(!protocol.loaded) protocol.load()

			for(let name in packets) {
				const msg = protocol.messages.get(name)

				if(!msg) {
					console.warn(`Failed to load mod "${modName}":\n* Packet "${name}" has no definition. (outdated proxy/mod?)`)
					return false
				}

				const versions = packets[name]

				for(let version of (typeof versions === 'number' ? [versions] : versions))
					if(!msg.get(version)) {
						console.warn(`Failed to load mod "${modName}":\n* Packet definition ${name}.${version} ${
							Math.max(...msg.keys()) > version ? 'is obsolete. (outdated mod)' : 'does not exist. (outdated proxy?)'
						}`)
						return false
					}
			}
		}
	}
	catch(e) {}

	return true
}

const SlsProxy = require('tera-proxy-sls')

const servers = new Map(),
	proxy = new SlsProxy(currentRegion)

function clearUserModules(children) {
	const childModules = Object.create(null)
	let doChildModules
	const cache = children || require.cache
	let keys = Object.keys(cache), i = keys.length
	while(~--i) {
		const key = keys[i], _module = cache[key]
		if(!key.startsWith(moduleBase)) {
			const { parent } = _module
			if(parent && String(parent.id).startsWith(moduleBase)) {
				_module.parent = void 0
			}
			continue
		}
		const arr = _module.children
		if(arr && arr.length) {
			doChildModules = true
			for(let i = 0, len = arr.length; i < len; ++i) {
				const child = arr[i]
				const id = child.id
				childModules[id] = child
			}
		}
		delete cache[key]
	}
	return doChildModules ?
		clearUserModules(childModules) :
		void 0
}

dns.setServers(['8.8.8.8', '8.8.4.4'])

async function init() {
	console.log(`[proxy] initializing, game region: ${REGION}`)

	if(['NA', 'TW', 'JP', 'TH', 'KR', 'KR-TEST'].includes(REGION)) require('./xigncode-bypass')

	// Retrieve server list
	const serverList = await new Promise((resolve, reject) => {
		proxy.fetch((e, list) => { e ? reject(e) : resolve(list) })
	})

	// Create game proxies for specified servers
	for(let id in customServers) {
		if(isNaN(id)) continue

		const target = serverList[id]

		if(!target) {
			console.error(`server ${id} not found`)
			continue
		}

		const server = net.createServer(socket => {
			const logTag = `[game][${socket.remoteAddress}:${socket.remotePort}]`

			function log(msg) { console.log(logTag, msg) }

			socket.setNoDelay(true)

			const connection = new Connection(),
				client = new RealClient(connection, socket),
				srvConn = connection.connect(client, { host: target.ip, port: target.port })

			populateModulesList()

			log('connecting')

			connection.dispatch.once('init', () => {
				for(let name of modules) connection.dispatch.load(name, module)
			})

			socket.on('error', err => {
				if(err.code === 'ECONNRESET') log('lost connection to client')
				else console.warn(logTag, err)
			})

			srvConn.on('connect', () => {
				log(`connected to ${srvConn.remoteAddress}:${srvConn.remotePort}`)
			})

			srvConn.on('error', err => {
				if(err.code === 'ECONNRESET') log('lost connection to server')
				else console.warn(logTag, err)
			})

			srvConn.on('close', () => {
				log('disconnected')

				if(!cacheModules) {
					console.log('[proxy] unloading user mods')
					clearUserModules()
				}
			})
		})

		servers.set(id, server)
	}

	// Run SLS proxy
	try {
		await new Promise((resolve, reject) => {
			proxy.listen(listenHostname, e => { e ? reject(e) : resolve() })
		})
	}
	catch(e) {
		if(e.code === 'EADDRINUSE') {
			console.error('ERROR: Another instance of TeraProxy is already running, please close it then try again.')
			process.exit()
		}
		else if(e.code === 'EACCES') {
			let port = currentRegion.port
			console.error(`ERROR: Another process is already using port ${port}.\nPlease close or uninstall the application first:\n${require('./netstat')(port)}`)
			process.exit()
		}
		throw e
	}
	console.log(`[sls] listening on ${listenHostname}:${currentRegion.port}`)

	hosts.set(listenHostname, hostname)
	console.log('[sls] added hosts file entry')

	// Run game proxies
	const gameProxyQ = []

	for(let [id, server] of servers)
		gameProxyQ.push(new Promise((resolve, reject) => {
			server.listen(customServers[id].port, customServers[id].ip || '127.0.0.1', resolve)
			.on('error', reject)
		}).then(() => {
			const address = server.address()
			console.log(`[game] listening on ${address.address}:${address.port}`)
		}))

	try {
		await Promise.all(gameProxyQ)
		console.log('[proxy] OK')
	}
	catch(e) {
		if(e.code === 'EACCES') {
			let port = currentRegion.port
			console.error(`ERROR: Another process is already using port ${port}.\nPlease close or uninstall the application first:`)
			return require('./netstat')(port)
		}
		throw e
	}
}

init()

function cleanExit() {
	console.log('terminating...')

	try { hosts.remove(listenHostname, hostname) }
	catch(_) {}

	proxy.close()
	for(let server of servers.values()) server.close()

	process.exit()
}

process.on('SIGHUP', cleanExit)
process.on('SIGINT', cleanExit)
process.on('SIGTERM', cleanExit)