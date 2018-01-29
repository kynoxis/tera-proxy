@echo off
@setlocal enableextensions
@cd /d "%~dp0/bin/lib"

WHERE node > NUL 2> NUL
IF %ERRORLEVEL% NEQ 0 (
  ECHO Node.js is not installed. Please go to https://nodejs.org/ and install the latest 64-bit version.
  PAUSE
) ELSE (
  START cmd.exe /k "node proxy.js"
)
