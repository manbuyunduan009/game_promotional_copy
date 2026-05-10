import { useEffect, useMemo, useState } from 'react'
import { AdminLayout } from '@/components/AdminLayout'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { supabase } from '@/lib/supabase'
import type { Generation, Plan, Profile } from '@/types'

type AdminGenerationRecord = Generation & {
  userEmail?: string
}

const planLabel: Record<Plan, string> = {
  free: '免费版',
  pro: 'Pro 专业版',
  enterprise: '企业版',
}

const paymentLabel: Record<string, string> = {
  free: '免费',
  active: '有效',
  past_due: '逾期',
  canceled: '已取消',
}

export function AdminPage() {
  const [users, setUsers] = useState<Profile[]>([])
  const [records, setRecords] = useState<AdminGenerationRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function loadAdminData() {
      if (!supabase) {
        setErrorMessage('Supabase 尚未配置。')
        setLoading(false)
        return
      }

      setLoading(true)
      setErrorMessage('')

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
        setErrorMessage(profilesResult.error.message)
      } else {
        setUsers((profilesResult.data || []) as Profile[])
      }

      if (generationsResult.error) {
        setErrorMessage(generationsResult.error.message)
      } else {
        const profiles = (profilesResult.data || []) as Profile[]
        const emailByUserId = new Map(profiles.map((profile) => [profile.id, profile.email]))
        const generationRows = (generationsResult.data || []) as Generation[]
        setRecords(
          generationRows.map((record) => ({
            ...record,
            userEmail: emailByUserId.get(record.user_id),
          })),
        )
      }

      setLoading(false)
    }

    loadAdminData()
  }, [])

  const paidUsers = useMemo(() => users.filter((user) => user.plan !== 'free').length, [users])

  return (
    <AdminLayout>
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-2xl font-semibold">管理后台</h1>
          <p className="mt-2 text-sm text-muted-foreground">只有 role = admin 的账号可以访问这里。</p>
        </div>

        {errorMessage ? <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{errorMessage}</div> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="用户数" value={String(users.length)} />
          <StatCard title="生成记录数" value={String(records.length)} />
          <StatCard title="付费套餐用户" value={String(paidUsers)} />
        </div>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 md:w-[520px]">
            <TabsTrigger value="users">用户</TabsTrigger>
            <TabsTrigger value="records">生成记录</TabsTrigger>
            <TabsTrigger value="subscriptions">订阅状态</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>用户列表</CardTitle>
                <CardDescription>显示邮箱、角色、套餐和创建时间。</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? <p className="text-sm text-muted-foreground">正在加载...</p> : null}
                {!loading && users.length === 0 ? <EmptyState text="暂无用户。" /> : null}
                {users.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>邮箱</TableHead>
                        <TableHead>角色</TableHead>
                        <TableHead>套餐</TableHead>
                        <TableHead>创建时间</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>{user.role}</Badge>
                          </TableCell>
                          <TableCell>{planLabel[user.plan]}</TableCell>
                          <TableCell>{formatDate(user.created_at)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="records">
            <Card>
              <CardHeader>
                <CardTitle>生成记录</CardTitle>
                <CardDescription>显示用户、产品名、渠道、用途和创建时间。</CardDescription>
              </CardHeader>
              <CardContent>
                {!loading && records.length === 0 ? <EmptyState text="暂无生成记录。" /> : null}
                {records.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>用户</TableHead>
                        <TableHead>产品名</TableHead>
                        <TableHead>渠道</TableHead>
                        <TableHead>用途</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>耗时</TableHead>
                        <TableHead>Token</TableHead>
                        <TableHead>创建时间</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {records.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">{record.userEmail || record.user_id}</TableCell>
                          <TableCell>{record.product_name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{record.publishing_channel}</Badge>
                          </TableCell>
                          <TableCell>{record.purpose || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={record.status === 'success' ? 'secondary' : 'destructive'}>
                              {record.status === 'success' ? '成功' : '失败'}
                            </Badge>
                          </TableCell>
                          <TableCell>{record.latency_ms ? `${record.latency_ms}ms` : '-'}</TableCell>
                          <TableCell>{record.total_tokens ?? '-'}</TableCell>
                          <TableCell>{formatDate(record.created_at)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscriptions">
            <Card>
              <CardHeader>
                <CardTitle>订阅状态</CardTitle>
                <CardDescription>显示用户、套餐和支付状态。</CardDescription>
              </CardHeader>
              <CardContent>
                {!loading && users.length === 0 ? <EmptyState text="暂无订阅数据。" /> : null}
                {users.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>用户</TableHead>
                        <TableHead>套餐</TableHead>
                        <TableHead>支付状态</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.email}</TableCell>
                          <TableCell>{planLabel[user.plan]}</TableCell>
                          <TableCell>
                            <Badge variant={user.payment_status === 'active' ? 'default' : 'secondary'}>
                              {paymentLabel[user.payment_status || 'free'] || user.payment_status || 'free'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  )
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">{text}</div>
}

function formatDate(value?: string) {
  if (!value) return '-'
  return new Date(value).toLocaleString()
}
