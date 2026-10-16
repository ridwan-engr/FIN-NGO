import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { BarChart3, BriefcaseBusiness, ClipboardCheck, LayoutDashboard, LogOut, Settings, ShieldCheck, Users } from "lucide-react";
import useAuth from "../hooks/useAuth.js";
import "./AdminLayout.css";

const links = [
  { to: "/admin/overview", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/volunteers", label: "Volunteers", icon: Users },
  { to: "/admin/projects", label: "Projects", icon: BriefcaseBusiness },
  { to: "/admin/participation", label: "Participation", icon: ClipboardCheck },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 },
  { to: "/admin/team", label: "Team", icon: ShieldCheck },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initials = `${user?.firstName?.[0] ?? "F"}${user?.lastName?.[0] ?? "I"}`.toUpperCase();

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <NavLink to="/admin/overview" className="admin-brand">
          <strong>FEASIBLE IMPACT</strong>
          <span>Administrator</span>
        </NavLink>
        <nav aria-label="Administrator navigation" className="admin-nav">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `admin-nav__link${isActive ? " is-active" : ""}`}>
              <Icon size={17} strokeWidth={1.8} /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar__footer">
          <span>Feasible Impact Network</span>
          <button type="button" className="admin-button admin-button--outline" onClick={() => window.location.href = "mailto:support@feasibleimpact.org"}>Contact support</button>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-mobile-brand"><strong>FEASIBLE IMPACT</strong><span>Administrator</span></div>
          <div className="admin-account">
            <span className="admin-avatar" aria-label="Account initials">{initials}</span>
            <button type="button" className="admin-signout" onClick={() => { logout(); navigate("/login", { replace: true }); }}><LogOut size={16}/><span>Sign out</span></button>
          </div>
        </header>
        <main className="admin-content"><Outlet /></main>
      </div>
    </div>
  );
}
