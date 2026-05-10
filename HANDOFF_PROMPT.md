# Handoff Prompt

你正在继续协作的项目是「AI游戏文案」。

## 产品定位

这是一个游戏 AI 营销文案生成 SaaS 平台，面向手游、端游、独立游戏、小游戏运营、开发者、发行商。

## 当前版本

当前版本是 React + Vite + TypeScript 前端原型，已经完成多页面可演示闭环，并接入 Supabase Auth：

- 官网落地页
- 登录页
- 注册页
- 用户控制台
- 付费订阅页
- 管理后台

## 核心页面

重点页面是 `/dashboard`：

- 左侧：游戏信息表单，包括游戏类型、题材、平台、风格、文案用途、目标玩家、核心卖点、活动/版本信息
- 右侧：AI 生成结果，多版本展示、一键复制、保存模板

## 架构约定

- UI 组件库固定使用 shadcn/ui 风格组件
- 图标使用 lucide-react
- Supabase client 在 `src/lib/supabase.ts`
- 登录状态在 `src/lib/auth-context.tsx`
- 私有路由守卫在 `src/components/RequireAuth.tsx`
- 前端业务 API 调用集中在 `src/lib/api.ts`
- 后端 API 在 `server/index.ts`
- 类型集中在 `src/types.ts`
- `profiles` 表 SQL 在 `supabase/profiles.sql`
- `generations` 表 SQL 在 `supabase/generations.sql`

## Supabase 配置提醒

`.env.local` 必须由开发者手动创建，填入：

```bash
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-or-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-for-local-api-only
OPENAI_API_KEY=your-openai-api-key
OPENAI_BASE_URL=https://api.andanzhiguang.uk/v1
OPENAI_MODEL=gpt-4.1-mini
```

不要把 service_role key 放进前端。

## 本地命令

```bash
npm install
npm run dev
npm run build
npm run lint
```
