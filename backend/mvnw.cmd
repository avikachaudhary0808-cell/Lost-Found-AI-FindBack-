@echo off
setlocal enabledelayedexpansion

set "MAVEN_HOME=%USERPROFILE%\.m2\wrapper\apache-maven-3.9.8"
set "MAVEN_CMD=%MAVEN_HOME%\bin\mvn.cmd"

if not exist "%MAVEN_CMD%" (
    echo ERROR: Maven not found at %MAVEN_CMD%
    exit /B 1
)

call "%MAVEN_CMD%" %*
exit /B %ERRORLEVEL%
