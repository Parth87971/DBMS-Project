@echo off
echo ===== CircuStock Electronics Inventory Management System =====
cd /d "%~dp0"

if not exist target\circustock.jar (
    echo Building CircuStock production JAR...
    call mvn clean package -DskipTests
    if %errorlevel% neq 0 (
        echo BUILD FAILED!
        pause
        exit /b 1
    )
)

echo Starting Spring Boot Backend (CircuStock)...
java -jar target\circustock.jar
pause
