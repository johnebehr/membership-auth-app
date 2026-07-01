import { getDatabasePool } from "../../app/server/utils/database.js";

export default defineEventHandler(async () => {
  const pool = await getDatabasePool();
  const [rows] = await pool.query(
    `SELECT local_id, local_number, local_name, created_at, created_by, updated_at, updated_by
     FROM ref_local
     ORDER BY local_number`,
  );

  return {
    ok: true,
    locals: rows,
  };
});
