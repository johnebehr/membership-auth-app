import { getDatabasePool } from "../../utils/database.js";
import { hashPassword, validatePassword } from "../../utils/password.js";

export default defineEventHandler(async (event) => {
  const id = event.context?.params?.id;
  const body = await readBody(event);

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "User id is required.",
    });
  }

  const firstName = body?.first_name?.trim();
  const lastName = body?.last_name?.trim();
  const email = body?.email?.trim();
  const password = body?.password?.trim();
  const isAdmin = Boolean(body?.is_admin);
  const autoLogoutMinutes = Number(body?.auto_logout_minutes);
  const normalizedAutoLogoutMinutes =
    Number.isFinite(autoLogoutMinutes) && autoLogoutMinutes > 0
      ? Math.floor(autoLogoutMinutes)
      : 10;

  if (!firstName || !lastName || !email) {
    throw createError({
      statusCode: 400,
      statusMessage: "First name, last name, and email are required.",
    });
  }

  if (body?.password && password) {
    const passwordCheck = validatePassword(password);

    if (!passwordCheck.ok) {
      throw createError({
        statusCode: 400,
        statusMessage: passwordCheck.message,
      });
    }
  }

  const pool = await getDatabasePool();

  if (body?.password && password) {
    const passwordHash = hashPassword(password);
    await pool.query(
      "UPDATE users SET first_name = ?, last_name = ?, email = ?, password_hash = ?, is_admin = ?, auto_logout_minutes = ? WHERE id = ?",
      [
        firstName,
        lastName,
        email,
        passwordHash,
        isAdmin ? 1 : 0,
        normalizedAutoLogoutMinutes,
        id,
      ],
    );
  } else {
    await pool.query(
      "UPDATE users SET first_name = ?, last_name = ?, email = ?, is_admin = ?, auto_logout_minutes = ? WHERE id = ?",
      [
        firstName,
        lastName,
        email,
        isAdmin ? 1 : 0,
        normalizedAutoLogoutMinutes,
        id,
      ],
    );
  }

  const [rows] = await pool.query(
    `SELECT users.id, users.name, users.email, users.is_admin, users.auto_logout_minutes
     FROM users
     WHERE users.id = ?
     LIMIT 1`,
    [id],
  );

  return {
    ok: true,
    user: rows?.[0]
      ? {
          id: rows[0].id,
          name: rows[0].name,
          email: rows[0].email,
          is_admin: Boolean(rows[0].is_admin),
          auto_logout_minutes: Number(rows[0].auto_logout_minutes) || 10,
        }
      : null,
  };
});
