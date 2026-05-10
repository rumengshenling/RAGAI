@echo off
chcp 65001
echo ====================================
echo 高等教育质量监测AI系统 - 停止服务
echo ====================================
echo.

:: 停止Node.js进程（后端）
echo [1/2] 停止后端服务...
taskkill /F /IM node.exe /T 2>nul
if errorlevel 1 (
    echo 后端服务未运行
) else (
    echo 后端服务已停止
)

:: 停止Python进程（AI服务）
echo.
echo [2/2] 停止AI服务...
taskkill /F /IM python.exe /T 2>nul
if errorlevel 1 (
    echo AI服务未运行
) else (
    echo AI服务已停止
)

echo.
echo ====================================
echo ✓ 所有服务已停止
echo ====================================
pause
