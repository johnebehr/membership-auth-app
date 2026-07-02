import { getDatabasePool } from "../utils/database.js";
import { validatePassword, verifyPassword } from "../utils/password.js";

function normalizeLoginIdentifier(identifier) {
  const trimmedIdentifier = identifier?.trim();

  if (!trimmedIdentifier) {
    return { lookup: "", fallback: null };
  }

  if (trimmedIdentifier.includes("@")) {
    return { lookup: trimmedIdentifier, fallback: null };
  }

  const defaultDomain = process.env.DEFAULT_EMAIL_DOMAIN?.trim();

  if (!defaultDomain) {
    return { lookup: trimmedIdentifier, fallback: `${trimmedIdentifier}@%` };
  }

  return { lookup: `${trimmedIdentifier}@${defaultDomain}`, fallback: null };
}

export function buildLoginQuery({ fallback = false } = {}) {
  const baseQuery = `SELECT users.id, users.name, users.email, users.password_hash, users.is_admin, users.auto_logout_minutes
    FROM users
    WHERE users.email = ?`;

  return fallback
    ? `${baseQuery} OR users.email LIKE ? GROUP BY users.id LIMIT 1`
    : `${baseQuery} GROUP BY users.id LIMIT 1`;
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!body?.email?.trim() || !body?.password?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: "Email and password are required.",
    });
  }

  const passwordCheck = validatePassword(body.password);

  if (!passwordCheck.ok) {
    throw createError({
      statusCode: 400,
      statusMessage: passwordCheck.message,
    });
  }

  const pool = await getDatabasePool();
  const { lookup, fallback } = normalizeLoginIdentifier(body.email);
  const query = buildLoginQuery({ fallback });

  const [rows] = await pool.query(
    query,
    fallback ? [lookup, fallback] : [lookup],
  );

  const user = rows?.[0];

  if (!user || !verifyPassword(body.password.trim(), user.password_hash)) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid email or password.",
    });
  }

  return {
    ok: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      is_admin: Boolean(user.is_admin),
      auto_logout_minutes: Number(user.auto_logout_minutes) || 10,
      role: user.is_admin ? "Admin" : "User",
    },
  };
});
