import { getDatabasePool } from "../utils/database.js";

export default defineEventHandler(async () => {
  const pool = await getDatabasePool();

  const [userRows] = await pool.query(
    `SELECT users.id, users.name, users.email, users.created_at,
            GROUP_CONCAT(user_groups.id ORDER BY user_groups.name SEPARATOR ',') AS group_ids,
            GROUP_CONCAT(user_groups.slug ORDER BY user_groups.name SEPARATOR ',') AS group_slugs,
            GROUP_CONCAT(user_groups.name ORDER BY user_groups.name SEPARATOR ',') AS group_names
     FROM users
     LEFT JOIN user_group_memberships ON user_group_memberships.user_id = users.id
     LEFT JOIN user_groups ON user_groups.id = user_group_memberships.group_id
     GROUP BY users.id
     ORDER BY users.last_name ASC, users.first_name ASC, users.created_at DESC`,
  );

  const [groupRows] = await pool.query(
    `SELECT ug.id, ug.name
     FROM user_groups ug
     ORDER BY ug.name ASC`,
  );

  return {
    ok: true,
    users: userRows.map((user) => ({
      ...user,
      group_ids: user.group_ids
        ? user.group_ids.split(",").map((groupId) => Number(groupId))
        : [],
      group_slugs: user.group_slugs ? user.group_slugs.split(",") : [],
      group_names: user.group_names ? user.group_names.split(",") : [],
    })),
    groups: groupRows,
  };
});
