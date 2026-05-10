# 高等教育质量监测AI系统 - 部署文档

## 📋 系统要求

### 硬件要求
- CPU: 4核心及以上
- 内存: 16GB及以上（推荐32GB）
- 存储: 100GB SSD
- GPU: 可选（用于本地大模型加速）

### 软件要求
- 操作系统: Windows 10/11
- Node.js: v18.0.0+
- Python: 3.10+
- PostgreSQL: 14.0+
- Redis: 6.0+

---

## 🚀 快速部署指南

### 步骤一：安装依赖软件

#### 1. 安装Node.js
```bash
# 下载并安装 Node.js 18+
https://nodejs.org/

# 验证安装
node --version
npm --version
```

#### 2. 安装Python
```bash
# 下载并安装 Python 3.10+
https://www.python.org/downloads/

# 验证安装
python --version
pip --version
```

#### 3. 安装PostgreSQL
```bash
# 下载并安装 PostgreSQL 14+
https://www.postgresql.org/download/windows/

# 安装时记住设置的密码，如: postgres123
```

#### 4. 安装Redis（可选，用于缓存）
```bash
# Windows版本: https://github.com/microsoftarchive/redis/releases
# 或使用Docker运行Redis
docker run -d -p 6379:6379 redis
```

### 步骤二：初始化项目

#### 1. 创建项目目录
```bash
# 双击运行 init-structure.bat
# 或手动执行以下命令
cd D:\
mkdir AIbishe
cd AIbishe
```

#### 2. 初始化数据库
```bash
# 打开 pgAdmin 或使用命令行
psql -U postgres

# 在PostgreSQL命令行中执行
CREATE DATABASE education_monitor;

# 导入初始化脚本
psql -U postgres -d education_monitor -f D:\AIbishe\database\init-database.sql
```

#### 3. 配置后端
```bash
cd D:\AIbishe\backend

# 安装依赖
npm install

# 复制环境变量配置文件
copy .env.example .env

# 编辑 .env 文件，配置数据库连接信息
# 修改 DB_PASSWORD 为你的PostgreSQL密码
```

#### 4. 配置AI服务
```bash
cd D:\AIbishe\ai-service

# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt
```

### 步骤三：启动服务

#### 1. 启动PostgreSQL和Redis
```bash
# 确保PostgreSQL服务正在运行
# Windows服务中找到 postgresql-x64-14 并启动

# 如果安装了Redis，启动Redis服务
redis-server
```

#### 2. 启动后端服务
```bash
cd D:\AIbishe\backend

# 开发模式启动
npm run start:dev

# 生产模式启动
npm run build
npm run start:prod
```

#### 3. 启动AI服务
```bash
cd D:\AIbishe\ai-service

# 激活虚拟环境
venv\Scripts\activate

# 启动服务
python app.py
```

#### 4. 访问系统
```
后端API: http://localhost:3000
API文档: http://localhost:3000/api/docs
AI服务: http://localhost:8000
```

---

## 📊 前端部署（可选）

### React前端部署
```bash
cd D:\AIbishe\frontend

# 安装依赖
npm install

# 开发模式
npm run dev

# 生产构建
npm run build
```

---

## 🔧 配置本地大模型（可选但推荐）

### 方案一：使用Ollama（推荐）

#### 1. 安装Ollama
```bash
# 下载地址
https://ollama.com/download

# 安装后验证
ollama --version
```

#### 2. 下载模型
```bash
# 下载 ChatGLM3 模型
ollama pull chatglm3

# 或下载 Qwen 模型
ollama pull qwen:14b

# 查看已安装模型
ollama list
```

#### 3. 修改AI服务配置
```python
# 编辑 D:\AIbishe\ai-service\app.py
# 替换模型加载代码为Ollama调用

import requests

def chat_with_ollama(prompt):
    response = requests.post('http://localhost:11434/api/generate', json={
        'model': 'chatglm3',
        'prompt': prompt,
        'stream': False
    })
    return response.json()['response']
```

### 方案二：使用Transformers
```bash
# 下载模型到本地
# 修改 ai-service/app.py 中的模型路径为本地路径
```

---

## 🔐 安全配置

### 1. 修改默认密码
```bash
# 修改 .env 文件中的管理员密码
ADMIN_PASSWORD=your_strong_password_here

# 修改JWT密钥
JWT_SECRET=your_random_jwt_secret_key_here
```

### 2. 数据库安全
```sql
-- 创建专用数据库用户
CREATE USER edu_monitor WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE education_monitor TO edu_monitor;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO edu_monitor;
```

### 3. 防火墙配置
```bash
# 仅允许本地访问
# 后端端口: 3000
# AI服务端口: 8000
# 数据库端口: 5432 (仅本地)
```

---

## 📈 性能优化

### 1. 数据库优化
```sql
-- 创建必要的索引
CREATE INDEX CONCURRENTLY idx_teachers_college ON teachers("collegeId");
CREATE INDEX CONCURRENTLY idx_courses_college ON courses("collegeId");

-- 定期清理
VACUUM ANALYZE;
```

### 2. Redis缓存
```typescript
// 在后端服务中启用Redis缓存
// 修改 app.module.ts 添加 CacheModule
```

### 3. 负载均衡（生产环境）
```nginx
# 使用 Nginx 进行负载均衡
upstream backend {
    server localhost:3000;
    server localhost:3001;
}
```

---

## 🧪 测试指南

### 1. API测试
```bash
# 使用 Postman 或 curl 测试

# 测试登录接口
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123456"}'

# 测试数据导入
curl -X POST http://localhost:3000/api/data-collection/upload/teachers \
  -F "file=@teachers.xlsx"
```

### 2. 智能问答测试
```bash
curl -X POST http://localhost:3000/api/rag/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"question":"什么是生师比？"}'
```

### 3. 性能测试
```bash
# 使用 Apache Bench 进行压力测试
ab -n 1000 -c 10 http://localhost:3000/api/visualization/overview
```

---

## 📝 日常维护

### 1. 数据备份
```bash
# 创建备份脚本 backup.bat
@echo off
set PGPASSWORD=your_password
pg_dump -U postgres -d education_monitor > D:\AIbishe\backups\db_%date:~0,10%.sql
```

### 2. 日志管理
```bash
# 日志位置
D:\AIbishe\logs\

# 定期清理旧日志
# Windows任务计划程序中配置
```

### 3. 系统更新
```bash
# 更新后端依赖
cd D:\AIbishe\backend
npm update

# 更新AI服务依赖
cd D:\AIbishe\ai-service
pip install --upgrade -r requirements.txt
```

---

## ❓ 常见问题

### Q1: 数据库连接失败
**解决方案**:
```bash
# 检查PostgreSQL服务是否启动
# 检查 .env 文件中的数据库配置
# 检查防火墙是否阻止了5432端口
```

### Q2: AI服务无法启动
**解决方案**:
```bash
# 检查Python版本是否为3.10+
# 确认所有依赖已安装
# 检查是否有其他程序占用8000端口
```

### Q3: 大模型加载失败
**解决方案**:
```bash
# 确认显存是否足够
# 尝试使用量化版本模型
# 使用Ollama代替Transformers
```

### Q4: 前端无法连接后端
**解决方案**:
```bash
# 检查后端是否启动
# 确认CORS配置
# 检查API地址是否正确
```

---

## 📞 技术支持

- 项目文档: `D:\AIbishe\docs\`
- 问题反馈: 项目Issues
- 开发团队: AIbishe

---

## 📄 许可证

本项目仅供学术研究使用，未经授权不得用于商业用途。

**祝您部署顺利！🎉**
