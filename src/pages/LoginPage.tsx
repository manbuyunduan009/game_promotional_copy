import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/components/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth'

export function LoginPage() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const email = String(form.get('email') || '')
    const password = String(form.get('password') || '')

    setLoading(true)
    setErrorMessage('')

    try {
      await signIn(email, password)
      navigate('/dashboard')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '登录失败，请检查邮箱和密码。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="登录账号" description="回到控制台继续生成、复制和管理你的游戏营销文案。">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="grid gap-2 text-sm font-medium">
          邮箱
          <Input name="email" type="email" placeholder="ops@example.com" required />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          密码
          <Input name="password" type="password" placeholder="请输入密码" required />
        </label>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-muted-foreground">
            <input className="size-4" type="checkbox" />
            记住登录
          </label>
          <a className="text-primary hover:underline" href="#forgot">
            忘记密码
          </a>
        </div>
        <Button className="w-full" type="submit" disabled={loading}>
          {loading ? '登录中...' : '登录并进入控制台'}
        </Button>
        {errorMessage ? <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{errorMessage}</p> : null}
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        还没有账号？
        <Link className="ml-1 text-primary hover:underline" to="/register">
          免费注册
        </Link>
      </p>
    </AuthLayout>
  )
}
