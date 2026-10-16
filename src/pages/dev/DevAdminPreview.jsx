import { useState } from "react";
import {
  AdminOverview,
  AdminVolunteers,
  AdminProjects,
  AdminParticipation,
  AdminReports,
  AdminTeam,
  AdminSettings,
} from "../admin/AdminPages.jsx";

const pages = [
  { id: "overview", label: "Overview", Component: AdminOverview },
  { id: "volunteers", label: "Volunteers", Component: AdminVolunteers },
  { id: "projects", label: "Projects", Component: AdminProjects },
  { id: "participation", label: "Participation", Component: AdminParticipation },
  { id: "reports", label: "Reports", Component: AdminReports },
  { id: "team", label: "Team", Component: AdminTeam },
  { id: "settings", label: "Settings", Component: AdminSettings },
];

export default function DevAdminPreview() {
  const [activePage, setActivePage] = useState("overview");
  const page = pages.find((item) => item.id === activePage);
  const PageComponent = page.Component;

  if (!import.meta.env.DEV) {
    return <main><h1>Not found</h1></main>;
  }

  return (
    <main style={{ minHeight: "100vh", background: "#f5f7fb", padding: "24px" }}>
      <header style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "12px",
        marginBottom: "20px",
      }}>
        <div>
          <h1 style={{ margin: 0 }}>FIN-NGO Admin Preview</h1>
          <p style={{ margin: "6px 0 0", color: "#64748b" }}>
            Development only — sample UI data, not production authorization.
          </p>
        </div>
        <a href="/login">Return to login</a>
      </header>

      <nav aria-label="Admin preview pages" style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "8px",
        marginBottom: "24px",
      }}>
        {pages.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActivePage(item.id)}
            aria-current={activePage === item.id ? "page" : undefined}
            style={{
              padding: "10px 14px",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              cursor: "pointer",
              background: activePage === item.id ? "#1d4ed8" : "#fff",
              color: activePage === item.id ? "#fff" : "#1e293b",
            }}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <PageComponent />
    </main>
  );
}
