# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 技术栈

| 层面 | 选型 |
|------|------|
| 前端框架 | React 19 + TypeScript 6.0 |
| UI 库 | Ant Design 6 + @ant-design/icons |
| 构建工具 | Vite 8 + @vitejs/plugin-react |
| Lint | ESLint + typescript-eslint + react-hooks 插件 |
| 数据服务 | Supabase（Postgres + PostgREST → 自动 REST API） |
| 托管 | Cloudflare Pages（静态 SPA） |

## 环境变量

开发前需创建 `.env`，填入 Supabase 项目凭据：

```bash
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

## 开发命令

开发**只需一个终端**：

```bash
npm run dev         # Vite dev server（前端 HMR，直连 Supabase）
```

```bash
# 类型检查 + 构建
npm run build       # tsc -b && vite build
npm run lint        # eslint .
```

## 生产部署

```bash
npm run build && npx wrangler pages deploy dist
```

Cloudflare Pages 托管纯静态 SPA。无需 Worker。

## 架构

```
src/
├── api/
│   ├── types.ts     # 共享类型：Rating / CreateRatingInput / UpdateRatingInput
│   └── client.ts    # Supabase SDK 封装（ratingsApi），从 types.ts 导入类型
├── App.tsx          # 主页面（数据展示 + CRUD 操作）
└── main.tsx         # React 入口

vite.config.ts        # Vite（无 proxy，前端直连 Supabase）
```

类型定义集中在 `src/api/types.ts`，`client.ts` 和 `App.tsx` 都从此导入。

## Supabase 数据库

数据层由 Supabase 管理，通过 PostgREST 自动暴露 REST API：

- **数据库**：Postgres（Supabase 托管）
- **API**：`https://<project>.supabase.co/rest/v1/ratings`（自动 CRUD）
- **校验**：Postgres CHECK 约束 + RLS policy
- **SDK**：`@supabase/supabase-js`（前端直接调用，无需中间层）

### 表结构

```sql
CREATE TABLE ratings (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  item       TEXT NOT NULL CHECK (char_length(item) > 0),
  category   TEXT NOT NULL DEFAULT '',
  rating     INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment    TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for anonymous" ON ratings
  FOR ALL USING (true) WITH CHECK (true);
```

### 本地开发

Supabase 支持本地开发（需要 Docker）：

```bash
npx supabase init
npx supabase start
```

然后 `VITE_SUPABASE_URL` 指向 `http://localhost:54321`（本地 Supabase API）。

详细信息：https://supabase.com/docs/guides/local-development
