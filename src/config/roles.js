export const USER_ROLES = Object.freeze({
  NGO: "ngo",
  VOLUNTEER: "volunteer",
  COORDINATOR: "coordinator",
});

export const ROLE_HOME_ROUTES = Object.freeze({
  [USER_ROLES.NGO]: "/ngo/dashboard",
  [USER_ROLES.VOLUNTEER]: "/volunteer/dashboard",
  [USER_ROLES.COORDINATOR]: "/coordinator/dashboard",
});

export const ROLE_ROUTE_PREFIXES = Object.freeze({
  [USER_ROLES.NGO]: "/ngo",
  [USER_ROLES.VOLUNTEER]: "/volunteer",
  [USER_ROLES.COORDINATOR]: "/coordinator",
});

export function getRoleHomeRoute(role) {
  return ROLE_HOME_ROUTES[role] ?? "/login";
}

export function canRoleAccessPath(
  role,
  pathname = "",
) {
  const prefix = ROLE_ROUTE_PREFIXES[role];

  return Boolean(
    prefix &&
      typeof pathname === "string" &&
      pathname.startsWith(prefix),
  );
}
