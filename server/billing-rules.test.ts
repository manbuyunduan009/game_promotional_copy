import assert from 'node:assert/strict'
import test from 'node:test'
import { getGenerationQuota } from './billing-rules.ts'

test('free users are limited by the daily free limit', () => {
  assert.deepEqual(getGenerationQuota({ plan: 'free', paymentStatus: 'free', used: 2, freeLimit: 3 }), {
    plan: 'free',
    paymentStatus: 'free',
    limit: 3,
    used: 2,
    remaining: 1,
    hasUnlimitedUsage: false,
  })
})

test('free users have zero remaining usage after reaching the daily limit', () => {
  assert.equal(getGenerationQuota({ plan: 'free', paymentStatus: 'free', used: 4, freeLimit: 3 }).remaining, 0)
})

test('active pro users have unlimited usage', () => {
  assert.deepEqual(getGenerationQuota({ plan: 'pro', paymentStatus: 'active', used: 99, freeLimit: 3 }), {
    plan: 'pro',
    paymentStatus: 'active',
    limit: null,
    used: 99,
    remaining: null,
    hasUnlimitedUsage: true,
  })
})

test('enterprise users have unlimited usage', () => {
  assert.equal(getGenerationQuota({ plan: 'enterprise', paymentStatus: 'free', used: 99, freeLimit: 3 }).hasUnlimitedUsage, true)
})
