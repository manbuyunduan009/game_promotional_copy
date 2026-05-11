import { useNavigate } from 'react-router-dom'
import { Button, Card, Chip } from '@heroui/react'
import { ArrowRight, BadgeCheck, Bot, CheckCircle2, Layers3, Megaphone, Radar, ShieldCheck, Sparkles, Wand2 } from 'lucide-react'
import heroImage from '@/assets/hero.png'
import { MarketingNav } from '@/components/MarketingNav'
import { PricingCards } from '@/components/PricingCards'

const features = [
  { icon: Wand2, title: '全渠道文案生成', text: '一次输入游戏卖点，拆出商店介绍、短视频口播、小红书种草和版本公告。' },
  { icon: Layers3, title: '游戏语境模板', text: '围绕题材、玩法、活动节点和目标玩家组织，不再从通用写作提示词开始。' },
  { icon: Bot, title: '模型调用闭环', text: '后端统一校验登录态、额度、生成状态和历史记录，避免前端绕过限制。' },
  { icon: ShieldCheck, title: '团队运营资产', text: '后续可沉淀品牌语气、模板库、审核规则和企业批量生成流程。' },
]

const channels = ['App Store', 'TapTap', 'Steam', '抖音', '小红书', 'B站', '微信小游戏', '游戏官网']

const workflows = [
  ['01', '录入游戏信息', '题材、平台、卖点、活动节点和目标玩家一次整理清楚。'],
  ['02', '生成多渠道版本', '根据渠道语气输出可直接复制的标题、正文和短句。'],
  ['03', '沉淀历史记录', '保留输入、输出、状态、耗时和 token，方便复盘与二次编辑。'],
]

const cases = [
  { title: '二次元卡牌上线预热', result: '预约页主文案 20 分钟完成 6 版', text: '用角色卖点、福利节点和预约奖励生成不同渠道的预热文案。' },
  { title: 'SLG 版本更新公告', result: '公告结构统一，运营审核时间减半', text: '把新赛季机制、联盟玩法和限时活动整理成玩家能读懂的版本说明。' },
  { title: '独立游戏 Steam 商店页', result: '快速得到短介绍、长介绍和标签建议', text: '围绕核心玩法、氛围关键词和目标玩家生成更清晰的商店表达。' },
]

const stats = [
  ['8+', '渠道文案类型'],
  ['3 次', '免费每日生成'],
  ['100%', '后端额度校验'],
]

export function HomePage() {
  const navigate = useNavigate()

  return (
    <main className="min-h-screen bg-[#fbfaf5] text-[#12232f]">
      <MarketingNav />

      <section className="relative overflow-hidden border-b border-[#e8ddc7]">
        <img src={heroImage} alt="AI 游戏文案平台视觉" className="pointer-events-none absolute right-[-30px] top-10 hidden h-[420px] w-[420px] object-contain opacity-20 lg:block" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18px_18px,rgba(18,35,47,0.08)_1px,transparent_1px)] bg-[length:28px_28px]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[0.96fr_1.04fr] lg:px-8 lg:py-20">
          <div className="flex flex-col justify-center">
            <Chip className="mb-6 w-fit border border-[#e0d1aa] bg-[#fff6d7] text-[#624b14]" size="sm" variant="soft">
              游戏 AI 营销文案 SaaS
            </Chip>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">把一次游戏投放需要的文案，压缩成一个可复用工作流</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#586777]">
              面向手游、端游、独立游戏和小游戏运营团队。输入游戏信息、玩法卖点和活动节点，快速生成商店介绍、短视频种草、版本公告和活动转化文案。
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="bg-[#12232f] text-[#f8f2df] shadow-[0_18px_40px_rgba(18,35,47,0.24)]" onPress={() => navigate('/dashboard')}>
                进入控制台 <ArrowRight className="size-4" />
              </Button>
              <Button size="lg" className="border border-[#d9cfb5] bg-white text-[#12232f]" onPress={() => navigate('/register')}>
                免费注册 <Sparkles className="size-4" />
              </Button>
            </div>
            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
              {stats.map(([value, label]) => (
                <div key={label} className="border-l border-[#d8ccb2] pl-4">
                  <div className="text-2xl font-semibold">{value}</div>
                  <div className="mt-1 text-xs text-[#6d7884]">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="rounded-xl border border-[#e5dcc6] bg-white/86 p-4 shadow-[0_30px_90px_rgba(18,35,47,0.16)] backdrop-blur">
              <div className="flex items-center justify-between border-b border-[#ece2ce] pb-4">
                <div>
                  <p className="text-sm font-semibold">运营生成战情室</p>
                  <p className="mt-1 text-xs text-[#6d7884]">从卖点输入到渠道输出</p>
                </div>
                <Chip className="bg-[#e9f8ef] text-[#1e7042]" size="sm" variant="soft">
                  live
                </Chip>
              </div>
              <div className="grid gap-4 pt-4 md:grid-cols-[0.8fr_1.2fr]">
                <div className="space-y-3">
                  {['二次元卡牌', '周年庆版本', '抖音推广', '登录送 30 抽'].map((item) => (
                    <div key={item} className="rounded-md border border-[#eee3cb] bg-[#fffaf0] px-3 py-3 text-sm">
                      {item}
                    </div>
                  ))}
                </div>
                <div className="rounded-lg bg-[#12232f] p-5 text-[#f8f2df]">
                  <div className="flex items-center gap-2 text-xs text-[#9fd8c0]">
                    <Radar className="size-4" />
                    AI 输出预览
                  </div>
                  <p className="mt-4 text-base leading-8">新角色登场，30 抽直接开局。组队、爆发、连携一波拉满，现在登录抢先体验周年庆版本。</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {channels.slice(0, 5).map((channel) => (
                      <Chip key={channel} size="sm" className="bg-white/10 text-[#f8f2df]" variant="soft">
                        {channel}
                      </Chip>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <Card className="absolute -bottom-7 left-6 hidden border border-[#e2d5bc] bg-[#fffaf0] px-5 py-4 shadow-[0_20px_55px_rgba(18,35,47,0.14)] md:block">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="size-5 text-emerald-600" />
                <div>
                  <p className="text-sm font-semibold">已接入生成历史</p>
                  <p className="text-xs text-[#6d7884]">输入、输出、状态、耗时可追溯</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section id="product" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr]">
          <div>
            <Chip className="border border-[#e0d1aa] bg-white text-[#624b14]" size="sm" variant="soft">
              产品介绍
            </Chip>
            <h2 className="mt-4 text-3xl font-semibold leading-tight">不是通用写作工具，而是游戏运营的文案生产台</h2>
            <p className="mt-4 text-sm leading-7 text-[#66717f]">成熟团队不会只看“能不能生成”，还会看输入结构、历史留痕、套餐限制和后续模板沉淀。这个页面要把这些能力前置讲清楚。</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Card key={feature.title} className="border border-[#e6deca] bg-white/90 p-5 shadow-[0_18px_50px_rgba(18,35,47,0.08)]">
                  <Icon className="size-5 text-[#c8842f]" />
                  <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#66717f]">{feature.text}</p>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      <section id="features" className="border-y border-[#e8ddc7] bg-[#12232f] text-[#f8f2df]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <Chip className="bg-white/10 text-[#f8f2df]" size="sm" variant="soft">
              功能亮点
            </Chip>
            <h2 className="mt-4 text-3xl font-semibold leading-tight">覆盖上线、版本、活动和社区增长</h2>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {['商店介绍', '宣传 slogan', '抖音推广', '小红书种草', '版本更新公告', '公会招募', '活动氪金文案', '上线预热'].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-md border border-white/10 bg-white/6 p-4">
                <Megaphone className="size-4 text-[#f7c948]" />
                <span className="text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {workflows.map(([step, title, text]) => (
              <div key={step} className="border-t border-white/20 pt-5">
                <div className="text-sm text-[#f7c948]">{step}</div>
                <h3 className="mt-3 text-xl font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#d9e6df]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <Chip className="border border-[#e0d1aa] bg-white text-[#624b14]" size="sm" variant="soft">
              价格套餐
            </Chip>
            <h2 className="mt-4 text-3xl font-semibold">从免费试用到企业批量生成</h2>
          </div>
          <Button className="w-fit border border-[#d9cfb5] bg-white text-[#12232f]" onPress={() => navigate('/billing')}>
            查看订阅页
          </Button>
        </div>
        <PricingCards />
      </section>

      <section id="cases" className="bg-[#f0eadc]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Chip className="border border-[#d6c49d] bg-white text-[#624b14]" size="sm" variant="soft">
            客户案例
          </Chip>
          <h2 className="mt-4 text-3xl font-semibold">让不同类型游戏更快拿到可发布版本</h2>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {cases.map((item) => (
              <Card key={item.title} className="border border-[#ded1b8] bg-white/86 p-6 shadow-[0_18px_50px_rgba(18,35,47,0.08)]">
                <BadgeCheck className="size-5 text-emerald-600" />
                <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm font-medium text-[#c8842f]">{item.result}</p>
                <p className="mt-4 text-sm leading-7 text-[#66717f]">{item.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
