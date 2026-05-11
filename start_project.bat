@echo off
title Lancement Projet Billetterie
echo ===========================================
echo   DEMARRAGE DU PROJET (BACKEND + FRONTEND)
echo ===========================================

echo Lancement du serveur SQLite sur le port 5000...
start "SERVEUR - Billetterie" cmd /k "cd server && node server.js"

timeout /t 2 /nobreak > nul

echo Lancement du client React/Vite...
start "CLIENT - Billetterie" cmd /k "cd client && npm run dev"

echo.
echo Les deux terminaux sont ouverts. 
echo.
pause