import { Link, useNavigate } from 'react-router-dom'
import { LogOut, ShieldCheck, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth'

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const { signOut } = useAuth()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="size-5" />
            </span>
            AI游戏文案
          </Link>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-md bg-secondary px-3 py-2 text-sm text-secondary-foreground sm:flex">
              <ShieldCheck className="size-4" />
              Admin
            </div>
            <Button asChild variant="outline">
              <Link to="/dashboard">返回控制台</Link>
            </Button>
            <Button variant="ghost" onClick={handleSignOut}>
              <LogOut className="size-4" />
              <span className="hidden sm:inline">退出登录</span>
            </Button>
          </div>
        </div>
      </header>
      {children}
    </main>
  )
}
