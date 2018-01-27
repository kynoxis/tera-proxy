@setlocal enableextensions
@cd /d "%~dp0/bin/lib"

WHERE node
IF %ERRORLEVEL% NEQ 0 ECHO Node.js is not installed. Please go to https://nodejs.org/ and install the latest stable version.
ELSE START cmd.exe /k "node proxy.js"
