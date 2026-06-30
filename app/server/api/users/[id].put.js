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
  const groupIds = Array.isArray(body?.group_ids)
    ? body.group_ids
        .map((groupId) => Number(groupId))
        .filter((groupId) => Number.isInteger(groupId) && groupId > 0)
    : [];

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
      "UPDATE users SET first_name = ?, last_name = ?, email = ?, password_hash = ? WHERE id = ?",
      [firstName, lastName, email, passwordHash, id],
    );
  } else {
    await pool.query(
      "UPDATE users SET first_name = ?, last_name = ?, email = ? WHERE id = ?",
      [firstName, lastName, email, id],
    );
  }

  await pool.query("DELETE FROM user_group_memberships WHERE user_id = ?", [
    id,
  ]);

  if (groupIds.length) {
    const membershipValues = groupIds.map((groupId) => [id, groupId]);
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
    [id],
  );

  return {
    ok: true,
    user: rows?.[0]
      ? {
          id: rows[0].id,
          name: rows[0].name,
          email: rows[0].email,
          group_ids: rows[0].group_ids
            ? rows[0].group_ids.split(",").map((groupId) => Number(groupId))
            : [],
          group_names: rows[0].group_names
            ? rows[0].group_names.split(",")
            : [],
          group_slugs: rows[0].group_slugs
            ? rows[0].group_slugs.split(",")
            : [],
        }
      : null,
  };
});
