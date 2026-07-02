export function getGroupCapabilities(isAdmin = false) {
  return isAdmin
    ? {
        canManageUsers: true,
        canManageMemberships: true,
        canViewLookup: true,
      }
    : {
        canManageUsers: false,
        canManageMemberships: false,
        canViewLookup: false,
      };
}
