import { supabase } from '@/lib/supabase'
import type { GenerateMarketingCopyInput, GenerateMarketingCopyResult, Generation, PricingPlan, Profile } from '@/types'

export const pricingPlans: PricingPlan[] = [
  {
    id: 'free',
    name: '免费版',
    price: '¥0',
    description: '适合快速体验和小规模灵感生成。',
    features: ['每日有限生成次数', '基础游戏文案模板', '单人使用', '复制生成结果'],
  },
  {
    id: 'pro',
    name: 'Pro 专业版',
    price: '¥10/月',
    description: '适合持续做版本运营、内容种草和渠道投放的团队。',
    features: ['无限生成', '高级文案模板', '多风格切换', '保存团队模板', '优先生成队列'],
    highlighted: true,
  },
  {
    id: 'enterprise',
    name: '企业版',
    price: '联系销售',
    description: '适合发行商、代理运营公司和多项目团队。',
    features: ['定制批量生成', 'API 接口', '品牌语气定制', '企业模板库', '专属审核规则'],
  },
]

export async function generateMarketingCopy(input: GenerateMarketingCopyInput): Promise<GenerateMarketingCopyResult> {
  if (!supabase) {
    throw new Error('Supabase 尚未配置，无法确认当前用户。')
  }

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error || !session) {
    throw new Error('请先登录后再生成文案。')
  }

  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(input),
  })

  const payload = (await response.json()) as GenerateMarketingCopyResult & { error?: string }

  if (!response.ok || !payload.generation) {
    throw new Error(payload.error || '生成失败，请稍后再试。')
  }

  return {
    generation: payload.generation,
    quota: payload.quota,
  }
}

export async function loadGenerationHistory(): Promise<Generation[]> {
  if (!supabase) {
    throw new Error('Supabase 尚未配置，无法读取历史记录。')
  }

  const { data, error } = await supabase
    .from('generations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    throw error
  }

  return (data || []) as Generation[]
}

export async function createProCheckoutSession(): Promise<string> {
  if (!supabase) {
    throw new Error('Supabase 尚未配置，无法确认当前用户。')
  }

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error || !session) {
    throw new Error('请先登录后再升级 Pro。')
  }

  const response = await fetch('/api/billing/create-checkout-session', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  })

  const payload = (await response.json()) as { url?: string; error?: string }

  if (!response.ok || !payload.url) {
    throw new Error(payload.error || '创建支付页面失败。')
  }

  return payload.url
}

export async function syncCheckoutSession(sessionId: string): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase 尚未配置，无法同步支付结果。')
  }

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error || !session) {
    throw new Error('请先登录后再同步支付结果。')
  }

  const response = await fetch('/api/billing/sync-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ sessionId }),
  })

  const payload = (await response.json()) as { error?: string }

  if (!response.ok) {
    throw new Error(payload.error || '同步支付结果失败。')
  }
}

export type AdminGenerationRecord = Generation & {
  userEmail?: string | null
}

export type AdminOverview = {
  users: Profile[]
  records: AdminGenerationRecord[]
}

export async function loadAdminOverview(): Promise<AdminOverview> {
  if (!supabase) {
    throw new Error('Supabase 尚未配置，无法确认当前管理员。')
  }

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error || !session) {
    throw new Error('请先登录管理员账号。')
  }

  const response = await fetch('/api/admin/overview', {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  })

  const payload = (await response.json()) as AdminOverview & { error?: string }

  if (!response.ok) {
    throw new Error(payload.error || '后台数据加载失败。')
  }

  return {
    users: payload.users || [],
    records: payload.records || [],
  }
}
