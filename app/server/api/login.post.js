import { getDatabasePool } from "../utils/database.js";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!body?.email?.trim() || !body?.password?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: "Email and password are required.",
    });
  }

  const pool = await getDatabasePool();
  const [rows] = await pool.query(
    `SELECT users.id, users.name, users.email, users.password_hash, users.group_id, user_groups.slug AS group_slug, user_groups.name AS group_name
     FROM users
     LEFT JOIN user_groups ON user_groups.id = users.group_id
     WHERE users.email = ?
     LIMIT 1`,
    [body.email.trim()],
  );

  const user = rows?.[0];

  if (!user || user.password_hash !== body.password.trim()) {
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
      group_id: user.group_id,
      group_slug: user.group_slug,
      group_name: user.group_name,
    },
  };
});
