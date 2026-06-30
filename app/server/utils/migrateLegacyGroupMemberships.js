import { getDatabasePool } from "./database.js";

export async function migrateLegacyGroupMemberships({
  defaultGroupSlug = "membership",
  groupSlugs = [],
  userEmails = [],
  userIds = [],
} = {}) {
  const pool = await getDatabasePool();

  const requestedSlugs = Array.from(
    new Set([...(groupSlugs.length ? groupSlugs : [defaultGroupSlug])]),
  );

  const [groupRows] = await pool.query(
    `SELECT id, slug FROM user_groups WHERE slug IN (${requestedSlugs
      .map(() => "?")
      .join(",")})`,
    requestedSlugs,
  );

  if (!groupRows?.length) {
    return { created: 0, skipped: 0 };
  }

  const targetGroupIds = groupRows
    .map((group) => group.id)
    .filter((groupId) => Number.isInteger(groupId));

  if (!targetGroupIds.length) {
    return { created: 0, skipped: 0 };
  }

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

  const userIdsToProcess = users.map((user) => user.id);
  const userPlaceholders = userIdsToProcess.map(() => "?").join(",");
  const groupPlaceholders = targetGroupIds.map(() => "?").join(",");
  const [existingRows] = await pool.query(
    `SELECT user_id, group_id FROM user_group_memberships WHERE user_id IN (${userPlaceholders}) AND group_id IN (${groupPlaceholders})`,
    [...userIdsToProcess, ...targetGroupIds],
  );

  const existingKeys = new Set(
    (existingRows || []).map((row) => `${row.user_id}:${row.group_id}`),
  );
  const values = [];

  for (const user of users) {
    for (const groupId of targetGroupIds) {
      const key = `${user.id}:${groupId}`;
      if (!existingKeys.has(key)) {
        values.push([user.id, groupId]);
        existingKeys.add(key);
      }
    }
  }

  if (!values.length) {
    return { created: 0, skipped: 0 };
  }

  await pool.query(
    "INSERT INTO user_group_memberships (user_id, group_id) VALUES ?",
    [values],
  );

  return { created: values.length, skipped: 0 };
}
