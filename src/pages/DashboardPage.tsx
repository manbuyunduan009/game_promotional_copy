import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Copy, FileClock, Loader2, LogOut, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/lib/auth'
import { generateMarketingCopy, loadGenerationHistory } from '@/lib/api'
import type { Generation, GenerateMarketingCopyInput, GenerationQuota } from '@/types'

const options = {
  gameType: ['手游', '端游', '独立游戏', '小游戏'],
  genre: ['二次元卡牌', '仙侠 MMORPG', 'SLG 策略', '模拟经营', '动作 Roguelike', '休闲消除'],
  publishingChannel: ['App Store', 'TapTap', 'Steam', '抖音', '小红书', '微信小游戏'],
  style: ['热血高燃', '轻松幽默', '硬核专业', '治愈温柔', '悬念反转', '福利直给'],
  purpose: ['商店介绍', '宣传 slogan', '抖音推广文案', '小红书推广文案', '版本更新公告', '公会招募', '活动氪金文案', '上线预热文案'],
}

const initialForm: GenerateMarketingCopyInput = {
  productName: '星火幻想',
  description: '一款主打角色养成和连携大招的二次元卡牌手游。',
  targetAudience: '喜欢高爆发战斗和角色收集的年轻玩家',
  sellingPoints: '新角色登场、30 抽福利、连携大招、限时副本',
  publishingChannel: '抖音',
  gameType: '手游',
  genre: '二次元卡牌',
  style: '热血高燃',
  purpose: '抖音推广文案',
  campaignInfo: '周年庆版本上线，登录送限定头像框',
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { profile, signOut } = useAuth()
  const [form, setForm] = useState<GenerateMarketingCopyInput>(initialForm)
  const [currentGeneration, setCurrentGeneration] = useState<Generation | null>(null)
  const [history, setHistory] = useState<Generation[]>([])
  const [loading, setLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [notice, setNotice] = useState('填写左侧信息后，点击生成即可保存到历史记录。')
  const [quota, setQuota] = useState<GenerationQuota | null>(null)

  useEffect(() => {
    refreshHistory()
  }, [])

  async function refreshHistory() {
    setHistoryLoading(true)
    try {
      setHistory(await loadGenerationHistory())
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '历史记录加载失败。')
    } finally {
      setHistoryLoading(false)
    }
  }

  function updateField(field: keyof GenerateMarketingCopyInput, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setErrorMessage('')
    setNotice('后端正在调用模型生成文案...')

    try {
      const result = await generateMarketingCopy(form)
      const generation = result.generation
      setCurrentGeneration(generation)
      setHistory((current) => [generation, ...current.filter((item) => item.id !== generation.id)])
      if (result.quota) {
        setQuota(result.quota)
      }
      setNotice('已生成并保存到数据库。')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '生成失败，请稍后再试。')
      setNotice('生成失败，请检查配置或稍后重试。')
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy(text: string) {
    await navigator.clipboard.writeText(text)
    setNotice('文案已复制到剪贴板。')
  }

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="size-5" />
            </span>
            AI游戏文案
          </Link>
          <div className="flex items-center gap-2">
            {profile ? <Badge variant="secondary">{profile.plan}</Badge> : null}
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link to="/billing">升级套餐</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/admin">管理后台</Link>
            </Button>
            <Button variant="ghost" onClick={handleSignOut}>
              <LogOut className="size-4" />
              <span className="hidden sm:inline">退出登录</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[420px_1fr] lg:px-8">
        <section className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>生成输入</CardTitle>
              <CardDescription>
                {quota
                  ? quota.limit === null
                    ? '当前套餐不限生成次数。'
                    : `今日已生成 ${quota.used}/${quota.limit} 次，剩余 ${quota.remaining} 次。`
                  : '这些字段会发送到后端，并和生成结果一起保存。'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleGenerate}>
                <FormInput label="产品名称" value={form.productName} onChange={(value) => updateField('productName', value)} />
                <FormTextarea label="产品描述" value={form.description} onChange={(value) => updateField('description', value)} rows={3} />
                <FormInput label="目标受众" value={form.targetAudience} onChange={(value) => updateField('targetAudience', value)} />
                <FormTextarea label="核心卖点" value={form.sellingPoints} onChange={(value) => updateField('sellingPoints', value)} rows={4} />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  <SelectField label="发布渠道" value={form.publishingChannel} items={options.publishingChannel} onChange={(value) => updateField('publishingChannel', value)} />
                  <SelectField label="游戏类型" value={form.gameType || ''} items={options.gameType} onChange={(value) => updateField('gameType', value)} />
                  <SelectField label="题材" value={form.genre || ''} items={options.genre} onChange={(value) => updateField('genre', value)} />
                  <SelectField label="风格" value={form.style || ''} items={options.style} onChange={(value) => updateField('style', value)} />
                </div>
                <SelectField label="文案用途" value={form.purpose || ''} items={options.purpose} onChange={(value) => updateField('purpose', value)} />
                <FormTextarea label="其它信息：活动 / 版本信息" value={form.campaignInfo || ''} onChange={(value) => updateField('campaignInfo', value)} rows={3} required={false} />
                <Button className="w-full" type="submit" disabled={loading}>
                  {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                  {loading ? '正在生成...' : '生成文案'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <CardTitle>生成结果</CardTitle>
                  <CardDescription>{notice}</CardDescription>
                </div>
                {currentGeneration ? (
                  <Button variant="outline" onClick={() => handleCopy(currentGeneration.output)}>
                    <Copy className="size-4" />
                    一键复制
                  </Button>
                ) : null}
              </div>
            </CardHeader>
            <CardContent>
              {errorMessage ? <p className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{errorMessage}</p> : null}
              {currentGeneration ? (
                <article className="rounded-lg border bg-white p-5">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{currentGeneration.publishing_channel}</Badge>
                    <Badge variant="secondary">{currentGeneration.model}</Badge>
                  </div>
                  <p className="mt-5 whitespace-pre-wrap rounded-lg bg-slate-50 p-5 text-base leading-8">{currentGeneration.output}</p>
                </article>
              ) : (
                <div className="grid min-h-[260px] place-items-center rounded-lg border border-dashed bg-muted/30 p-8 text-center">
                  <div className="max-w-sm">
                    <Sparkles className="mx-auto mb-4 size-10 text-primary" />
                    <h2 className="text-lg font-semibold">等待生成第一条文案</h2>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">点击左侧“生成文案”后，后端会调用模型，并把输入和输出保存到数据库。</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileClock className="size-5" />
                生成历史
              </CardTitle>
              <CardDescription>下次访问控制台时，会自动读取当前用户的历史记录。</CardDescription>
            </CardHeader>
            <CardContent>
              {historyLoading ? <p className="text-sm text-muted-foreground">正在加载历史记录...</p> : null}
              {!historyLoading && history.length === 0 ? <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">还没有历史记录。生成第一条文案后，它会出现在这里。</div> : null}
              <div className="space-y-3">
                {history.map((item) => (
                  <button key={item.id} className="w-full rounded-lg border bg-white p-4 text-left transition hover:bg-muted/40" type="button" onClick={() => setCurrentGeneration(item)}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-medium">{item.product_name}</div>
                      <div className="flex gap-2">
                        <Badge variant={item.status === 'success' ? 'secondary' : 'destructive'}>{item.status === 'success' ? '成功' : '失败'}</Badge>
                        <Badge variant="outline">{item.publishing_channel}</Badge>
                      </div>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{item.output || item.error_message || '没有生成内容'}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{new Date(item.created_at).toLocaleString()}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  )
}

function FormInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <Input value={value} onChange={(event) => onChange(event.target.value)} required />
    </label>
  )
}

function FormTextarea({ label, value, onChange, rows, required = true }: { label: string; value: string; rows: number; required?: boolean; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <Textarea value={value} onChange={(event) => onChange(event.target.value)} rows={rows} required={required} />
    </label>
  )
}

function SelectField({ label, value, items, onChange }: { label: string; value: string; items: string[]; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  )
}
