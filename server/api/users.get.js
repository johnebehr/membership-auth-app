import { getDatabasePool } from "../utils/database.js";

export default defineEventHandler(async () => {
  const pool = await getDatabasePool();

  const [userRows] = await pool.query(
    `SELECT users.id, users.name, users.email, users.is_admin, users.auto_logout_minutes, users.created_at
     FROM users
     ORDER BY users.last_name ASC, users.first_name ASC, users.created_at DESC`,
  );

  return {
    ok: true,
    users: userRows.map((user) => ({
      ...user,
      is_admin: Boolean(user.is_admin),
      auto_logout_minutes: Number(user.auto_logout_minutes) || 10,
    })),
  };
});
