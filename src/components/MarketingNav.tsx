import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Button, Chip } from '@heroui/react'
import { PenTool, Sparkles } from 'lucide-react'

const navItems = [
  { label: '产品介绍', href: '/#product' },
  { label: '功能亮点', href: '/#features' },
  { label: '价格套餐', href: '/billing' },
  { label: '客户案例', href: '/#cases' },
]

export function MarketingNav() {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-[#fbfaf5]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-2 font-semibold">
          <span className="flex size-9 items-center justify-center rounded-md bg-[#12232f] text-[#f8f2df] shadow-[0_10px_30px_rgba(18,35,47,0.24)]">
            <PenTool className="size-5" />
          </span>
          <span className="truncate">AI游戏文案</span>
          <Chip size="sm" variant="soft" className="hidden border border-[#e5dcc6] bg-[#fff8df] text-[#68501b] sm:inline-flex">
            SaaS
          </Chip>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          {navItems.map((item) => (
            <NavLink key={item.label} to={item.href} className="transition hover:text-[#12232f]">
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/login" className="hidden rounded-md px-3 py-2 text-sm font-medium text-[#425466] transition hover:bg-white sm:inline-flex">
            登录
          </Link>
          <Button size="sm" className="bg-[#12232f] text-[#f8f2df] shadow-[0_10px_24px_rgba(18,35,47,0.22)]" onPress={() => navigate('/register')}>
            <Sparkles className="size-4" />
            开始免费生成
          </Button>
        </div>
      </div>
    </header>
  )
}
