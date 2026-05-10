import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'

type AuthLayoutProps = {
  title: string
  description: string
  children: React.ReactNode
}

export function AuthLayout({ title, description, children }: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#f8fafc_0%,#eef9f6_48%,#fff7ed_100%)] px-4 py-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[1fr_440px]">
        <section className="hidden lg:block">
          <Link to="/" className="mb-10 flex items-center gap-2 font-semibold">
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="size-5" />
            </span>
            AI游戏文案
          </Link>
          <div className="max-w-xl">
            <p className="mb-4 text-sm font-medium text-primary">游戏 AI 营销文案生成 SaaS 平台</p>
            <h1 className="text-4xl font-semibold leading-tight text-slate-950">把商店介绍、短视频种草和版本公告变成可复用的生成流程</h1>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">先用免费版验证文案质量，再按团队节奏升级到 Pro 或企业版。</p>
          </div>
        </section>
        <section className="rounded-lg border bg-card p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
          {children}
        </section>
      </div>
    </main>
  )
}
