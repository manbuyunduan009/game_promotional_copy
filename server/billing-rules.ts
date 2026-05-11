type Plan = 'free' | 'pro' | 'enterprise'

type QuotaInput = {
  plan: Plan
  paymentStatus: string
  used: number
  freeLimit: number
}

export function getGenerationQuota({ plan, paymentStatus, used, freeLimit }: QuotaInput) {
  const hasUnlimitedUsage = plan === 'enterprise' || (plan === 'pro' && paymentStatus === 'active')

  return {
    plan,
    paymentStatus,
    limit: hasUnlimitedUsage ? null : freeLimit,
    used,
    remaining: hasUnlimitedUsage ? null : Math.max(freeLimit - used, 0),
    hasUnlimitedUsage,
  }
}
