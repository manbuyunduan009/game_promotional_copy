import { config } from 'dotenv'
import express from 'express'
import OpenAI from 'openai'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { getBearerToken, isAdminProfile } from './admin-auth.ts'
import { getGenerationQuota } from './billing-rules.ts'

config({ path: '.env.local' })
config()

type GenerateRequestBody = {
  productName?: string
  description?: string
  targetAudience?: string
  sellingPoints?: string
  publishingChannel?: string
  gameType?: string
  genre?: string
  style?: string
  purpose?: string
  campaignInfo?: string
}

type ValidatedGenerateInput = Required<
  Pick<GenerateRequestBody, 'productName' | 'description' | 'targetAudience' | 'sellingPoints' | 'publishingChannel'>
> &
  GenerateRequestBody

const app = express()
const port = Number(process.env.API_PORT || 5174)
const freeDailyGenerationLimit = Number(process.env.FREE_DAILY_GENERATION_LIMIT || 3)

app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const stripe = getStripe()
    const webhookSecret = requireEnv('STRIPE_WEBHOOK_SECRET')
    const signature = req.headers['stripe-signature']

    if (!signature) {
      return res.status(400).send('Missing stripe-signature header.')
    }

    const event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret)
    const supabase = createServiceSupabase()

    if (event.type === 'checkout.session.completed') {
      await syncCheckoutSession(supabase, stripe, event.data.object)
    }

    if (
      event.type === 'customer.subscription.updated' ||
      event.type === 'customer.subscription.deleted' ||
      event.type === 'customer.subscription.created'
    ) {
      await syncSubscription(supabase, event.data.object)
    }

    return res.json({ received: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Stripe webhook error.'
    return res.status(400).send(message)
  }
})

app.use(express.json({ limit: '1mb' }))

function requireEnv(name: string) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} is required`)
  }
  return value
}

function validateBody(body: GenerateRequestBody) {
  const requiredFields: Array<keyof GenerateRequestBody> = [
    'productName',
    'description',
    'targetAudience',
    'sellingPoints',
    'publishingChannel',
  ]

  for (const field of requiredFields) {
    if (!body[field]?.trim()) {
      return `${field} is required`
    }
  }

  return null
}

function buildPrompt(input: ValidatedGenerateInput) {
  return [
    `产品名称：${input.productName}`,
    `产品描述：${input.description}`,
    `目标受众：${input.targetAudience}`,
    `核心卖点：${input.sellingPoints}`,
    `发布渠道：${input.publishingChannel}`,
    `游戏类型：${input.gameType || '未填写'}`,
    `题材：${input.genre || '未填写'}`,
    `风格：${input.style || '未填写'}`,
    `文案用途：${input.purpose || '未填写'}`,
    `活动/版本信息：${input.campaignInfo || '未填写'}`,
    '请生成一段标题、正文和 3 条可选短句，适配所选发布渠道。',
  ].join('\n')
}

function toGenerationRow(input: ValidatedGenerateInput, userId: string, model: string, extra: Record<string, unknown>) {
  return {
    user_id: userId,
    product_name: input.productName,
    description: input.description,
    target_audience: input.targetAudience,
    selling_points: input.sellingPoints,
    publishing_channel: input.publishingChannel,
    game_type: input.gameType || null,
    genre: input.genre || null,
    style: input.style || null,
    purpose: input.purpose || null,
    campaign_info: input.campaignInfo || null,
    prompt: input,
    model,
    ...extra,
  }
}

function createServiceSupabase() {
  return createClient(requireEnv('VITE_SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: {
      persistSession: false,
    },
  })
}

type ServiceSupabase = ReturnType<typeof createServiceSupabase>

function getStripe() {
  return new Stripe(requireEnv('STRIPE_SECRET_KEY'))
}

function getRequestAppUrl(req: express.Request) {
  return process.env.APP_URL || req.get('origin') || 'http://127.0.0.1:5173'
}

function getTodayStartIso() {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString()
}

async function getUsageLimitState(
  supabase: ServiceSupabase,
  userId: string,
) {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('plan,payment_status')
    .eq('id', userId)
    .single()

  if (profileError) {
    throw profileError
  }

  const plan = profile?.plan || 'free'
  const paymentStatus = profile?.payment_status || 'free'

  const { count, error: countError } = await supabase
    .from('generations')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'success')
    .gte('created_at', getTodayStartIso())

  if (countError) {
    throw countError
  }

  return getGenerationQuota({
    plan: plan === 'pro' || plan === 'enterprise' ? plan : 'free',
    paymentStatus,
    used: count || 0,
    freeLimit: freeDailyGenerationLimit,
  })
}

function stripeTimestampToIso(timestamp: number | null | undefined) {
  return timestamp ? new Date(timestamp * 1000).toISOString() : null
}

function getProfileStatusFromStripeStatus(status: string) {
  if (status === 'active' || status === 'trialing') {
    return { plan: 'pro', payment_status: 'active' }
  }

  if (status === 'past_due' || status === 'unpaid') {
    return { plan: 'free', payment_status: 'past_due' }
  }

  return { plan: 'free', payment_status: 'canceled' }
}

async function syncCheckoutSession(
  supabase: ServiceSupabase,
  stripe: Stripe,
  session: Stripe.Checkout.Session,
) {
  const userId = session.metadata?.user_id
  const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id

  if (!userId || !subscriptionId) {
    return
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  await upsertSubscriptionAndProfile(supabase, userId, subscription, session)
}

async function syncSubscription(
  supabase: ServiceSupabase,
  subscription: Stripe.Subscription,
) {
  const userId = subscription.metadata.user_id

  if (!userId) {
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', subscription.id)
      .maybeSingle()

    if (!existingSubscription?.user_id) {
      return
    }

    await upsertSubscriptionAndProfile(supabase, existingSubscription.user_id, subscription)
    return
  }

  await upsertSubscriptionAndProfile(supabase, userId, subscription)
}

async function upsertSubscriptionAndProfile(
  supabase: ServiceSupabase,
  userId: string,
  subscription: Stripe.Subscription,
  session?: Stripe.Checkout.Session,
) {
  const firstItem = subscription.items.data[0]
  const profileUpdate = getProfileStatusFromStripeStatus(subscription.status)

  const { error: subscriptionError } = await supabase
    .from('subscriptions')
    .upsert(
      {
        user_id: userId,
        stripe_customer_id: typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id,
        stripe_subscription_id: subscription.id,
        stripe_checkout_session_id: session?.id || null,
        stripe_price_id: firstItem?.price.id || null,
        plan: 'pro',
        status: subscription.status,
        current_period_start: stripeTimestampToIso(firstItem?.current_period_start),
        current_period_end: stripeTimestampToIso(firstItem?.current_period_end),
        raw_event: session || subscription,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'stripe_subscription_id' },
    )

  if (subscriptionError) {
    throw subscriptionError
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update(profileUpdate)
    .eq('id', userId)

  if (profileError) {
    throw profileError
  }
}

app.post('/api/billing/create-checkout-session', async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization)
    if (!token) {
      return res.status(401).json({ error: 'Missing Authorization bearer token.' })
    }

    const supabase = createServiceSupabase()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid or expired session.' })
    }

    const stripe = getStripe()
    const proPriceId = requireEnv('STRIPE_PRO_PRICE_ID')
    const appUrl = getRequestAppUrl(req)

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: user.email || undefined,
      client_reference_id: user.id,
      metadata: {
        user_id: user.id,
        plan: 'pro',
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan: 'pro',
        },
      },
      line_items: [
        {
          price: proPriceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/billing?checkout=cancelled`,
    })

    return res.json({ url: session.url })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown billing error.'
    return res.status(500).json({ error: message })
  }
})

app.post('/api/billing/sync-checkout-session', async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization)
    if (!token) {
      return res.status(401).json({ error: 'Missing Authorization bearer token.' })
    }

    const sessionId = typeof req.body?.sessionId === 'string' ? req.body.sessionId : ''
    if (!sessionId.startsWith('cs_')) {
      return res.status(400).json({ error: 'Valid Checkout session id is required.' })
    }

    const supabase = createServiceSupabase()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid or expired session.' })
    }

    const stripe = getStripe()
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.client_reference_id !== user.id && session.metadata?.user_id !== user.id) {
      return res.status(403).json({ error: 'This Checkout session does not belong to the current user.' })
    }

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Checkout session is not paid yet.' })
    }

    await syncCheckoutSession(supabase, stripe, session)

    return res.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown billing sync error.'
    return res.status(500).json({ error: message })
  }
})

app.post('/api/generate', async (req, res) => {
  const startedAt = Date.now()

  try {
    const token = getBearerToken(req.headers.authorization)
    if (!token) {
      return res.status(401).json({ error: 'Missing Authorization bearer token.' })
    }

    const validationError = validateBody(req.body)
    if (validationError) {
      return res.status(400).json({ error: validationError })
    }

    const openaiApiKey = requireEnv('OPENAI_API_KEY')
    const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini'
    const baseURL = process.env.OPENAI_BASE_URL || undefined

    const supabase = createServiceSupabase()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid or expired session.' })
    }

    const input = req.body as ValidatedGenerateInput
    const usageLimit = await getUsageLimitState(supabase, user.id)

    if (usageLimit.limit !== null && usageLimit.used >= usageLimit.limit) {
      return res.status(403).json({
        error: `免费版每天最多生成 ${usageLimit.limit} 次。请明天再试，或升级到 Pro。`,
        quota: usageLimit,
      })
    }

    const openai = new OpenAI({ apiKey: openaiApiKey, baseURL })

    try {
      const response = await openai.responses.create({
        model,
        input: [
          {
            role: 'system',
            content:
              '你是资深游戏发行与运营文案专家。请输出中文营销文案，语气清晰、有转化力，避免夸大承诺，结果可直接复制给运营使用。',
          },
          {
            role: 'user',
            content: buildPrompt(input),
          },
        ],
      })

      const output = response.output_text?.trim()
      if (!output) {
        throw new Error('The model returned an empty result.')
      }

      const usage = response.usage
      const { data: savedGeneration, error: insertError } = await supabase
        .from('generations')
        .insert(
          toGenerationRow(input, user.id, model, {
            output,
            status: 'success',
            error_message: null,
            latency_ms: Date.now() - startedAt,
            input_tokens: usage?.input_tokens ?? null,
            output_tokens: usage?.output_tokens ?? null,
            total_tokens: usage?.total_tokens ?? null,
          }),
        )
        .select('*')
        .single()

      if (insertError) {
        return res.status(500).json({ error: insertError.message })
      }

      return res.json({
        generation: savedGeneration,
        quota: {
          ...usageLimit,
          used: usageLimit.used + 1,
          remaining: usageLimit.limit === null ? null : Math.max(usageLimit.limit - usageLimit.used - 1, 0),
        },
      })
    } catch (generationError) {
      const errorMessage = generationError instanceof Error ? generationError.message : 'Unknown generation error.'
      const { data: failedGeneration } = await supabase
        .from('generations')
        .insert(
          toGenerationRow(input, user.id, model, {
            output: '',
            status: 'failed',
            error_message: errorMessage,
            latency_ms: Date.now() - startedAt,
            input_tokens: null,
            output_tokens: null,
            total_tokens: null,
          }),
        )
        .select('*')
        .single()

      return res.status(502).json({
        error: errorMessage,
        generation: failedGeneration ?? null,
      })
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown server error.'
    return res.status(500).json({ error: message })
  }
})

app.get('/api/admin/overview', async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization)
    if (!token) {
      return res.status(401).json({ error: 'Missing Authorization bearer token.' })
    }

    const supabase = createServiceSupabase()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid or expired session.' })
    }

    const { data: currentProfile, error: currentProfileError } = await supabase
      .from('profiles')
      .select('id,role')
      .eq('id', user.id)
      .single()

    if (currentProfileError) {
      return res.status(500).json({ error: currentProfileError.message })
    }

    if (!isAdminProfile(currentProfile)) {
      return res.status(403).json({ error: 'Only admin users can access admin overview.' })
    }

    const [profilesResult, generationsResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('id,email,role,plan,payment_status,created_at')
        .order('created_at', { ascending: false }),
      supabase
        .from('generations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100),
    ])

    if (profilesResult.error) {
      return res.status(500).json({ error: profilesResult.error.message })
    }

    if (generationsResult.error) {
      return res.status(500).json({ error: generationsResult.error.message })
    }

    const users = profilesResult.data || []
    const emailByUserId = new Map(users.map((profile) => [profile.id, profile.email]))
    const records = (generationsResult.data || []).map((record) => ({
      ...record,
      userEmail: emailByUserId.get(record.user_id) || null,
    }))

    return res.json({ users, records })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown server error.'
    return res.status(500).json({ error: message })
  }
})

app.listen(port, '127.0.0.1', () => {
  console.log(`API server running at http://127.0.0.1:${port}`)
})
