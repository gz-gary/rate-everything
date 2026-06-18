# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 技术栈

| 层面 | 选型 |
|------|------|
| 前端框架 | React 19 + TypeScript 6.0 |
| UI 库 | Ant Design 6 + @ant-design/icons |
| 构建工具 | Vite 8 + @vitejs/plugin-react |
| Lint | ESLint + typescript-eslint + react-hooks 插件 |
| 后端 | Cloudflare Workers（单一 Worker 服务 API + 静态文件） |
| 数据库 | Cloudflare D1（SQLite 兼容） |
| CLI | wrangler 4.x |

## 开发命令

开发需要**两个终端**：

```bash
# 终端 1：Vite dev server（前端 HMR，/api 通过 proxy 转到 localhost:8787）
npm run dev

# 终端 2：Worker + 本地 D1（SQLite 文件，数据与线上隔离）
npx wrangler dev

# 类型检查 + 构建
npm run build      # tsc -b && vite build
npm run lint       # eslint .
```

## 生产部署

```bash
npm run build && npx wrangler deploy
```

一次部署，Worker 同时服务 `/api/*`（REST → D1）和静态文件 SPA（其他路径，404 回退到 index.html）。

## 架构

```
src/
├── api/
│   ├── types.ts     # 共享类型：Rating / CreateRatingInput / UpdateRatingInput
│   ├── worker.ts    # Worker：REST API + 自动建表 + 静态文件服务
│   └── client.ts    # 前端 API 封装（ratingsApi），从 types.ts 导入类型
├── App.tsx          # 主页面（数据展示 + CRUD 操作）
└── main.tsx         # React 入口

wrangler.toml         # Worker 配置（D1 binding + assets = { directory = "dist" }）
vite.config.ts        # Vite + proxy /api → localhost:8787
tsconfig.app.json     # 排除 worker.ts（Worker 由 wrangler 独立编译）
```

类型定义集中在 `src/api/types.ts`，`worker.ts` 和 `client.ts` 都从此导入，不重复定义。

## Worker 请求路由

```
请求 → Worker fetch()
  ├─ /api/* → 路由匹配 → CRUD → D1
  └─ 其他   → env.ASSETS.fetch(request)             （生产）
               ├─ 文件存在 → 返回
               └─ 404 → index.html（SPA fallback）
```

`env.ASSETS` 只在生产环境注入。本地 dev 下 wrangler 直接托管静态文件，Worker 只接收 `/api` 请求，因此代码里需要 `if (env.ASSETS)` 保护。

## D1 数据库

- **本地 dev**：数据存在于 `.wrangler/state/v3/d1/*.sqlite`，与线上完全隔离
- **生产**：`env.DB` 指向真实 D1 数据库
- **建表**：Worker 启动时自动执行 `CREATE TABLE IF NOT EXISTS`，无需手动初始化

## wrangler 命令速查

| 命令 | 数据源 | 用途 |
|------|--------|------|
| `npx wrangler dev` | 本地 SQLite | 本地开发 |
| `npx wrangler dev --remote` | 线上 D1 | ⚠️ 会操作线上数据 |
| `npx wrangler deploy` | 线上 D1 | 部署到生产 |
