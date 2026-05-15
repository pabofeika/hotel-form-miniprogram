# MEMORY.md

## 项目概况
- **项目**: 创维智慧酒店表单提交微信小程序
- **仓库**: `hotel-form-miniprogram`
- **GitHub**: https://github.com/pabofeika/hotel-form-miniprogram
- **工作区**: /Users/skyworth/WorkBuddy/2026-05-13-task-6

## 技术栈
- 后端: Node.js + Express + Knex (SQLite开发/MySQL生产)
- 前端: 微信原生小程序
- 管理后台: Vue3 (CDN) + Element Plus
- 认证: JWT双密钥 (用户 / 管理员)
- 通知: 微信订阅消息 (待配置appid/appsecret)

## 核心特性
- 5步多步骤表单，配置化渲染
- 条件联动引擎 (3级嵌套)
- 本地草稿缓存 (7天过期)
- 后台表单编辑器 (模板/步骤/字段 CRUD + 条件编辑)
- 管理员反馈 + 微信通知 (预留)

## 表单
- 模板: 创维商用智慧酒店创建配置表
- 27个字段, 5个步骤, 3级条件联动
- 支持10种字段类型: text/textarea/number/email/select/multi_select/file
- 默认管理员: admin / admin123
