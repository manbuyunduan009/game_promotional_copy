import { Link } from 'react-router-dom'
import { MarketingNav } from '@/components/MarketingNav'
import { PricingCards } from '@/components/PricingCards'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const faq = [
  ['免费版限制是什么？', '免费版每日有限生成次数，适合体验核心生成流程和基础模板。'],
  ['Pro 专业版适合谁？', '适合持续做版本运营、活动运营、短视频投放和社区种草的小团队。'],
  ['企业版包含什么？', '企业版提供定制批量生成、API 接口、品牌语气和企业模板库。'],
]

export function BillingPage() {
  return (
    <main className="min-h-screen">
      <MarketingNav />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="secondary">付费订阅</Badge>
          <h1 className="mt-4 text-4xl font-semibold">按团队阶段选择生成能力</h1>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">从每日有限生成次数开始试用，升级到无限生成、高级模板、多风格切换，或为企业团队接入 API 和品牌定制。</p>
        </div>
        <div className="mt-10">
          <PricingCards />
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {faq.map(([question, answer]) => (
            <Card key={question}>
              <CardHeader>
                <CardTitle className="text-base">{question}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-7 text-muted-foreground">{answer}</CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-10 rounded-lg border bg-secondary p-6 text-center">
          <p className="text-lg font-semibold">先体验核心生成流程，再决定升级套餐。</p>
          <Button asChild className="mt-4">
            <Link to="/dashboard">进入控制台</Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
