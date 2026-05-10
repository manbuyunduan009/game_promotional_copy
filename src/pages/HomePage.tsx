import { Link } from 'react-router-dom'
import { ArrowRight, BadgeCheck, Bot, Layers3, Megaphone, PlayCircle, ShieldCheck, Wand2 } from 'lucide-react'
import heroImage from '@/assets/hero.png'
import { MarketingNav } from '@/components/MarketingNav'
import { PricingCards } from '@/components/PricingCards'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const features = [
  { icon: Wand2, title: '一键生成全渠道文案', text: '商店介绍、slogan、抖音、小红书、版本公告和公会招募统一生成。' },
  { icon: Layers3, title: '游戏行业模板库', text: '按题材、玩法、平台和文案用途组织模板，减少从零开始写的时间。' },
  { icon: Bot, title: '预留 AI API 接入', text: '第一版先用 mock 跑通流程，后续可替换成真实模型服务。' },
  { icon: ShieldCheck, title: '团队品牌语气', text: '企业版可沉淀品牌语气、审核规则和批量生成流程。' },
]

const channels = ['App Store', 'TapTap', 'Steam', '抖音', '小红书', 'B站', '微信小游戏', '游戏官网']

const cases = [
  { title: '二次元卡牌上线预热', result: '预约页主文案 20 分钟完成 6 版', text: '用角色卖点、福利节点和预约奖励生成不同渠道的预热文案。' },
  { title: 'SLG 版本更新公告', result: '公告结构统一，运营审核时间减半', text: '把新赛季机制、联盟玩法和限时活动整理成玩家能读懂的版本说明。' },
  { title: '独立游戏 Steam 商店页', result: '快速得到短介绍、长介绍和标签建议', text: '围绕核心玩法、氛围关键词和目标玩家生成更清晰的商店表达。' },
]

export function HomePage() {
  return (
    <main className="min-h-screen">
      <MarketingNav />
      <section className="bg-[linear-gradient(135deg,#f8fafc_0%,#eef9f6_52%,#fff7ed_100%)]">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
          <div>
            <Badge variant="secondary" className="mb-5">
              游戏 AI 营销文案生成 SaaS 平台
            </Badge>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl lg:text-6xl">让游戏运营团队更快写出能发布的营销文案</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              专为手游、端游、独立游戏和小游戏团队打造。输入游戏信息、玩法卖点和活动节点，即可生成商店介绍、宣传 slogan、短视频种草、版本公告和氪金活动文案。
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link to="/dashboard">
                  进入控制台 <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/register">
                  免费注册 <PlayCircle className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
          <Card className="overflow-hidden border-slate-200 bg-white/80 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>实时生成预览</CardTitle>
                  <CardDescription>从游戏卖点到全渠道发布文案</CardDescription>
                </div>
                <img src={heroImage} alt="AI 文案平台视觉元素" className="size-20 object-contain" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border bg-slate-50 p-4">
                <p className="text-xs font-medium text-muted-foreground">输入</p>
                <p className="mt-2 text-sm">二次元卡牌 / 新角色上线 / 抖音推广 / 热血爽感 / 登录送 30 抽</p>
              </div>
              <div className="rounded-lg bg-primary p-4 text-primary-foreground">
                <p className="text-xs font-medium opacity-80">AI 输出</p>
                <p className="mt-2 text-sm leading-7">新角色登场，30 抽直接开局。组队、爆发、连携一波拉满，现在登录抢先体验全新版本。</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {channels.slice(0, 5).map((channel) => (
                  <Badge key={channel} variant="outline">
                    {channel}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="product" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <Badge variant="outline">产品介绍</Badge>
            <h2 className="mt-4 text-3xl font-semibold">不是通用写作工具，而是游戏营销文案工作台</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Card key={feature.title}>
                  <CardHeader>
                    <Icon className="size-5 text-primary" />
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm leading-7 text-muted-foreground">{feature.text}</CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      <section id="features" className="border-y bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <Badge variant="outline">功能亮点</Badge>
            <h2 className="mt-4 text-3xl font-semibold">覆盖游戏上线、版本、活动和社区增长</h2>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {['商店介绍', '宣传 slogan', '抖音推广', '小红书种草', '版本更新公告', '公会招募', '活动氪金文案', '上线预热'].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-lg border bg-card p-4">
                <Megaphone className="size-4 text-amber-600" />
                <span className="text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <Badge variant="outline">价格套餐</Badge>
            <h2 className="mt-4 text-3xl font-semibold">从免费试用到企业批量生成</h2>
          </div>
          <Button asChild variant="outline">
            <Link to="/billing">查看订阅页</Link>
          </Button>
        </div>
        <PricingCards />
      </section>

      <section id="cases" className="bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Badge className="bg-white text-slate-950">客户案例</Badge>
          <h2 className="mt-4 text-3xl font-semibold">让不同类型游戏更快拿到可发布版本</h2>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {cases.map((item) => (
              <Card key={item.title} className="border-white/10 bg-white/5 text-white">
                <CardHeader>
                  <BadgeCheck className="size-5 text-emerald-300" />
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription className="text-slate-300">{item.result}</CardDescription>
                </CardHeader>
                <CardContent className="text-sm leading-7 text-slate-300">{item.text}</CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
