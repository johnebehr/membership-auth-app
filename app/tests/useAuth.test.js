import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  authenticateUser,
  getCurrentUser,
  isAuthenticated,
  isRouteProtected,
  loginUser,
  logoutUser,
} from "../composables/useAuth.js";

describe("authenticateUser", () => {
  it("rejects empty credentials", async () => {
    const result = await authenticateUser({ email: "", password: "" });

    expect(result.ok).toBe(false);
    expect(result.message).toContain("Please enter");
  });

  it("rejects invalid credentials", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({
          ok: false,
          message: "Invalid email or password.",
        }),
      }),
    );

    const result = await authenticateUser({
      email: "wrong@example.com",
      password: "nope",
    });

    expect(result.ok).toBe(false);
    expect(result.message).toContain("Invalid");
  });

  it("accepts the demo credentials for the initial experience", async () => {
    const result = await authenticateUser({
      email: "admin@membership.test",
      password: "password123",
    });

    expect(result.ok).toBe(true);
    expect(result.user.name).toBe("Demo Admin");
  });
});

describe("route protection", () => {
  it("treats all non-login routes as protected", () => {
    expect(isRouteProtected("/login")).toBe(false);
    expect(isRouteProtected("/")).toBe(true);
    expect(isRouteProtected("/members")).toBe(true);
  });
});

describe("session flow", () => {
  beforeEach(() => {
    logoutUser();
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("persists the signed-in user after a successful login", async () => {
    const result = await loginUser({
      email: "admin@membership.test",
      password: "password123",
    });

    expect(result.ok).toBe(true);
    expect(getCurrentUser()).toMatchObject({ email: "admin@membership.test" });
    expect(localStorage.getItem("membership-auth")).toContain("Demo Admin");
  });

  it("clears the stored session after logout", async () => {
    await loginUser({
      email: "admin@membership.test",
      password: "password123",
    });
    logoutUser();

    expect(getCurrentUser()).toBeNull();
    expect(localStorage.getItem("membership-auth")).toBeNull();
  });

  it("reports whether the user is currently authenticated", async () => {
    expect(isAuthenticated()).toBe(false);

    await loginUser({
      email: "admin@membership.test",
      password: "password123",
    });

    expect(isAuthenticated()).toBe(true);
  });

  it("logs the user out after 10 minutes of inactivity", async () => {
    await loginUser({
      email: "admin@membership.test",
      password: "password123",
    });

    expect(getCurrentUser()).toMatchObject({ email: "admin@membership.test" });

    vi.advanceTimersByTime(10 * 60 * 1000);

    expect(getCurrentUser()).toBeNull();
    expect(localStorage.getItem("membership-auth")).toBeNull();
  });
  it("uses the real login API when credentials are submitted", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          ok: true,
          user: {
            id: 2,
            name: "API User",
            email: "api@example.com",
          },
        }),
      }),
    );

    const result = await loginUser({
      email: "api@example.com",
      password: "secret123",
    });

    expect(result.ok).toBe(true);
    expect(getCurrentUser()).toMatchObject({ email: "api@example.com" });
  });
});
