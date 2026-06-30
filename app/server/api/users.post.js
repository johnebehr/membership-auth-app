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
  const groupIds = Array.isArray(body.group_ids)
    ? body.group_ids
        .map((groupId) => Number(groupId))
        .filter((groupId) => Number.isInteger(groupId) && groupId > 0)
    : [];

  if (body.group_ids && !groupIds.length) {
    throw createError({
      statusCode: 400,
      statusMessage: "Group selection is invalid.",
    });
  }

  const passwordHash = hashPassword(body.password.trim());

  const [insertResult] = await pool.query(
    "INSERT INTO users (first_name, last_name, email, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP())",
    [firstName, lastName, body.email.trim(), passwordHash],
  );

  if (groupIds.length) {
    const membershipValues = groupIds.map((groupId) => [
      insertResult.insertId,
      groupId,
    ]);
    await pool.query(
      "INSERT INTO user_group_memberships (user_id, group_id) VALUES ?",
      [membershipValues],
    );
  }

  const [rows] = await pool.query(
    `SELECT users.id, users.name, users.email,
            GROUP_CONCAT(user_groups.id ORDER BY user_groups.name SEPARATOR ',') AS group_ids,
            GROUP_CONCAT(user_groups.name ORDER BY user_groups.name SEPARATOR ',') AS group_names,
            GROUP_CONCAT(user_groups.slug ORDER BY user_groups.name SEPARATOR ',') AS group_slugs
     FROM users
     LEFT JOIN user_group_memberships ON user_group_memberships.user_id = users.id
     LEFT JOIN user_groups ON user_groups.id = user_group_memberships.group_id
     WHERE users.id = ?
     GROUP BY users.id
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
          group_ids: user.group_ids
            ? user.group_ids.split(",").map((groupId) => Number(groupId))
            : [],
          group_names: user.group_names ? user.group_names.split(",") : [],
          group_slugs: user.group_slugs ? user.group_slugs.split(",") : [],
        }
      : {
          id: insertResult.insertId,
          name: `${firstName} ${lastName}`.trim(),
          email: body.email.trim(),
          group_ids: [],
          group_names: [],
          group_slugs: [],
        },
  };
});
