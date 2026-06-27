import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export function validatePassword(password) {
  if (typeof password !== "string") {
    return {
      ok: false,
      message: "Password is required.",
    };
  }

  const trimmedPassword = password.trim();

  if (trimmedPassword.length < 15 || trimmedPassword.length > 32) {
    return {
      ok: false,
      message: "Password must be between 15 and 32 characters.",
    };
  }

  if (!/[A-Z]/.test(trimmedPassword)) {
    return {
      ok: false,
      message: "Password must include at least one uppercase letter.",
    };
  }

  if (!/[a-z]/.test(trimmedPassword)) {
    return {
      ok: false,
      message: "Password must include at least one lowercase letter.",
    };
  }

  if (!/[0-9]/.test(trimmedPassword)) {
    return {
      ok: false,
      message: "Password must include at least one number.",
    };
  }

  return { ok: true };
}

export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, 64).toString("hex");

  return `scrypt$${salt}$${derivedKey}`;
}

export function verifyPassword(password, storedHash) {
  if (typeof password !== "string" || typeof storedHash !== "string") {
    return false;
  }

  if (!storedHash.startsWith("scrypt$")) {
    return storedHash === password;
  }

  const [, salt, expectedHash] = storedHash.split("$");

  if (!salt || !expectedHash) {
    return false;
  }

  const derivedKey = scryptSync(password, salt, 64);
  const expectedKey = Buffer.from(expectedHash, "hex");

  if (derivedKey.length !== expectedKey.length) {
    return false;
  }

  return timingSafeEqual(derivedKey, expectedKey);
}
