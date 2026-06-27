const STORAGE_KEY = "membership-auth";
const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000;
const ACTIVITY_EVENTS = [
  "mousemove",
  "keydown",
  "scroll",
  "touchstart",
  "click",
];

let inactivityTimerId = null;
let activityListenersAttached = false;

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

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ user, lastActivity }),
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
  const elapsed = Date.now() - lastActivity;
  const remainingTime = INACTIVITY_TIMEOUT_MS - elapsed;

  clearInactivityTimer();

  if (remainingTime <= 0) {
    logoutUser();
    return;
  }

  inactivityTimerId = window.setTimeout(() => {
    logoutUser();
  }, remainingTime);
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
      },
    };
  }

  if (typeof window === "undefined") {
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
      user: payload.user,
    };
  } catch (error) {
    return {
      ok: false,
      message: error?.message || "Unable to reach the authentication service.",
    };
  }
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

  if (Date.now() - lastActivity >= INACTIVITY_TIMEOUT_MS) {
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

  if (Date.now() - lastActivity >= INACTIVITY_TIMEOUT_MS) {
    logoutUser();
    return null;
  }

  startInactivityTimer();

  return session.user;
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
