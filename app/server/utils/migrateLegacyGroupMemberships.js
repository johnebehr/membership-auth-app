import { getDatabasePool } from "./database.js";

export async function migrateLegacyAdminFlags({
  userEmails = [],
  userIds = [],
  is_admin = false,
} = {}) {
  const pool = await getDatabasePool();

  let userQuery = "SELECT u.id FROM users u";
  const queryParams = [];

  if (userEmails.length) {
    userQuery += ` WHERE u.email IN (${userEmails.map(() => "?").join(",")})`;
    queryParams.push(...userEmails);
  } else if (userIds.length) {
    userQuery += ` WHERE u.id IN (${userIds.map(() => "?").join(",")})`;
    queryParams.push(...userIds);
  }

  const [users] = await pool.query(userQuery, queryParams);

  if (!users?.length) {
    return { created: 0, skipped: 0 };
  }

  for (const user of users) {
    await pool.query("UPDATE users SET is_admin = ? WHERE id = ?", [
      is_admin ? 1 : 0,
      user.id,
    ]);
  }

  return { created: users.length, skipped: 0 };
}
