import { Link, NavLink } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

const navItems = [
  { label: '产品介绍', href: '/#product' },
  { label: '功能亮点', href: '/#features' },
  { label: '价格套餐', href: '/billing' },
  { label: '客户案例', href: '/#cases' },
]

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-2 font-semibold">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="size-5" />
          </span>
          <span className="truncate">AI游戏文案</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          {navItems.map((item) => (
            <NavLink key={item.label} to={item.href} className="hover:text-foreground">
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link to="/login">登录</Link>
          </Button>
          <Button asChild>
            <Link to="/register">开始免费生成</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
