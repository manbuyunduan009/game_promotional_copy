import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Card, Chip } from '@heroui/react'
import { Check, Loader2, Sparkles } from 'lucide-react'
import { MarketingNav } from '@/components/MarketingNav'
import { createProCheckoutSession, syncCheckoutSession } from '@/lib/api'
import { useAuth } from '@/lib/auth'

const freeFeatures = ['每天最多生成 3 次', '基础游戏文案生成', '生成历史记录', '适合体验主流程']
const proFeatures = ['不限生成次数', '适合持续版本运营', '适合活动和渠道投放', '后续接入高级模板']

export function BillingPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { profile, refreshProfile, user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const isPro = profile?.plan === 'pro' && profile.payment_status === 'active'
  const checkoutState = searchParams.get('checkout')
  const checkoutSessionId = searchParams.get('session_id')
  const checkoutMessage =
    checkoutState === 'success'
      ? '支付已完成，正在等待 Stripe Webhook 同步套餐。通常几秒内会变成 Pro。'
      : checkoutState === 'cancelled'
        ? '你已取消支付，当前套餐没有变化。'
        : ''

  useEffect(() => {
    if (checkoutState === 'success') {
      const timer = window.setTimeout(() => {
        const syncPayment = checkoutSessionId ? syncCheckoutSession(checkoutSessionId) : Promise.resolve()
        syncPayment
          .then(refreshProfile)
          .catch(() => undefined)
      }, 2000)

      return () => window.clearTimeout(timer)
    }
  }, [checkoutSessionId, checkoutState, refreshProfile])

  async function handleUpgrade() {
    if (!user) {
      navigate('/login')
      return
    }

    setLoading(true)
    setErrorMessage('')

    try {
      const checkoutUrl = await createProCheckoutSession()
      window.location.href = checkoutUrl
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '创建支付页面失败，请稍后再试。')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#fbfaf5] text-[#12232f]">
      <MarketingNav />
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <Chip className="border border-[#e0d1aa] bg-[#fff6d7] text-[#624b14]" size="sm" variant="soft">
            计费订阅
          </Chip>
          <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl">先跑通最简单的 Stripe 订阅流程</h1>
          <p className="mt-5 text-base leading-8 text-[#66717f]">
            免费版用于体验，每天 3 次生成。Pro 版支付成功后更新套餐状态，生成次数不再受每日限制。
          </p>
          <div className="mt-5 text-sm text-[#66717f]">
            当前套餐：
            <span className="font-semibold text-[#12232f]">
              {profile?.plan === 'pro' && profile.payment_status === 'active' ? 'Pro 专业版' : '免费版'}
            </span>
          </div>
        </div>

        {checkoutMessage ? <div className="mx-auto mt-8 max-w-3xl rounded-lg border border-[#d9cfb5] bg-white p-4 text-sm text-[#425466]">{checkoutMessage}</div> : null}
        {errorMessage ? <div className="mx-auto mt-8 max-w-3xl rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{errorMessage}</div> : null}

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <PlanCard
            title="免费版"
            price="¥0"
            description="适合新手先验证登录、生成、历史记录和额度限制。"
            features={freeFeatures}
            action={
              <Button className="w-full border border-[#d9cfb5] bg-white text-[#12232f]" onPress={() => navigate('/dashboard')}>
                继续免费使用
              </Button>
            }
          />

          <PlanCard
            highlighted
            title="Pro 专业版"
            price="¥10/月"
            description="适合持续做版本运营、活动投放和渠道文案生成。"
            features={proFeatures}
            action={
              <Button className="w-full bg-[#f8f2df] text-[#12232f]" isDisabled={loading || isPro} onPress={handleUpgrade}>
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                {isPro ? '你已是 Pro' : user ? '升级到 Pro' : '登录后升级 Pro'}
              </Button>
            }
          />
        </div>
      </section>
    </main>
  )
}

function PlanCard({
  title,
  price,
  description,
  features,
  action,
  highlighted = false,
}: {
  title: string
  price: string
  description: string
  features: string[]
  action: ReactNode
  highlighted?: boolean
}) {
  return (
    <Card className={highlighted ? 'border border-[#12232f] bg-[#12232f] p-6 text-[#f8f2df] shadow-[0_24px_80px_rgba(18,35,47,0.24)]' : 'border border-[#e6deca] bg-white/90 p-6 shadow-[0_20px_60px_rgba(18,35,47,0.08)]'}>
      <div className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">{title}</h2>
            <p className={highlighted ? 'mt-3 text-sm leading-7 text-[#d9e6df]' : 'mt-3 text-sm leading-7 text-[#66717f]'}>{description}</p>
          </div>
          {highlighted ? <Chip className="bg-[#f7c948] text-[#12232f]">推荐</Chip> : null}
        </div>
        <div className="mt-8 text-4xl font-semibold">{price}</div>
        <ul className="mt-8 flex-1 space-y-4 text-sm">
          {features.map((feature) => (
            <li key={feature} className="flex gap-3">
              <Check className={highlighted ? 'mt-0.5 size-4 text-[#79e7b4]' : 'mt-0.5 size-4 text-emerald-600'} />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <div className="mt-8">{action}</div>
      </div>
    </Card>
  )
}
