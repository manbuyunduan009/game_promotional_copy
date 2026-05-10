# 换电脑交接文档

## 项目

AI游戏文案：游戏 AI 营销文案生成 SaaS 平台。

仓库地址：

```bash
git@github.com:manbuyunduan009/game_promotional_copy.git
```

## 本地恢复步骤

```bash
git clone git@github.com:manbuyunduan009/game_promotional_copy.git
cd game_promotional_copy
npm install
```

复制 `.env.example` 为 `.env.local`，然后填入真实密钥。

```bash
cp .env.example .env.local
```

Windows PowerShell 可以用：

```powershell
Copy-Item .env.example .env.local
```

## 必填环境变量

```bash
VITE_SUPABASE_URL=你的 Supabase Project URL
VITE_SUPABASE_PUBLISHABLE_KEY=你的 Supabase publishable/anon key
SUPABASE_SERVICE_ROLE_KEY=你的 Supabase service_role key
OPENAI_API_KEY=你的模型 API key
OPENAI_BASE_URL=https://api.andanzhiguang.uk/v1
OPENAI_MODEL=gpt-4.1-mini
FREE_DAILY_GENERATION_LIMIT=3
```

注意：

- `.env.local` 不要提交。
- `SUPABASE_SERVICE_ROLE_KEY` 只给本地 API 后端使用，不要写进前端代码。

## Supabase 需要运行的 SQL

在 Supabase Dashboard / SQL Editor 依次运行：

1. `supabase/profiles.sql`
2. `supabase/generations.sql`
3. `supabase/admin-dashboard.sql`

## Supabase Auth 配置

Auth / Providers / Email：

- 开启 Email provider
- 本地开发建议关闭 Confirm email

Auth / URL Configuration：

```txt
http://localhost:5173
http://localhost:5173/**
http://127.0.0.1:5173
http://127.0.0.1:5173/**
```

## 启动项目

```bash
npm run dev
```

当前项目会启动：

- 前端：`http://127.0.0.1:5173`
- 本地 API：`http://127.0.0.1:5174`

如果 Windows 后台启动不稳定，可以分开启动：

```bash
npm run dev:web -- --host 127.0.0.1
npm run dev:api
```

## 当前功能状态

已完成：

- Supabase 注册、登录、退出登录
- `/dashboard` 生成文案
- 后端 `/api/generate` 调用模型
- 输入和输出保存到 `generations`
- 生成历史读取
- 免费版每日生成次数限制
- Admin-only `/admin`
- 管理后台用户、生成记录、订阅状态查看

未完成 / 后续建议：

- 真实支付接入
- 支付成功后自动更新 `profiles.plan` 和 `profiles.payment_status`
- 生成记录详情弹窗
- 模板库真实保存
- 后台编辑套餐和模板

## 常用验证命令

```bash
npm run lint
npm run build
```

## 如何设置管理员

Supabase Table Editor 打开 `profiles` 表，找到你的账号，把：

```txt
role = admin
```

保存后退出登录，再重新登录，即可访问 `/admin`。
