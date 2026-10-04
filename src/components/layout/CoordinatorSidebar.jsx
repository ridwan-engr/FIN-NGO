import {
  House,
  BriefcaseBusiness,
  Users,
  ListTodo,
  CalendarCheck,
  ChartNoAxesColumnIncreasing,
  Settings,
  LogOut,
} from "lucide-react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import useAuth from "../../hooks/useAuth.js";

import finLogo from "../../assets/branding/fin-logo.png";

import "./CoordinatorSidebar.css";

const navigation = [
  {
    label: "Home",
    path: "/coordinator/dashboard",
    icon: House,
  },
  {
    label: "Projects",
    path: "/coordinator/projects",
    icon: BriefcaseBusiness,
  },
  {
    label: "Volunteers",
    path: "/coordinator/volunteers",
    icon: Users,
  },
  {
    label: "Tasks",
    path: "/coordinator/tasks",
    icon: ListTodo,
  },
  {
    label: "Attendance",
    path: "/coordinator/attendance",
    icon: CalendarCheck,
  },
  {
    label: "Reports",
    path: "/coordinator/reports",
    icon: ChartNoAxesColumnIncreasing,
  },
  {
    label: "Settings",
    path: "/coordinator/settings",
    icon: Settings,
  },
];

export default function CoordinatorSidebar() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="coordinator-sidebar">
      <div className="coordinator-sidebar__brand">
        <img
          src={finLogo}
          alt=""
          aria-hidden="true"
          className="coordinator-sidebar__logo"
        />

        <div className="coordinator-sidebar__brand-copy">
          <div className="coordinator-sidebar__brand-name">
            <strong>Feasible Impact</strong>
            <strong>Network</strong>
          </div>

          <small>People · Solutions · Lasting Change</small>
        </div>
      </div>

      <div className="coordinator-sidebar__divider" />

      <nav
        className="coordinator-sidebar__navigation"
        aria-label="Coordinator navigation"
      >
        {navigation.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={label}
            to={path}
            className={({ isActive }) =>
              [
                "coordinator-sidebar__link",
                isActive
                  ? "coordinator-sidebar__link--active"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")
            }
          >
            <Icon
              className="coordinator-sidebar__link-icon"
              size={18}
              strokeWidth={1.8}
            />

            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="coordinator-sidebar__footer">
        <div className="coordinator-sidebar__footer-divider" />

        <span className="coordinator-sidebar__role">
          Coordinator
        </span>

        <button
          type="button"
          className="coordinator-sidebar__signout"
          onClick={handleLogout}
        >
          <LogOut size={14} strokeWidth={1.8} />
          <span>Signout</span>
        </button>
      </div>
    </aside>
  );
}



