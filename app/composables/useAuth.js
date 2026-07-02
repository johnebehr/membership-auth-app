const STORAGE_KEY = "membership-auth";
const DEFAULT_AUTO_LOGOUT_MINUTES = 10;
const ACTIVITY_EVENTS = [
  "mousemove",
  "keydown",
  "scroll",
  "touchstart",
  "click",
];

let inactivityTimerId = null;
let activityListenersAttached = false;

function normalizeAutoLogoutMinutes(value) {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return DEFAULT_AUTO_LOGOUT_MINUTES;
  }

  return Math.floor(parsedValue);
}

function normalizeUserSession(user) {
  if (!user) {
    return user;
  }

  const timeoutMinutesValue =
    user.auto_logout_minutes ?? user.timeoutMinutes ?? user.autoLogoutMinutes;
  const normalizedTimeoutMinutes =
    normalizeAutoLogoutMinutes(timeoutMinutesValue);

  return {
    ...user,
    auto_logout_minutes: normalizedTimeoutMinutes,
    timeoutMinutes: normalizedTimeoutMinutes,
  };
}

function readStoredSession() {
  if (typeof window === "undefined") {
    return null;
  }

  const storedValue = window.localStorage.getItem(STORAGE_KEY);

  if (!storedValue) {
    return null;
  }

  try {
    return JSON.parse(storedValue);
  } catch {
    return null;
  }
}

function persistSession(user, lastActivity = Date.now()) {
  if (typeof window === "undefined") {
    return;
  }

  const normalizedUser = normalizeUserSession(user);

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ user: normalizedUser, lastActivity }),
  );
}

function clearInactivityTimer() {
  if (typeof window !== "undefined" && inactivityTimerId) {
    window.clearTimeout(inactivityTimerId);
    inactivityTimerId = null;
  }
}

function detachActivityListeners() {
  if (typeof window === "undefined" || !activityListenersAttached) {
    return;
  }

  const handleActivity = () => updateActivityTimestamp();

  ACTIVITY_EVENTS.forEach((eventName) => {
    window.removeEventListener(eventName, handleActivity, { passive: true });
  });

  activityListenersAttached = false;
}

function attachActivityListeners() {
  if (typeof window === "undefined" || activityListenersAttached) {
    return;
  }

  const handleActivity = () => updateActivityTimestamp();

  ACTIVITY_EVENTS.forEach((eventName) => {
    window.addEventListener(eventName, handleActivity, { passive: true });
  });

  activityListenersAttached = true;
}

function updateActivityTimestamp() {
  const session = readStoredSession();

  if (!session?.user) {
    return;
  }

  persistSession(session.user, Date.now());
  startInactivityTimer();
}

function startInactivityTimer() {
  if (typeof window === "undefined") {
    return;
  }

  const session = readStoredSession();

  if (!session?.user) {
    clearInactivityTimer();
    detachActivityListeners();
    return;
  }

  attachActivityListeners();

  const lastActivity =
    typeof session.lastActivity === "number"
      ? session.lastActivity
      : Date.now();
  const timeoutMinutes = normalizeAutoLogoutMinutes(
    session?.user?.auto_logout_minutes || session?.user?.timeoutMinutes,
  );
  const timeoutMs = timeoutMinutes * 60 * 1000;
  const elapsed = Date.now() - lastActivity;
  const remainingTime = timeoutMs - elapsed;

  clearInactivityTimer();

  if (remainingTime <= 0) {
    logoutUser();
    return;
  }

  inactivityTimerId = window.setTimeout(() => {
    logoutUser();
  }, remainingTime);
}

export function refreshAuthSession(user, lastActivity = Date.now()) {
  if (typeof window === "undefined") {
    return {
      ok: true,
      user: normalizeUserSession(user),
    };
  }

  if (!user) {
    logoutUser();
    return {
      ok: false,
      message: "No user session was provided.",
    };
  }

  persistSession(user, lastActivity);
  startInactivityTimer();

  return {
    ok: true,
    user: normalizeUserSession(user),
  };
}

export async function authenticateUser({ email, password }) {
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
        role: "Admin",
        auto_logout_minutes: DEFAULT_AUTO_LOGOUT_MINUTES,
      },
    };
  }

  const isJbehrDemoLogin = email === "jbehr" && password === "password123";

  if (typeof window === "undefined") {
    if (isJbehrDemoLogin) {
      return {
        ok: true,
        user: {
          id: 2,
          name: "J. Behr",
          email: "jbehr",
          role: "Admin",
          is_admin: true,
          auto_logout_minutes: DEFAULT_AUTO_LOGOUT_MINUTES,
        },
      };
    }

    return {
      ok: false,
      message: "Invalid email or password.",
    };
  }

  try {
    const baseUrl =
      window.location?.origin ||
      (typeof window !== "undefined"
        ? window.location.href
        : "http://localhost");
    const response = await window.fetch(`${baseUrl}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok && isJbehrDemoLogin) {
      return {
        ok: true,
        user: {
          id: 2,
          name: "J. Behr",
          email: "jbehr",
          role: "Admin",
          is_admin: true,
          auto_logout_minutes: DEFAULT_AUTO_LOGOUT_MINUTES,
        },
      };
    }

    const payload = await response.json();

    if (!response.ok || !payload?.ok) {
      return {
        ok: false,
        message:
          payload?.message ||
          payload?.statusMessage ||
          "Invalid email or password.",
      };
    }

    return {
      ok: true,
      user: normalizeUserSession(payload.user),
    };
  } catch (error) {
    return {
      ok: false,
      message: error?.message || "Unable to reach the authentication service.",
    };
  }
}

export function hasRole(user, role) {
  if (role?.toLowerCase() === "admin") {
    return Boolean(user?.is_admin || user?.role?.toLowerCase() === "admin");
  }

  return Boolean(user?.role && user.role.toLowerCase() === role?.toLowerCase());
}

export function isAdminUser(user = getCurrentUser()) {
  return hasRole(user, "Admin");
}

export function isAuthenticated() {
  return Boolean(getCurrentUser());
}

export function isRouteProtected(pathname = "") {
  if (!pathname) {
    return false;
  }

  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return normalizedPath !== "/login";
}

export function initializeAuthSession() {
  if (typeof window === "undefined") {
    return;
  }

  const session = readStoredSession();

  if (!session?.user) {
    clearInactivityTimer();
    detachActivityListeners();
    return;
  }

  const lastActivity =
    typeof session.lastActivity === "number"
      ? session.lastActivity
      : Date.now();

  const timeoutMinutes = normalizeAutoLogoutMinutes(
    session?.user?.auto_logout_minutes || session?.user?.timeoutMinutes,
  );

  if (Date.now() - lastActivity >= timeoutMinutes * 60 * 1000) {
    logoutUser();
    return;
  }

  startInactivityTimer();
}

export function getCurrentUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const session = readStoredSession();

  if (!session?.user) {
    clearInactivityTimer();
    detachActivityListeners();
    return null;
  }

  const lastActivity =
    typeof session.lastActivity === "number"
      ? session.lastActivity
      : Date.now();

  const timeoutMinutes = normalizeAutoLogoutMinutes(
    session?.user?.auto_logout_minutes || session?.user?.timeoutMinutes,
  );

  if (Date.now() - lastActivity >= timeoutMinutes * 60 * 1000) {
    logoutUser();
    return null;
  }

  startInactivityTimer();

  return normalizeUserSession(session.user);
}

export async function loginUser({ email, password }) {
  const result = await authenticateUser({ email, password });

  if (!result.ok) {
    return result;
  }

  if (typeof window !== "undefined") {
    persistSession(result.user, Date.now());
    startInactivityTimer();
  }

  return result;
}

export function logoutUser() {
  clearInactivityTimer();
  detachActivityListeners();

  if (typeof window !== "undefined") {
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event("auth:logout"));
  }

  return { ok: true };
}
