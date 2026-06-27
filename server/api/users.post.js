import { getDatabasePool } from "../utils/database.js";
import {
  hashPassword,
  validatePassword,
} from "../../app/server/utils/password.js";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!body?.name?.trim() || !body?.email?.trim() || !body?.password?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: "Name, email, and password are required.",
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
  const normalizedGroupId = body.group_id ? Number(body.group_id) : null;

  if (body.group_id && Number.isNaN(normalizedGroupId)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Group selection is invalid.",
    });
  }

  const passwordHash = hashPassword(body.password.trim());

  const [insertResult] = await pool.query(
    "INSERT INTO users (name, email, password_hash, group_id, created_at, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP())",
    [body.name.trim(), body.email.trim(), passwordHash, normalizedGroupId],
  );

  const [rows] = await pool.query(
    `SELECT users.id, users.name, users.email, users.group_id, user_groups.slug AS group_slug, user_groups.name AS group_name
     FROM users
     LEFT JOIN user_groups ON user_groups.id = users.group_id
     WHERE users.id = ?
     LIMIT 1`,
    [insertResult.insertId],
  );

  return {
    ok: true,
    user: rows?.[0] || {
      id: insertResult.insertId,
      name: body.name.trim(),
      email: body.email.trim(),
      group_id: normalizedGroupId,
      group_slug: null,
      group_name: null,
    },
  };
});
