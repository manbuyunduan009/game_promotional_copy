export type Plan = 'free' | 'pro' | 'enterprise'

export type Profile = {
  id: string
  email: string
  role: 'user' | 'admin'
  plan: Plan
  created_at?: string
  payment_status?: 'free' | 'active' | 'past_due' | 'canceled'
}

export type User = {
  id: string
  name: string
  email: string
  plan: Plan
  dailyGenerationsUsed: number
  dailyGenerationLimit: number | null
}

export type GameProfile = {
  gameType: string
  genre: string
  platform: string
  style: string
  purpose: string
  audience: string
  sellingPoints: string
  campaignInfo?: string
}

export type GenerateCopyRequest = GameProfile

export type GenerateMarketingCopyInput = {
  productName: string
  description: string
  targetAudience: string
  sellingPoints: string
  publishingChannel: string
  gameType?: string
  genre?: string
  style?: string
  purpose?: string
  campaignInfo?: string
}

export type Generation = {
  id: string
  user_id: string
  product_name: string
  description: string
  target_audience: string
  selling_points: string
  publishing_channel: string
  game_type: string | null
  genre: string | null
  style: string | null
  purpose: string | null
  campaign_info: string | null
  prompt: GenerateMarketingCopyInput
  output: string
  model: string
  status: 'success' | 'failed'
  error_message: string | null
  latency_ms: number | null
  input_tokens: number | null
  output_tokens: number | null
  total_tokens: number | null
  created_at: string
}

export type GenerationQuota = {
  plan: Plan
  paymentStatus: string
  limit: number | null
  used: number
  remaining: number | null
  hasUnlimitedUsage: boolean
}

export type GenerateMarketingCopyResult = {
  generation: Generation
  quota?: GenerationQuota
}

export type Subscription = {
  id: string
  user_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  stripe_checkout_session_id: string | null
  stripe_price_id: string | null
  plan: Plan
  status: string
  current_period_start: string | null
  current_period_end: string | null
  created_at: string
  updated_at: string
}

export type CopyVariant = {
  id: string
  title: string
  body: string
  channel: string
  tags: string[]
  suggestion: string
}

export type GenerateCopyResponse = {
  variants: CopyVariant[]
}

export type GenerationRecord = {
  id: string
  userName: string
  purpose: string
  channel: string
  createdAt: string
  status: 'success' | 'failed'
}

export type CopyTemplate = {
  id: string
  name: string
  category: string
  plan: Plan
  enabled: boolean
  updatedAt: string
}

export type PricingPlan = {
  id: Plan
  name: string
  price: string
  description: string
  features: string[]
  highlighted?: boolean
}
