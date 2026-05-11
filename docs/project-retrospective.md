# AI 游戏文案 SaaS 项目复盘

这份复盘面向“第一次完整做全栈 SaaS 项目”的学习目标。重点不是炫技术，而是讲清楚：一个 SaaS 从页面到数据库、从登录到付费、从免费权益到 Pro 权益，是怎么连起来的。

## 1. 前后端如何通信

这个项目里，前端和后端不是直接共用数据库，而是通过 HTTP API 通信。

典型流程：

1. 前端页面收集用户输入。
2. 前端调用 `src/lib/api.ts` 里的函数。
3. `api.ts` 使用 `fetch` 请求后端接口。
4. 后端 `server/index.ts` 处理请求。
5. 后端访问 Supabase、OpenAI 或 Stripe。
6. 后端把结果返回给前端。
7. 前端更新页面状态。

例子：

```txt
DashboardPage
  -> generateMarketingCopy()
  -> POST /api/generate
  -> server/index.ts
  -> OpenAI + Supabase
  -> 返回 generation
  -> 页面展示文案
```

产品逻辑上，这样做的好处是：**前端只负责用户体验，后端负责可信操作**。

例如生成额度、Stripe 支付、service role 数据查询，都不能只放在前端。因为前端代码用户可以看到，也可以绕过。真正影响权益和数据库的数据，必须放在后端判断。

## 2. Supabase Auth 怎么做登录

Supabase Auth 负责账号注册、登录、退出和 session 管理。

项目里的核心文件：

- `src/lib/supabase.ts`：创建 Supabase client。
- `src/lib/auth-context.tsx`：读取 session 和 profile，向全站提供登录状态。
- `src/components/RequireAuth.tsx`：保护需要登录的页面。

登录流程：

1. 用户在 `/login` 输入邮箱和密码。
2. 前端调用 `supabase.auth.signInWithPassword()`。
3. Supabase 返回 session。
4. `AuthProvider` 监听登录状态变化。
5. 前端根据 session 判断用户是否已登录。
6. 登录后访问 `/dashboard`、`/admin` 等页面。

注册流程：

1. 用户在 `/register` 注册。
2. Supabase Auth 创建 `auth.users` 记录。
3. 数据库触发器 `handle_new_user()` 自动在 `profiles` 表创建一条用户资料。
4. 默认 `role = user`、`plan = free`。

产品逻辑上，Supabase Auth 解决的是“你是谁”。但 SaaS 还要额外知道“你有什么权限”，所以项目又加了 `profiles` 表保存：

- `role`：普通用户还是管理员。
- `plan`：免费版、Pro、企业版。
- `payment_status`：支付是否有效。

## 3. RLS 和 service role 的区别

RLS 是 Row Level Security，意思是“行级安全策略”。

大白话理解：

- **RLS**：用户只能看到自己该看的数据。
- **service role**：后端管理员钥匙，可以绕过 RLS 做可信操作。

这个项目的设计是：

前端使用：

```txt
VITE_SUPABASE_PUBLISHABLE_KEY
```

这个 key 可以暴露给浏览器，但权限有限。它必须遵守 RLS。例如普通用户只能读取自己的 `generations` 和 `subscriptions`。

后端使用：

```txt
SUPABASE_SERVICE_ROLE_KEY
```

这个 key 不能放到前端。它有更高权限，用来做：

- 验证用户 token。
- 插入生成记录。
- 查询 Admin 后台数据。
- 写入 Stripe 订阅结果。
- 更新 `profiles.plan/payment_status`。

为什么不能都放前端？

如果把 service role 放前端，任何人都可以拿到它，然后读取或修改全库数据。这是严重安全问题。

产品逻辑上，RLS 和 service role 的分工是：

```txt
用户自己操作自己的数据 -> 前端 Supabase client + RLS
涉及付费、后台、跨用户数据 -> 后端 API + service role
```

## 4. Stripe Checkout 和 Webhook 的产品逻辑

Stripe Checkout 负责“收钱页面”，Webhook 负责“可信通知”。

很多新手会误以为：用户支付成功后跳回网站，就可以直接给他升级 Pro。这个判断不够安全。

正确逻辑是：

1. 用户点击升级 Pro。
2. 后端创建 Stripe Checkout Session。
3. 用户跳到 Stripe 页面付款。
4. Stripe 收到付款。
5. Stripe 通过 Webhook 通知本地后端。
6. 后端校验 Webhook 签名。
7. 后端写入 `subscriptions`。
8. 后端更新 `profiles.plan = pro`、`payment_status = active`。

为什么要 Webhook？

因为浏览器跳回网站只能说明“用户来到了成功页”，不能百分百证明钱到账。真正可信的是 Stripe 服务器发给你后端的 Webhook。

本项目还加了一个兜底同步：

```txt
POST /api/billing/sync-checkout-session
```

它解决本地开发常见问题：Stripe CLI 没开、Webhook 转发失败、数据库表刚开始没建好。用户从 Checkout 返回后，前端带着 `session_id` 请求后端补同步。

产品逻辑上，支付系统的关键不是按钮跳转，而是：

```txt
付款结果可信 -> 数据库有记录 -> 用户权益生效 -> 页面能感知
```

## 5. SaaS 免费/付费权益怎么落地

这个项目的权益规则很简单：

- 免费用户：每天最多生成 3 次。
- Pro 用户：不限生成次数。

真正落地时，不是在前端禁用按钮，而是在后端 `/api/generate` 判断。

流程：

1. 用户点击“生成文案”。
2. 前端带 access token 请求 `/api/generate`。
3. 后端查当前用户的 `profiles.plan` 和 `payment_status`。
4. 后端统计今天成功生成了多少次。
5. 如果是免费用户且已用满 3 次，返回 403。
6. 如果是 Pro active 用户，跳过次数限制。
7. 生成成功后写入 `generations`。

为什么限制必须放后端？

因为前端限制只能改善体验，不能防作弊。用户可以绕过按钮直接请求接口。只有后端判断，才能真正保护付费权益。

本项目把额度规则抽到了：

```txt
server/billing-rules.ts
```

并补了测试：

```txt
server/billing-rules.test.ts
```

这样之后改套餐时，不容易把“免费 3 次、Pro 不限”这条核心规则改坏。

## 6. 这个项目学到的完整 SaaS 链路

这个项目不是单纯页面练习，而是跑通了小型 SaaS 最重要的一条链：

```txt
落地页
  -> 注册登录
  -> 使用核心功能
  -> 保存用户数据
  -> 触发免费限制
  -> 付费升级
  -> Webhook 同步权益
  -> Pro 解除限制
  -> Admin 后台查看
```

对应到真实产品岗位，这条链路代表：

- **获客**：落地页说明价值。
- **激活**：注册后进入控制台。
- **体验核心价值**：生成文案。
- **留存基础**：保存历史记录。
- **转化触点**：免费额度用完。
- **付费闭环**：Stripe Checkout。
- **权益交付**：profile 变成 Pro。
- **运营管理**：Admin 查看用户、生成和订阅数据。

## 7. 现在算不算完成

作为练习型全栈应用，它已经基本完成。

完成度较高的部分：

- SaaS 首页和计费页
- Auth 登录注册
- 受保护路由
- AI 生成接口
- Supabase 数据表
- RLS + service role 分工
- Stripe Checkout
- Stripe Webhook
- 免费/Pro 权益限制
- Admin 后台
- 基础测试和构建验证

如果要继续向真实生产环境推进，还需要：

- Stripe Customer Portal 取消订阅
- 续费失败和取消后的权益回收
- 更完整的订阅状态展示
- 生成模板库
- 数据看板
- 错误日志和监控
- API 限流
- 路由懒加载和包体积优化
- 密钥轮换和正式环境配置

## 8. 对新手最重要的收获

这个项目最有价值的地方不是用了多少库，而是理解了 SaaS 的主干：

```txt
用户是谁 -> 能做什么 -> 做了什么 -> 是否付费 -> 付费后权益怎么生效
```

只要这个链路清楚，后面加模板库、数据看板、订阅管理、团队协作，本质上都是在这条主干上扩展。
