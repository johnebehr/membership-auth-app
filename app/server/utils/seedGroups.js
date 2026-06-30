import { getDatabasePool } from "./database.js";

export async function seedGroups() {
  const pool = await getDatabasePool();
  const groups = [
    {
      slug: "admin",
      name: "Admin",
      description: "Can manage users and membership workflows",
    },
    {
      slug: "membership",
      name: "Membership",
      description: "Can manage memberships but cannot create new users",
    },
    {
      slug: "organizer",
      name: "Organizer",
      description: "Lookup-only access",
    },
    {
      slug: "leader",
      name: "Leadership",
      description: "Can view membership reports and look up users",
    },
    {
      slug: "acct",
      name: "Accounting",
      description: "Can manage financial activities",
    },
  ];

  for (const group of groups) {
    await pool.query(
      "INSERT INTO user_groups (slug, name, description) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description)",
      [group.slug, group.name, group.description],
    );
  }
}
