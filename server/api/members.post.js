import { getDatabasePool } from "../../app/server/utils/database.js";
import {
  generateClockId,
  validateMemberPayload,
} from "../../app/server/utils/members.js";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const validation = validateMemberPayload(body);

  if (!validation.ok) {
    throw createError({
      statusCode: 400,
      statusMessage: validation.message,
    });
  }

  const pool = await getDatabasePool();
  const { first_name, last_name, local_number, created_by, updated_by } =
    validation.data;
  const clockId = generateClockId();

  const [localRows] = await pool.query(
    `SELECT local_number FROM ref_local WHERE local_number = ? LIMIT 1`,
    [local_number],
  );

  if (!localRows.length) {
    throw createError({
      statusCode: 400,
      statusMessage: "The selected local number is not available.",
    });
  }

  const [result] = await pool.query(
    `INSERT INTO members (
      local_number,
      clock_id,
      first_name,
      last_name,
      created_at,
      created_by,
      updated_at,
      updated_by
    ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP(), ?, CURRENT_TIMESTAMP(), ?)`,
    [local_number, clockId, first_name, last_name, created_by, updated_by],
  );

  const [rows] = await pool.query(
    `SELECT central_id, local_number, clock_id, first_name, last_name, name_suffix, full_name, created_at, created_by, updated_at, updated_by
     FROM members
     WHERE central_id = ?
     LIMIT 1`,
    [result.insertId],
  );

  return {
    ok: true,
    member: rows?.[0] || null,
  };
});
