@echo off
echo ==========================================
echo Iniciando Projeto ACP_RECP1 - Rececao Uvas
echo ==========================================

echo Iniciando Backend...
cd c:\Server\ACP\ACP_RECP1\backend
start cmd /k "npm start"

echo Aguardando 3 segundos...
timeout /t 3 /nobreak > nul

echo Iniciando Frontend...
cd c:\Server\ACP\ACP_RECP1\frontend
start cmd /k "npm run dev"

echo Aplicação iniciada!
echo Backend: http://localhost:3001
echo Frontend: http://localhost:5173
pause
