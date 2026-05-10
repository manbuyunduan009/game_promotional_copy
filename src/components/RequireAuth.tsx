import type { ReactNode } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/auth'

export function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation()
  const { loading, session } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return children
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const location = useLocation()
  const { loading, session, profile } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (profile?.role !== 'admin') {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>无权访问管理后台</CardTitle>
            <CardDescription>只有 profiles.role = admin 的账号可以访问 /admin。</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/dashboard">返回控制台</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  return children
}

export function RedirectIfAuthenticated({ children }: { children: ReactNode }) {
  const { loading, session } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  if (session) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function LoadingScreen() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4 text-center">
      <div>
        <p className="text-lg font-semibold">正在检查登录状态...</p>
        <p className="mt-2 text-sm text-muted-foreground">请稍等，系统正在确认你是否已经登录。</p>
      </div>
    </main>
  )
}
