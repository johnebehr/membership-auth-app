import { getDatabasePool } from "../../app/server/utils/database.js";

export default defineEventHandler(async () => {
  const pool = await getDatabasePool();

  const [members] = await pool.query(
    `SELECT central_id, local_number, clock_id, first_name, last_name, name_suffix, full_name, created_at, created_by, updated_at, updated_by
     FROM members
     ORDER BY last_name, first_name, central_id`,
  );

  const [locals] = await pool.query(
    `SELECT local_id, local_number, local_name, created_at, created_by, updated_at, updated_by
     FROM ref_local
     ORDER BY local_number`,
  );

  return {
    ok: true,
    members,
    locals,
  };
});
