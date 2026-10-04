import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import useAuth from "../../hooks/useAuth.js";
import useProjects from "../../hooks/useProjects.js";

import "./Projects.css";

const PROJECT_VIEWS = {
  PREVIOUS: "Previous",
  CURRENT: "Current",
  FUTURE: "Future",
};

const projectViews = Object.values(PROJECT_VIEWS);

function parseProjectDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T00:00:00`);

  return Number.isNaN(date.getTime()) ? null : date;
}

function getToday() {
  const now = new Date();

  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
}

function getProjectView(project, today) {
  const startDate = parseProjectDate(project.startDate);
  const endDate = parseProjectDate(project.endDate);

  if (endDate && endDate < today) {
    return PROJECT_VIEWS.PREVIOUS;
  }

  if (startDate && startDate > today) {
    return PROJECT_VIEWS.FUTURE;
  }

  return PROJECT_VIEWS.CURRENT;
}

function getProjectInitials(name) {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "PR";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function getDisplayStatus(project, view) {
  if (view === PROJECT_VIEWS.FUTURE) {
    return "Pending";
  }

  if (view === PROJECT_VIEWS.PREVIOUS) {
    return project.status === "Completed"
      ? "Completed"
      : project.status;
  }

  return project.status;
}

export default function Projects() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { projects } = useProjects();

  const [search, setSearch] = useState("");
  const [activeView, setActiveView] = useState(
    PROJECT_VIEWS.CURRENT,
  );

  const today = useMemo(() => getToday(), []);

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();

    return projects.filter((project) => {
      const projectView = getProjectView(project, today);

      if (projectView !== activeView) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        project.name.toLowerCase().includes(query) ||
        project.location.toLowerCase().includes(query) ||
        project.id.toLowerCase().includes(query)
      );
    });
  }, [projects, search, activeView, today]);

  const firstName = user?.firstName ?? "David";
  const lastName = user?.lastName ?? "Adebayo";
  const displayName = `${firstName} ${lastName}`.trim();

  const initials = `${firstName.charAt(0)}${lastName.charAt(
    0,
  )}`.toUpperCase();

  const openProject = (projectId) => {
    navigate(`/coordinator/projects/${projectId}`);
  };

  return (
    <main className="fin-projects">
      <header className="fin-projects__header">
        <div className="fin-projects__identity">
          <div>
            <h1>{displayName}</h1>
            <span>Coordinator</span>
          </div>

          <div className="fin-projects__avatar">
            {initials}
          </div>
        </div>

        <div className="fin-projects__desktop-meta">
          <span>Project Coordinator</span>
          <span>Agege, Lagos</span>
        </div>
      </header>

      <section className="fin-projects__controls">
        <label className="fin-projects__search-label">
          Search
        </label>

        <div className="fin-projects__search">
          <Search
            className="fin-projects__search-icon"
            size={18}
            strokeWidth={1.7}
          />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search projects..."
            aria-label="Search projects"
          />
        </div>

        <div
          className="fin-projects__tabs"
          aria-label="Project lifecycle"
        >
          {projectViews.map((view) => (
            <button
              key={view}
              type="button"
              className={
                activeView === view
                  ? "fin-projects__tab fin-projects__tab--active"
                  : "fin-projects__tab"
              }
              onClick={() => setActiveView(view)}
            >
              {view}
            </button>
          ))}
        </div>
      </section>

      <div className="fin-projects__section-heading">
        <h2>{filteredProjects.length} Projects</h2>

        <button
          type="button"
          className="fin-projects__create"
          onClick={() =>
            navigate("/coordinator/projects/new")
          }
        >
          <Plus size={16} strokeWidth={2} />
          <span>Create project</span>
        </button>
      </div>

      {filteredProjects.length > 0 ? (
        <>
          <section className="fin-projects-table">
            <div className="fin-projects-table__header">
              <span>Project</span>
              <span>Number of volunteers</span>
              <span>Attendance</span>
              <span>Status</span>
            </div>

            <div className="fin-projects-table__body">
              {filteredProjects.map((project) => {
                const status = getDisplayStatus(
                  project,
                  activeView,
                );

                return (
                  <button
                    key={project.id}
                    type="button"
                    className="fin-projects-table__row"
                    onClick={() => openProject(project.id)}
                  >
                    <span className="fin-projects-table__name">
                      {project.name}
                    </span>

                    <span>{project.volunteers}</span>

                    <span>{project.progress}%</span>

                    <span
                      className={`fin-project-status fin-project-status--${status
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      {status}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="fin-project-cards">
            {filteredProjects.map((project) => {
              const status = getDisplayStatus(
                project,
                activeView,
              );

              return (
                <button
                  key={project.id}
                  type="button"
                  className="fin-project-card"
                  onClick={() => openProject(project.id)}
                >
                  <span className="fin-project-card__initials">
                    {getProjectInitials(project.name)}
                  </span>

                  <span className="fin-project-card__content">
                    <strong>{project.name}</strong>

                    <small>
                      {project.volunteers} volunteers •{" "}
                      {project.progress}%
                    </small>
                  </span>

                  <span
                    className={`fin-project-status fin-project-status--${status
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                  >
                    {status}
                  </span>
                </button>
              );
            })}
          </section>
        </>
      ) : (
        <section className="fin-projects__empty">
          <strong>No projects found</strong>

          <span>
            No {activeView.toLowerCase()} projects match
            your search.
          </span>
        </section>
      )}

      <div className="fin-projects__workspace-label">
        COORDINATOR WORKSPACE
      </div>
    </main>
  );
}
