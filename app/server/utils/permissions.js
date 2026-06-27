export function getGroupCapabilities(groupSlug = "") {
  const normalizedGroup = String(groupSlug || "").toLowerCase();

  switch (normalizedGroup) {
    case "admin":
      return {
        canManageUsers: true,
        canManageMemberships: true,
        canViewLookup: true,
      };
    case "membership":
      return {
        canManageUsers: false,
        canManageMemberships: true,
        canViewLookup: true,
      };
    case "organizer":
      return {
        canManageUsers: false,
        canManageMemberships: false,
        canViewLookup: true,
      };
    default:
      return {
        canManageUsers: false,
        canManageMemberships: false,
        canViewLookup: false,
      };
  }
}
