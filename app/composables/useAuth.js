export function authenticateUser({ email, password }) {
  if (!email?.trim() || !password?.trim()) {
    return {
      ok: false,
      message: 'Please enter both email and password.',
    }
  }

  if (email === 'admin@membership.test' && password === 'password123') {
    return {
      ok: true,
      user: {
        id: 1,
        name: 'Demo Admin',
        email,
      },
    }
  }

  return {
    ok: false,
    message: 'Invalid email or password.',
  }
}
