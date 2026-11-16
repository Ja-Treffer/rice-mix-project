@echo off
setlocal
cd /d "%~dp0"

echo.
echo   RiceMix Control Console
echo   ============================================
echo.

python --version >nul 2>&1
if errorlevel 1 goto nopython

set PORT=8000
netstat -ano | findstr ":%PORT% " | findstr "LISTENING" >nul 2>&1
if not errorlevel 1 goto portbusy

echo   Browser opens in about 2 seconds.
echo.
echo   ** CLOSE THIS WINDOW TO STOP THE SERVER **
echo.
echo   ============================================
echo.

start "" "http://localhost:%PORT%/control.html"

python -m http.server %PORT%

echo.
echo   Server stopped.
timeout /t 2 /nobreak >nul
exit /b 0

:nopython
echo   [ERROR] python not found.
echo   Install Python 3 and tick "Add Python to PATH".
echo.
pause
exit /b 1

:portbusy
echo   [!] Port %PORT% is already in use.
echo       Close the old console window first,
echo       or change PORT near the top of this file.
echo.
pause
exit /b 1
