# 高等教育质量监测AI系统

> 基于 RAG 技术的智能教育质量监测与分析平台

## 📚 项目简介

本系统对标"高等教育质量监测国家数据平台"，整合数据采集、可视化分析、预警监测、智能问答等核心功能，为高校教学质量监测与评估提供智能化解决方案。

## ✨ 核心功能

### 1. 📊 数据采集模块
- 支持 Excel 批量导入（教师、课程、学生、成绩）
- 多重格式校验规则
- 数据可追溯与完整性保障

### 2. 🎯 可视化驾驶舱
- 多维度数据仪表盘
- 趋势折线图、热力分布图
- 学院/学科钻取查询

### 3. ⚠️ 预警分析模块
- 教育部评估指标体系
- 异常指标实时监测
- 自动归因分析与整改建议

### 4. 🤖 RAG 智能问答
- 知识库文档管理
- 语义检索增强生成
- 自然语言交互

### 5. 🔐 权限管控
- 多角色权限管理
- 数据加密存储
- 操作日志审计

## 🛠️ 技术栈

**后端**: NestJS + TypeORM + PostgreSQL  
**前端**: React + Ant Design + ECharts  
**AI服务**: Python + FastAPI + Transformers  
**向量数据库**: ChromaDB / Milvus  
**缓存**: Redis  

## 📁 项目结构

```
AIbishe/
├── backend/              # NestJS 后端服务
│   ├── src/
│   │   ├── modules/      # 业务模块
│   │   ├── common/       # 公共组件
│   │   └── database/     # 数据库实体
│   └── package.json
├── ai-service/           # Python AI服务
│   ├── app.py            # FastAPI应用
│   └── requirements.txt
├── database/             # 数据库脚本
│   └── init-database.sql
├── docs/                 # 文档
│   ├── DEPLOYMENT.md     # 部署文档
│   └── TEST-REPORT.md    # 测试报告
└── *.bat                 # 启动/停止脚本
```

## 🚀 快速开始

### 1. 安装依赖
```bash
# 后端依赖
cd backend
npm install

# AI服务依赖
cd ../ai-service
pip install -r requirements.txt
```

### 2. 配置数据库
```bash
# 创建数据库
createdb education_monitor

# 导入初始化脚本
psql -d education_monitor -f ../database/init-database.sql
```

### 3. 启动服务
```bash
# 双击运行
start-system.bat

# 或手动启动
# 后端: cd backend && npm run start:dev
# AI服务: cd ai-service && python app.py
```

### 4. 访问系统
- 后端API: http://localhost:3000
- API文档: http://localhost:3000/api/docs
- AI服务: http://localhost:8000

## 📖 文档

- [部署文档](./docs/DEPLOYMENT.md)
- [测试报告](./docs/TEST-REPORT.md)
- [API文档](http://localhost:3000/api/docs)

## 📊 系统截图

### 可视化驾驶舱
![驾驶舱](./docs/screenshots/dashboard.png)

### 预警分析
![预警](./docs/screenshots/warning.png)

### 智能问答
![问答](./docs/screenshots/chat.png)

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 📄 许可证

本项目仅供学术研究使用，未经授权不得用于商业用途。

## 📞 联系方式

- 项目主页: [GitHub Repository]
- 问题反馈: [Issues]
- 开发团队: AIbishe

---

**⭐ 如果这个项目对您有帮助，请给一个 Star！**