import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/components/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/lib/auth'

export function RegisterPage() {
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const [gameType, setGameType] = useState('手游')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const email = String(form.get('email') || '')
    const password = String(form.get('password') || '')
    const teamName = String(form.get('teamName') || '')

    setLoading(true)
    setMessage('')
    setErrorMessage('')

    try {
      const hasSession = await signUp(email, password, {
        team_name: teamName,
        game_type: gameType,
      })

      if (hasSession) {
        navigate('/dashboard')
        return
      }

      setMessage('注册成功。当前 Supabase 项目可能开启了邮箱确认，请先到邮箱点击确认链接，再回到登录页登录。')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '注册失败，请稍后再试。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="创建免费账号" description="免费版每日有限生成次数，适合先验证游戏文案质量。">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="grid gap-2 text-sm font-medium">
          邮箱
          <Input name="email" type="email" placeholder="ops@example.com" required />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          密码
          <Input name="password" type="password" placeholder="至少 8 位字符" required minLength={8} />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          团队 / 公司名
          <Input name="teamName" placeholder="例如：星火发行团队" required />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          主要游戏类型
          <Select value={gameType} onValueChange={setGameType}>
            <SelectTrigger>
              <SelectValue placeholder="选择游戏类型" />
            </SelectTrigger>
            <SelectContent>
              {['手游', '端游', '独立游戏', '小游戏'].map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <Button className="w-full" type="submit" disabled={loading}>
          {loading ? '创建中...' : '注册并进入控制台'}
        </Button>
        {message ? <p className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">{message}</p> : null}
        {errorMessage ? <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{errorMessage}</p> : null}
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        已有账号？
        <Link className="ml-1 text-primary hover:underline" to="/login">
          去登录
        </Link>
      </p>
    </AuthLayout>
  )
}
