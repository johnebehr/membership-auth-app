import { getDatabasePool } from "../utils/database.js";
import { hashPassword, validatePassword } from "../utils/password.js";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const firstName = body?.first_name?.trim();
  const lastName = body?.last_name?.trim();

  if (
    !firstName ||
    !lastName ||
    !body?.email?.trim() ||
    !body?.password?.trim()
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: "First name, last name, email, and password are required.",
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
  const isAdmin = Boolean(body?.is_admin);
  const autoLogoutMinutes = Number(body?.auto_logout_minutes);
  const normalizedAutoLogoutMinutes =
    Number.isFinite(autoLogoutMinutes) && autoLogoutMinutes > 0
      ? Math.floor(autoLogoutMinutes)
      : 10;
  const passwordHash = hashPassword(body.password.trim());

  const [insertResult] = await pool.query(
    "INSERT INTO users (first_name, last_name, email, password_hash, is_admin, auto_logout_minutes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP())",
    [
      firstName,
      lastName,
      body.email.trim(),
      passwordHash,
      isAdmin ? 1 : 0,
      normalizedAutoLogoutMinutes,
    ],
  );

  const [rows] = await pool.query(
    `SELECT users.id, users.name, users.email, users.is_admin, users.auto_logout_minutes
     FROM users
     WHERE users.id = ?
     LIMIT 1`,
    [insertResult.insertId],
  );

  const user = rows?.[0];

  return {
    ok: true,
    user: user
      ? {
          id: user.id,
          name: user.name,
          email: user.email,
          is_admin: Boolean(user.is_admin),
          auto_logout_minutes: Number(user.auto_logout_minutes) || 10,
        }
      : {
          id: insertResult.insertId,
          name: `${firstName} ${lastName}`.trim(),
          email: body.email.trim(),
          is_admin: isAdmin,
          auto_logout_minutes: normalizedAutoLogoutMinutes,
        },
  };
});
