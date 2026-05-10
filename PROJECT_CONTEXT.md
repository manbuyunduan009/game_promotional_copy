# 项目背景

## 项目名称

AI游戏文案

## 产品定位

游戏 AI 营销文案生成 SaaS 平台。

面向手游、端游、独立游戏、小游戏运营、开发者和发行商，帮助团队一键生成全渠道游戏营销文案。

## 核心业务

支持生成：

- 商店介绍
- 宣传 slogan
- 抖音 / 小红书推广文案
- 版本更新公告
- 公会招募
- 活动氪金文案
- 上线预热文案

## 当前实现

当前版本是多页面原型，认证使用 Supabase Auth；核心文案生成通过本地 Express API 调用模型，并将输入和输出保存到 Supabase `generations` 表。

当前仍未接入真实支付；`profiles.plan` 和 `profiles.payment_status` 目前需要在 Supabase 中手动维护或后续接支付回调自动更新。

`generations` 表已记录生成状态、错误信息、耗时和 token 用量。变更表结构时重新运行 `supabase/generations.sql` 即可补齐新列。

套餐限制已在后端实现：免费版每日默认 3 次，Pro 且 payment_status=active 不限次数，企业版不限次数。

已实现路由：

- `/` 官网落地页
- `/login` 登录页
- `/register` 注册页
- `/dashboard` 用户控制台
- `/billing` 付费订阅页
- `/admin` 管理后台

## 技术要求

- UI 组件库固定使用 shadcn/ui 风格组件
- 图标使用 lucide-react
- 登录、注册、登出和受保护路由使用 Supabase Auth
- 核心生成接口是 `/api/generate`
- 第一版不接真实支付
- 后续 API 接入优先替换 `src/lib/api.ts`

## Supabase 手动配置

- 在 `.env.local` 填写 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_PUBLISHABLE_KEY`
- 在 Supabase Auth / Providers / Email 里开启 Email provider
- 本地开发建议关闭 Confirm email
- 在 Supabase SQL Editor 运行 `supabase/profiles.sql`
- 在 Supabase SQL Editor 运行 `supabase/generations.sql`
- 本地 `.env.local` 还需要 `SUPABASE_SERVICE_ROLE_KEY` 和 `OPENAI_API_KEY`

## 运行方式

```bash
npm install
npm run dev
```

构建和检查：

```bash
npm run build
npm run lint
```
