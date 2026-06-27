import { getDatabasePool } from "../utils/database.js";

export default defineEventHandler(async () => {
  const pool = await getDatabasePool();

  const [rows] = await pool.query(
    `SELECT users.id, users.name, users.email, users.created_at, user_groups.slug AS group_slug, user_groups.name AS group_name
     FROM users
     LEFT JOIN user_groups ON user_groups.id = users.group_id
     ORDER BY users.created_at DESC`,
  );

  return {
    ok: true,
    users: rows,
  };
});
