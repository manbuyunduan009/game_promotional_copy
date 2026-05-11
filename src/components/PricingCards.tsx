import { Button, Card, Chip } from '@heroui/react'
import { Check } from 'lucide-react'
import { pricingPlans } from '@/lib/api'

export function PricingCards() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {pricingPlans.map((plan) => (
        <Card
          key={plan.id}
          className={[
            'h-full border border-[#e6deca] bg-white/86 p-6 shadow-[0_20px_60px_rgba(18,35,47,0.08)] backdrop-blur',
            plan.highlighted ? 'border-[#12232f] bg-[#12232f] text-[#f8f2df] shadow-[0_24px_80px_rgba(18,35,47,0.24)]' : '',
          ].join(' ')}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <p className={plan.highlighted ? 'mt-3 text-sm leading-6 text-[#d9e6df]' : 'mt-3 text-sm leading-6 text-[#66717f]'}>{plan.description}</p>
              </div>
              {plan.highlighted ? (
                <Chip size="sm" className="bg-[#f7c948] text-[#17212b]">
                  推荐
                </Chip>
              ) : null}
            </div>
            <div className="mt-6 text-3xl font-semibold">{plan.price}</div>
            <ul className="mt-6 flex-1 space-y-3 text-sm">
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-2">
                  <Check className={plan.highlighted ? 'mt-0.5 size-4 text-[#79e7b4]' : 'mt-0.5 size-4 text-emerald-600'} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button className={plan.highlighted ? 'mt-7 bg-[#f8f2df] text-[#12232f]' : 'mt-7 border border-[#d9cfb5] bg-white text-[#12232f]'}>
              {plan.id === 'enterprise' ? '联系销售' : '选择套餐'}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}
