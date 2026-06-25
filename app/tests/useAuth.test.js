import { describe, expect, it } from 'vitest'
import { authenticateUser } from '../composables/useAuth.js'

describe('authenticateUser', () => {
  it('rejects empty credentials', () => {
    const result = authenticateUser({ email: '', password: '' })

    expect(result.ok).toBe(false)
    expect(result.message).toContain('Please enter')
  })

  it('rejects invalid credentials', () => {
    const result = authenticateUser({ email: 'wrong@example.com', password: 'nope' })

    expect(result.ok).toBe(false)
    expect(result.message).toContain('Invalid')
  })

  it('accepts the demo credentials for the initial experience', () => {
    const result = authenticateUser({ email: 'admin@membership.test', password: 'password123' })

    expect(result.ok).toBe(true)
    expect(result.user.name).toBe('Demo Admin')
  })
})
