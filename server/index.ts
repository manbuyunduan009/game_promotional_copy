import { config } from 'dotenv'
import express from 'express'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

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

app.use(express.json({ limit: '1mb' }))

function requireEnv(name: string) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} is required`)
  }
  return value
}

function getBearerToken(header: string | undefined) {
  if (!header?.startsWith('Bearer ')) return null
  return header.slice('Bearer '.length)
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

function getTodayStartIso() {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString()
}

async function getUsageLimitState(
  supabase: ReturnType<typeof createClient>,
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
  const hasUnlimitedUsage = plan === 'enterprise' || (plan === 'pro' && paymentStatus === 'active')

  const { count, error: countError } = await supabase
    .from('generations')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'success')
    .gte('created_at', getTodayStartIso())

  if (countError) {
    throw countError
  }

  return {
    plan,
    paymentStatus,
    limit: hasUnlimitedUsage ? null : freeDailyGenerationLimit,
    used: count || 0,
    remaining: hasUnlimitedUsage ? null : Math.max(freeDailyGenerationLimit - (count || 0), 0),
    hasUnlimitedUsage,
  }
}

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

    const supabaseUrl = requireEnv('VITE_SUPABASE_URL')
    const serviceRoleKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY')
    const openaiApiKey = requireEnv('OPENAI_API_KEY')
    const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini'
    const baseURL = process.env.OPENAI_BASE_URL || undefined

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
      },
    })

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

app.listen(port, '127.0.0.1', () => {
  console.log(`API server running at http://127.0.0.1:${port}`)
})
