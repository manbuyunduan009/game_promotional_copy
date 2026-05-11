import assert from 'node:assert/strict'
import test from 'node:test'
import { getBearerToken, isAdminProfile } from './admin-auth.ts'

test('getBearerToken returns null when authorization header is missing or invalid', () => {
  assert.equal(getBearerToken(undefined), null)
  assert.equal(getBearerToken('Basic abc'), null)
  assert.equal(getBearerToken('Bearer '), null)
})

test('getBearerToken extracts bearer token', () => {
  assert.equal(getBearerToken('Bearer user-access-token'), 'user-access-token')
})

test('isAdminProfile only allows admin role', () => {
  assert.equal(isAdminProfile(null), false)
  assert.equal(isAdminProfile({ id: 'user-1', role: 'user' }), false)
  assert.equal(isAdminProfile({ id: 'user-1', role: 'admin' }), true)
})
