@echo off
title Baronti Dashboard - Actualización completa
echo.
echo 🚀 Iniciando actualización del Dashboard...

:: 1. Ir a la carpeta del proyecto
cd /d C:\Users\hugo\chrome-launchpad

:: 2. Traer últimos cambios desde el repositorio
echo.
echo 🔄 Haciendo git pull...
git pull origin main

:: 3. Instalar dependencias
echo.
echo 📦 Instalando dependencias...
call npm install

:: 4. Compilar versión final
echo.
echo 🏗️ Compilando versión final...
call npm run build

:: 5. Lanzar vista previa
echo.
echo 🚀 Lanzando vista previa en http://localhost:4173
start http://localhost:4173
call npm run preview

pause
