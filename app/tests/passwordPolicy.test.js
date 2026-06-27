import { describe, expect, it } from "vitest";
import {
  hashPassword,
  validatePassword,
  verifyPassword,
} from "../server/utils/password.js";

describe("validatePassword", () => {
  it("rejects passwords shorter than 15 characters", () => {
    const result = validatePassword("Short123");

    expect(result.ok).toBe(false);
    expect(result.message).toContain("between 15 and 32 characters");
  });

  it("rejects passwords that do not include uppercase, lowercase, and a number", () => {
    const result = validatePassword("alllowercase123");

    expect(result.ok).toBe(false);
    expect(result.message).toContain("uppercase");
  });

  it("accepts a password that meets the stronger policy", () => {
    const result = validatePassword("StrongPassword123!");

    expect(result.ok).toBe(true);
  });

  it("hashes and verifies passwords securely", async () => {
    const hashed = hashPassword("StrongPassword123!");
    const isValid = verifyPassword("StrongPassword123!", hashed);

    expect(hashed).not.toBe("StrongPassword123!");
    expect(isValid).toBe(true);
  });
});
