# AI游戏文案

游戏 AI 营销文案生成 SaaS 平台前端原型，面向手游、端游、独立游戏和小游戏运营、开发者、发行商。

## 当前功能

- `/` SaaS 落地页：产品介绍、功能亮点、价格套餐、客户案例
- `/login` 登录页：Supabase 登录后进入控制台
- `/register` 注册页：Supabase 注册后进入控制台
- `/dashboard` 用户控制台：游戏信息表单、AI 文案生成、多版本结果、一键复制、保存模板
- `/billing` 付费订阅页：免费版、Pro 专业版、企业版
- `/admin` 管理后台：用户管理、生成记录统计、套餐管理、模板管理

## 技术栈

- Vite + React + TypeScript
- Tailwind CSS
- shadcn/ui 风格组件
- React Router
- lucide-react

## 本地运行

```bash
npm install
npm run dev
```

## Supabase 认证配置

手动在 Supabase Dashboard 完成：

1. 创建项目，并复制 Project URL 和 Publishable/anon key。
2. 在 Auth / Providers / Email 开启 Email provider。
3. 本地开发建议关闭 Confirm email，这样注册后可直接进入 `/dashboard`。
4. 在 Auth / URL Configuration 设置：
   - Site URL: `http://localhost:5173`
   - Redirect URLs: `http://localhost:5173/**`
5. 在 SQL Editor 运行 `supabase/profiles.sql`，创建 `profiles` 表和注册触发器。
6. 在 SQL Editor 运行 `supabase/generations.sql`，创建文案生成历史表。
   - 如果表已经存在，也可以重新运行一次，用来补齐 `status`、`error_message`、`latency_ms`、`input_tokens`、`output_tokens`、`total_tokens` 等新列。

本地创建 `.env.local`：

```bash
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-or-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-for-local-api-only
OPENAI_API_KEY=your-openai-api-key
OPENAI_BASE_URL=https://api.andanzhiguang.uk/v1
OPENAI_MODEL=gpt-4.1-mini
FREE_DAILY_GENERATION_LIMIT=3
```

不要把 service_role key 放进前端代码，也不要提交 `.env.local`。

## 文案生成流程

`/dashboard` 的“生成文案”会调用本地后端 `/api/generate`：

1. 前端提交产品名称、描述、目标受众、卖点、发布渠道和其它游戏信息。
2. 后端验证当前登录用户。
3. 后端调用 OpenAI 模型生成营销文案。
4. 后端把输入和输出写入 Supabase `generations` 表。
5. 前端显示结果，并在下次访问时加载当前用户历史记录。

套餐限制逻辑：

- 免费版每天最多生成 `FREE_DAILY_GENERATION_LIMIT` 次。
- `plan = pro` 且 `payment_status = active` 时不限次数。
- `plan = enterprise` 时不限次数。
- 限制在后端 `/api/generate` 执行，前端无法绕过。

## 验证

```bash
npm run build
npm run lint
```

## 后续接入点

认证、核心文案生成和生成历史已接入 Supabase。套餐支付仍是展示状态，尚未接入真实支付。
