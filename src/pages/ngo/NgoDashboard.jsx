import {
  Building2,
  LogOut,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import useAuth from "../../hooks/useAuth.js";

export default function NgoDashboard() {
  const navigate = useNavigate();

  const {
    user,
    logout,
  } = useAuth();

  const handleLogout = () => {
    logout();

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "48px",
        background: "#f5f7f5",
      }}
    >
      <Building2
        size={36}
        strokeWidth={1.8}
      />

      <h1>NGO Workspace</h1>

      <p>
        Welcome, {user?.firstName}.
      </p>

      <p>
        The NGO dashboard will be implemented
        in its dedicated application phase.
      </p>

      <button
        type="button"
        onClick={handleLogout}
      >
        <LogOut size={16} />
        Sign out
      </button>
    </main>
  );
}
