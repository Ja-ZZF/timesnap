
<p align="center">
  <a href="http://nestjs.com/" target="blank">
    <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
  </a>
</p>

<p align="center">
  <b>TimeSnap（拾光）</b><br>
  基于 HarmonyOS + NestJS 的多端生活分享社交平台
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@nestjs/core" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
  <a href="https://www.npmjs.com/package/@nestjs/core" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="License" /></a>
  <a href="https://www.mysql.com/" target="_blank"><img src="https://img.shields.io/badge/database-MySQL-blue.svg" alt="MySQL" /></a>
  <a href="https://redis.io/" target="_blank"><img src="https://img.shields.io/badge/cache-Redis-red.svg" alt="Redis" /></a>
  <a href="https://developer.harmonyos.com" target="_blank"><img src="https://img.shields.io/badge/front-end-ArkUI-brightgreen.svg" alt="ArkUI" /></a>
</p>

---

## 📌 Description

**TimeSnap（拾光）** 是一个多终端协同的生活分享社交平台，用户可以发布图文、视频或一句话心情内容，记录生活点滴并与好友互动。  
应用充分融合了鸿蒙分布式特性，实现了手机、平板、智慧屏的多端接续体验。

- 支持：图文/视频发布、智能推荐、私信聊天、点赞收藏评论、跨设备同步等
- 后端采用 NestJS，数据库为 MySQL，Redis 用于缓存与异步任务
- 前端使用 ArkTS 编写，基于 HarmonyOS 原生开发框架 ArkUI

---

## 📁 Project structure

```
timesnap/
├── backend/        NestJS 后端服务
│   ├── src/        控制器、服务、模块等逻辑
│   ├── config/     配置文件与环境变量
│   └── database/   MySQL 表结构与 Redis 脚本
├── frontend/       ArkTS 前端工程（HarmonyOS）
│   └── entry/      页面入口与视图组件
├── docs/           项目文档
└── README.md
```

---

## 🚀 Project setup

```bash
# 克隆仓库
$ git clone https://github.com/Ja-ZZF/timesnap.git
$ cd timesnap
```

### 后端安装与启动

```bash
# 进入后端目录
$ cd ./timesnap

# 安装依赖
$ npm install

# 运行开发环境
$ npm run start:dev
```

### 环境变量配置

请在 `backend/` 根目录下创建 `.env` 文件，参考以下内容：

```env
PORT=3000
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=yourpassword
MYSQL_DATABASE=timesnap

REDIS_HOST=localhost
REDIS_PORT=6379
```

---

## 📱 HarmonyOS Frontend (ArkTS + ArkUI)

```bash
# 使用 DevEco Studio 打开 frontend 目录
# 连接模拟器或鸿蒙真机进行预览和调试
```

- 支持鸿蒙手机、平板、手表与智慧屏
- 实现状态同步、草稿自动存储、分布式接续创作

---

## 🧠 功能概览

- 用户注册 / 登录（手机号验证码、微信、华为账号）
- 发布图文、视频与拾光日记（简洁表达）
- 评论、点赞、转发、收藏、私信聊天等社交互动
- 基于兴趣标签、互动记录的个性化内容推荐
- 举报机制、内容审核、用户信用体系
- 多设备协作编辑与同步、原子服务卡片接入

---

## 🛠 Dev dependencies

- Node.js >= 18.x
- Redis >= 6
- MySQL >= 8.0
- DevEco Studio（推荐最新版）

---

## 📝 License

[MIT](LICENSE)

---

由 **TimeSnap 开发团队** 荣誉出品 🎉

