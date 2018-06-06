@echo off
@setlocal enableextensions
@cd /d "%~dp0/bin"
IF NOT EXIST config.json (
  ECHO Please select your gameserver region in the prompt and press OK.
  START /WAIT ..\server-select
)


@cd /d "%~dp0/bin/lib"
WHERE node > NUL 2> NUL
IF %ERRORLEVEL% NEQ 0 (
  ECHO Node.JS not found. Please install the latest Current version from https://nodejs.org/
  PAUSE
) ELSE (
  START cmd.exe /k "node proxy.js"
)