import { useEffect, useMemo, useState } from 'react'
import { AdminLayout } from '@/components/AdminLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { loadAdminOverview, type AdminGenerationRecord } from '@/lib/api'
import type { Plan, Profile } from '@/types'

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
  const [selectedRecord, setSelectedRecord] = useState<AdminGenerationRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function loadAdminData() {
      setLoading(true)
      setErrorMessage('')

      try {
        const overview = await loadAdminOverview()
        setUsers(overview.users)
        setRecords(overview.records)
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : '后台数据加载失败。')
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
                        <TableHead>操作</TableHead>
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
                          <TableCell>
                            <Button variant="outline" size="sm" onClick={() => setSelectedRecord(record)}>
                              查看
                            </Button>
                          </TableCell>
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
      <GenerationDetailDialog record={selectedRecord} onOpenChange={(open) => (!open ? setSelectedRecord(null) : undefined)} />
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

function GenerationDetailDialog({ record, onOpenChange }: { record: AdminGenerationRecord | null; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={Boolean(record)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[86vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>生成记录详情</DialogTitle>
          <DialogDescription>查看本次生成的用户、输入、输出、耗时和 token 用量。</DialogDescription>
        </DialogHeader>
        {record ? (
          <div className="space-y-5">
            <div className="grid gap-3 rounded-lg border bg-muted/30 p-4 text-sm sm:grid-cols-2">
              <DetailItem label="用户" value={record.userEmail || record.user_id} />
              <DetailItem label="状态" value={record.status === 'success' ? '成功' : '失败'} />
              <DetailItem label="产品名" value={record.product_name} />
              <DetailItem label="渠道" value={record.publishing_channel} />
              <DetailItem label="用途" value={record.purpose || '-'} />
              <DetailItem label="模型" value={record.model} />
              <DetailItem label="耗时" value={record.latency_ms ? `${record.latency_ms}ms` : '-'} />
              <DetailItem label="Token" value={record.total_tokens === null ? '-' : String(record.total_tokens)} />
              <DetailItem label="创建时间" value={formatDate(record.created_at)} />
            </div>

            <section className="space-y-2">
              <h2 className="text-sm font-semibold">输入信息</h2>
              <div className="grid gap-3 rounded-lg border p-4 text-sm">
                <DetailItem label="产品描述" value={record.description} multiline />
                <DetailItem label="目标受众" value={record.target_audience} />
                <DetailItem label="核心卖点" value={record.selling_points} multiline />
                <DetailItem label="游戏类型" value={record.game_type || '-'} />
                <DetailItem label="题材" value={record.genre || '-'} />
                <DetailItem label="风格" value={record.style || '-'} />
                <DetailItem label="活动 / 版本信息" value={record.campaign_info || '-'} multiline />
              </div>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-semibold">{record.status === 'success' ? '生成结果' : '失败原因'}</h2>
              <pre className="whitespace-pre-wrap rounded-lg border bg-slate-50 p-4 text-sm leading-7">
                {record.output || record.error_message || '没有可展示内容'}
              </pre>
            </section>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function DetailItem({ label, value, multiline = false }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div className={multiline ? 'sm:col-span-2' : ''}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 break-words font-medium">{value}</div>
    </div>
  )
}
