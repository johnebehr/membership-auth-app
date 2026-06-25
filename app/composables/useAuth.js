const STORAGE_KEY = "membership-auth";

export function authenticateUser({ email, password }) {
  if (!email?.trim() || !password?.trim()) {
    return {
      ok: false,
      message: "Please enter both email and password.",
    };
  }

  if (email === "admin@membership.test" && password === "password123") {
    return {
      ok: true,
      user: {
        id: 1,
        name: "Demo Admin",
        email,
      },
    };
  }

  return {
    ok: false,
    message: "Invalid email or password.",
  };
}

export function getCurrentUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const storedUser = window.localStorage.getItem(STORAGE_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch {
    return null;
  }
}

export function loginUser({ email, password }) {
  const result = authenticateUser({ email, password });

  if (!result.ok) {
    return result;
  }

  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(result.user));
  }

  return result;
}

export function logoutUser() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(STORAGE_KEY);
  }

  return { ok: true };
}
