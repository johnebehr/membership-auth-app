import { getDatabasePool } from "../utils/database.js";

export default defineEventHandler(async () => {
  const pool = await getDatabasePool();

  const [rows] = await pool.query(
    `SELECT id, slug, name, description
     FROM user_groups
     ORDER BY name ASC`,
  );

  return {
    ok: true,
    groups: rows,
  };
});
