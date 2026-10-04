import {
  Navigate,
  Outlet,
} from "react-router-dom";

import useAuth from "../../hooks/useAuth.js";
import {
  getRoleHomeRoute,
} from "../../config/roles.js";

export default function RoleGuard({
  allowedRoles,
}) {
  const { user } = useAuth();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <Navigate
        to={getRoleHomeRoute(user.role)}
        replace
      />
    );
  }

  return <Outlet />;
}
