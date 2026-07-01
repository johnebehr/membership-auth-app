import { getDatabasePool } from "../../app/server/utils/database.js";
import { validateLocalPayload } from "../utils/locals.js";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const validation = validateLocalPayload(body);

  if (!validation.ok) {
    throw createError({
      statusCode: 400,
      statusMessage: validation.message,
    });
  }

  const pool = await getDatabasePool();
  const { local_number, local_name, created_by, updated_by } = validation.data;

  const [result] = await pool.query(
    `INSERT INTO ref_local (
      local_number,
      local_name,
      created_at,
      created_by,
      updated_at,
      updated_by
    ) VALUES (?, ?, CURRENT_TIMESTAMP(), ?, CURRENT_TIMESTAMP(), ?)`,
    [local_number, local_name, created_by, updated_by],
  );

  const [rows] = await pool.query(
    `SELECT local_id, local_number, local_name, created_at, created_by, updated_at, updated_by
     FROM ref_local
     WHERE local_id = ?
     LIMIT 1`,
    [result.insertId],
  );

  return {
    ok: true,
    local: rows?.[0] || null,
  };
});
