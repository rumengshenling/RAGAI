@echo off
chcp 65001
echo ====================================
echo 高等教育质量监测AI系统 - 一键启动
echo ====================================
echo.

:: 检查PostgreSQL服务
echo [1/4] 检查PostgreSQL服务...
sc query postgresql-x64-14 | find "Running" >nul
if errorlevel 1 (
    echo PostgreSQL未运行，正在启动...
    net start postgresql-x64-14
) else (
    echo PostgreSQL正在运行
)

:: 启动后端服务
echo.
echo [2/4] 启动后端服务...
cd /d D:\AIbishe\backend
start cmd /k "npm run start:dev"
timeout /t 10 /nobreak

:: 启动AI服务
echo.
echo [3/4] 启动AI服务...
cd /d D:\AIbishe\ai-service
start cmd /k "venv\Scripts\activate && python app.py"
timeout /t 5 /nobreak

:: 打开浏览器
echo.
echo [4/4] 打开系统界面...
timeout /t 5 /nobreak
start http://localhost:3000/api/docs

echo.
echo ====================================
echo ✓ 系统启动完成！
echo ====================================
echo.
echo 后端API: http://localhost:3000
echo API文档: http://localhost:3000/api/docs
echo AI服务: http://localhost:8000
echo.
echo 按任意键退出此窗口...
pause >nul