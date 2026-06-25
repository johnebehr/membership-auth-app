import { beforeEach, describe, expect, it } from "vitest";
import {
  authenticateUser,
  getCurrentUser,
  loginUser,
  logoutUser,
} from "../composables/useAuth.js";

describe("authenticateUser", () => {
  it("rejects empty credentials", () => {
    const result = authenticateUser({ email: "", password: "" });

    expect(result.ok).toBe(false);
    expect(result.message).toContain("Please enter");
  });

  it("rejects invalid credentials", () => {
    const result = authenticateUser({
      email: "wrong@example.com",
      password: "nope",
    });

    expect(result.ok).toBe(false);
    expect(result.message).toContain("Invalid");
  });

  it("accepts the demo credentials for the initial experience", () => {
    const result = authenticateUser({
      email: "admin@membership.test",
      password: "password123",
    });

    expect(result.ok).toBe(true);
    expect(result.user.name).toBe("Demo Admin");
  });
});

describe("session flow", () => {
  beforeEach(() => {
    logoutUser();
    localStorage.clear();
  });

  it("persists the signed-in user after a successful login", () => {
    const result = loginUser({
      email: "admin@membership.test",
      password: "password123",
    });

    expect(result.ok).toBe(true);
    expect(getCurrentUser()).toMatchObject({ email: "admin@membership.test" });
    expect(localStorage.getItem("membership-auth")).toContain("Demo Admin");
  });

  it("clears the stored session after logout", () => {
    loginUser({ email: "admin@membership.test", password: "password123" });
    logoutUser();

    expect(getCurrentUser()).toBeNull();
    expect(localStorage.getItem("membership-auth")).toBeNull();
  });
});
