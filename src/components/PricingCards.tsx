import { Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { pricingPlans } from '@/lib/api'

export function PricingCards() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {pricingPlans.map((plan) => (
        <Card key={plan.id} className={plan.highlighted ? 'border-primary shadow-md' : ''}>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>{plan.name}</CardTitle>
              {plan.highlighted ? <Badge>推荐</Badge> : null}
            </div>
            <div className="text-3xl font-semibold">{plan.price}</div>
            <CardDescription>{plan.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-between gap-6">
            <ul className="space-y-3 text-sm">
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-2">
                  <Check className="mt-0.5 size-4 text-emerald-600" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button variant={plan.highlighted ? 'default' : 'outline'}>{plan.id === 'enterprise' ? '联系销售' : '选择套餐'}</Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
