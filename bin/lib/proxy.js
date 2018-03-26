if(process.versions.modules < 59) {
  console.error('Your version of Node.JS is too old to run tera-proxy. Version 8.10.0 or newer is recommended.')
  process.exit()
  return
}
else if(process.versions.modules > 59) {
  console.error('Your version of Node.JS is too new. Version 8.x is recommended.')
  process.exit()
  return
}

const { region: REGION, cacheModules } = require("../config.json");
const REGIONS = require("./regions");
const currentRegion = REGIONS[REGION];

if (!currentRegion) {
  console.error("Unsupported region: " + REGION);
  return;
}

let why;
try { why = require("why-is-node-running"); }
catch (_) {}

const fs = require("fs");
const net = require("net");
const path = require("path");
const dns = require("dns");
const hosts = require("./hosts");
const { customServers, listenHostname, hostname } = currentRegion;

try { hosts.remove(listenHostname, hostname); }
catch(e) {
  switch (e.code) {
   case "EACCES":
    console.error(`ERROR: Hosts file is set to read-only.

* Make sure no anti-virus software is running.
* Locate "${e.path}", right click the file, click 'Properties', uncheck 'Read-only' then click 'OK'.`);
    break;
   case "EPERM":
    console.error(`ERROR: Insufficient permission to modify hosts file.

* Make sure no anti-virus software is running.
* Right click TeraProxy.bat and select 'Run as administrator'.`);
    break;
   default:
    throw e;
  }

  process.exit(1);
}

const moduleBase = path.join(__dirname, "..", "node_modules");
let modules;

function populateModulesList() {
  if (modules && cacheModules) return;
  modules = [];
  for (let i = 0, k = -1, arr = fs.readdirSync(moduleBase), len = arr.length; i < len; ++i) {
    const name = arr[i];
    if (name[0] === "." || name[0] === "_") continue;
    modules[++k] = name;
  }
}

const SlsProxy = require("tera-proxy-sls");

const servers = new Map();
const stateMap = new WeakMap();
const proxy = new SlsProxy(currentRegion);
let serverAmount, serversListening = 0;

function customServerCallback() {
  const { address, port } = this.address();
  console.log(`[game] listening on ${address}:${port}`);
  if (++serversListening === serverAmount) {
    console.log(`[proxy] tera-proxy is listening to ${REGION} connections, you may launch the game now`);
  }
}

function listenHandler(err) {
  if (err) {
    const { code } = err;
    if (code === "EADDRINUSE") {
      console.error("ERROR: Another instance of TeraProxy is already running, please close it then try again.");
      process.exit();
    }
    else if (code === "EACCES") {
      let port = currentRegion.port;
      console.error(`ERROR: Another process is already using port ${port}.\nPlease close or uninstall the application first:`);
      return require("./netstat")(port);
    }
    throw err;
  }

  hosts.set(listenHostname, hostname);
  console.log("[sls] server list overridden");

  serverAmount = servers.size;

  for (let i = servers.entries(), step; !(step = i.next()).done; ) {
    const [id, server] = step.value;
    const currentCustomServer = customServers[id];
    server.listen(currentCustomServer.port, currentCustomServer.ip || "127.0.0.1", customServerCallback);
  }
}

function clearUserModules(children) {
  const childModules = Object.create(null);
  let doChildModules;
  const cache = children || require.cache;
  let keys = Object.keys(cache), i = keys.length;
  while(~--i) {
    const key = keys[i], _module = cache[key];
    if (!key.startsWith(moduleBase)) {
      const { parent } = _module;
      if (parent && String(parent.id).startsWith(moduleBase)) {
        _module.parent = void 0;
      }
      continue;
    }
    const arr = _module.children;
    if (arr && arr.length) {
      doChildModules = true;
      for (let i = 0, len = arr.length; i < len; ++i) {
        const child = arr[i];
        const id = child.id;
        childModules[id] = child;
      }
    }
    delete cache[key];
  }
  return doChildModules ?
    clearUserModules(childModules) :
    void 0;
}

function onServerConnect() {
  const state = stateMap.get(this);
  console.log("[connection] routing %s to %s:%d", (
    state.remote = state.socket.remoteAddress + ":" + state.socket.remotePort
  ), this.remoteAddress, this.remotePort);
}

function onServerClose() {
  console.log("[connection] %s disconnected", stateMap.get(this).remote);
  if (!cacheModules) {
    console.log("[proxy] unloading user modules");
    clearUserModules();
  }
}

const { Connection, RealClient } = require("tera-proxy-game");
function createServ(socket) {
  socket.setNoDelay(true);

  const connection = new Connection();
  const client = new RealClient(connection, socket);
  const target = stateMap.get(this);
  const srvConn = connection.connect(client, {
    host: target.ip,
    port: target.port
  });
  stateMap.set(srvConn, { remote: "???", socket });

  populateModulesList();
  for (let i = 0, arr = modules, len = arr.length; i < len; ++i) {
    connection.dispatch.load(arr[i], module);
  }

  socket.on("error", console.warn);
  srvConn.on("connect", onServerConnect);
  srvConn.on("error", console.warn);
  srvConn.on("close", onServerClose);
}

dns.setServers(["8.8.8.8", "8.8.4.4"]);

proxy.fetch((err, gameServers) => {
  if (err) throw err;

  for (let i = 0, arr = Object.keys(customServers), len = arr.length; i < len; ++i) {
    const id = arr[i];
    const target = gameServers[id];
    if (!target) {
      console.error(`server ${id} not found`);
      continue;
    }

    const server = net.createServer(createServ);
    stateMap.set(server, target);
    servers.set(id, server);
  }
  proxy.listen(listenHostname, listenHandler);
});

const isWindows = process.platform === "win32";

function whyExit() {
  if (why) why();
  process.exit();
}

function cleanExit() {
  console.log("terminating...");

  try { hosts.remove(listenHostname, hostname); }
  catch(_) {}

  proxy.close();
  for (let i = servers.values(), step; !(step = i.next()).done; )
    step.value.close();

  if (isWindows) {
    process.stdin.pause();
  }

  setTimeout(whyExit, 5000).unref();
}

if (isWindows) {
  require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
  }).on("SIGINT", () => process.emit("SIGINT"));
}

process.on("SIGHUP", cleanExit);
process.on("SIGINT", cleanExit);
process.on("SIGTERM", cleanExit);
