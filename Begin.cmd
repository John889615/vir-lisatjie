@echo off
chcp 65001 >nul
title Vir Lisatjie
cd /d "%~dp0"
python bedien.py %*
pause
