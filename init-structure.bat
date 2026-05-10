@echo off
chcp 65001
echo ====================================
echo 高等教育质量监测AI系统 - 项目初始化
echo ====================================
echo.

:: 创建根目录
cd /d D:\
if not exist AIbishe mkdir AIbishe
cd AIbishe

:: 创建后端目录结构
echo [1/4] 创建后端目录结构...
if not exist backend mkdir backend
cd backend
if not exist src mkdir src
cd src
if not exist modules mkdir modules
cd modules
if not exist data-collection mkdir data-collection
if not exist early-warning mkdir early-warning
if not exist rag-service mkdir rag-service
if not exist auth mkdir auth
if not exist visualization mkdir visualization
cd ..
if not exist common mkdir common
if not exist config mkdir config
if not exist database mkdir database
cd ..

:: 创建前端目录结构
echo [2/4] 创建前端目录结构...
cd ..
if not exist frontend mkdir frontend
cd frontend
if not exist src mkdir src
cd src
if not exist pages mkdir pages
if not exist components mkdir components
if not exist services mkdir services
if not exist utils mkdir utils
if not exist assets mkdir assets
cd ..
if not exist public mkdir public
cd ..

:: 创建AI服务目录结构
echo [3/4] 创建AI服务目录结构...
cd ..
if not exist ai-service mkdir ai-service
cd ai-service
if not exist models mkdir models
if not exist embeddings mkdir embeddings
if not exist knowledge-base mkdir knowledge-base
if not exist scripts mkdir scripts
cd ..

:: 创建数据库和配置目录
echo [4/4] 创建数据库和配置目录...
if not exist database mkdir database
if not exist database\migrations mkdir database\migrations
if not exist database\seeds mkdir database\seeds
if not exist docs mkdir docs
if not exist logs mkdir logs
if not exist uploads mkdir uploads

echo.
echo ====================================
echo ✓ 目录结构创建完成！
echo ====================================
echo.
echo 项目目录：D:\AIbishe
echo.
pause
