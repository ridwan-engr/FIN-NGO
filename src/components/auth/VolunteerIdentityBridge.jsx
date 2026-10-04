import { useEffect } from "react";

import useAuth from "../../hooks/useAuth.js";
import useVolunteers from "../../hooks/useVolunteers.js";

export default function VolunteerIdentityBridge() {
  const { user } = useAuth();

  const {
    ensureVolunteerForUser,
  } = useVolunteers();

  useEffect(() => {
    if (user?.role === "volunteer") {
      ensureVolunteerForUser(user);
    }
  }, [
    user,
    ensureVolunteerForUser,
  ]);

  return null;
}
