import {
  CalendarDays,
  CheckCircle2,
  CircleDot,
  ClipboardList,
  Plus,
  Search,
  UserRound,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import useProjects from "../../hooks/useProjects.js";
import useTasks from "../../hooks/useTasks.js";
import useVolunteers from "../../hooks/useVolunteers.js";

import {
  TASK_STATUS,
} from "../../data/tasksMock.js";

import { getVolunteerName } from "../../data/volunteersMock.js";

import "./Tasks.css";

const STATUS_FILTERS = [
  "All",
  TASK_STATUS.NOT_STARTED,
  TASK_STATUS.IN_PROGRESS,
  TASK_STATUS.COMPLETED,
];

function formatDate(value) {
  if (!value) {
    return "No due date";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function TaskStatus({ status }) {
  const className = status
    .toLowerCase()
    .replace(/\s+/g, "-");

  return (
    <span
      className={`task-status task-status--${className}`}
    >
      {status}
    </span>
  );
}

function TaskPriority({ priority }) {
  const className = priority.toLowerCase();

  return (
    <span
      className={`task-priority task-priority--${className}`}
    >
      {priority}
    </span>
  );
}

export default function Tasks() {
  const navigate = useNavigate();

  const [searchParams, setSearchParams] =
    useSearchParams();

  const { projects, getProjectById } =
    useProjects();

  const { tasks } = useTasks();

  const { getVolunteerById } =
    useVolunteers();

  const initialProject =
    searchParams.get("project") ?? "all";

  const [searchTerm, setSearchTerm] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [projectFilter, setProjectFilter] =
    useState(initialProject);

  const filteredTasks = useMemo(() => {
    const normalizedSearch =
      searchTerm.trim().toLowerCase();

    return tasks.filter((task) => {
      const project =
        getProjectById(task.projectId);

      const volunteer =
        getVolunteerById(
          task.assignedVolunteerId,
        );

      const volunteerName =
        getVolunteerName(volunteer);

      const matchesSearch =
        !normalizedSearch ||
        task.title
          .toLowerCase()
          .includes(normalizedSearch) ||
        task.id
          .toLowerCase()
          .includes(normalizedSearch) ||
        project?.name
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        volunteerName
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "All" ||
        task.status === statusFilter;

      const matchesProject =
        projectFilter === "all" ||
        task.projectId === projectFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesProject
      );
    });
  }, [
    tasks,
    searchTerm,
    statusFilter,
    projectFilter,
    getProjectById,
    getVolunteerById,
  ]);

  const metrics = useMemo(
    () => ({
      total: tasks.length,

      notStarted: tasks.filter(
        (task) =>
          task.status ===
          TASK_STATUS.NOT_STARTED,
      ).length,

      inProgress: tasks.filter(
        (task) =>
          task.status ===
          TASK_STATUS.IN_PROGRESS,
      ).length,

      completed: tasks.filter(
        (task) =>
          task.status ===
          TASK_STATUS.COMPLETED,
      ).length,
    }),
    [tasks],
  );

  function handleProjectFilter(event) {
    const value = event.target.value;

    setProjectFilter(value);

    const nextParams =
      new URLSearchParams(searchParams);

    if (value === "all") {
      nextParams.delete("project");
    } else {
      nextParams.set("project", value);
    }

    setSearchParams(nextParams, {
      replace: true,
    });
  }

  return (
    <main className="tasks-page">
      <div className="tasks-page__breadcrumb">
        Coordinator / Tasks
      </div>

      <header className="tasks-header">
        <div>
          <h1>Task Management</h1>

          <p>
            Create, assign and monitor volunteer
            tasks across your projects.
          </p>
        </div>

        <button
          type="button"
          className="tasks-create-button"
          onClick={() => {
            const projectQuery =
              projectFilter !== "all"
                ? `?project=${projectFilter}`
                : "";

            navigate(
              `/coordinator/tasks/new${projectQuery}`,
            );
          }}
        >
          <Plus size={17} />
          Create task
        </button>
      </header>

      <section className="tasks-metrics">
        <article>
          <div className="tasks-metric-icon">
            <ClipboardList size={19} />
          </div>

          <div>
            <span>Total tasks</span>
            <strong>{metrics.total}</strong>
          </div>
        </article>

        <article>
          <div className="tasks-metric-icon">
            <CircleDot size={19} />
          </div>

          <div>
            <span>Not started</span>
            <strong>{metrics.notStarted}</strong>
          </div>
        </article>

        <article>
          <div className="tasks-metric-icon">
            <CalendarDays size={19} />
          </div>

          <div>
            <span>In progress</span>
            <strong>{metrics.inProgress}</strong>
          </div>
        </article>

        <article>
          <div className="tasks-metric-icon">
            <CheckCircle2 size={19} />
          </div>

          <div>
            <span>Completed</span>
            <strong>{metrics.completed}</strong>
          </div>
        </article>
      </section>

      <section className="tasks-panel">
        <div className="tasks-toolbar">
          <label className="tasks-search">
            <Search size={17} />

            <input
              type="search"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value,
                )
              }
              placeholder="Search tasks, projects or volunteers"
            />
          </label>

          <select
            className="tasks-project-filter"
            value={projectFilter}
            onChange={handleProjectFilter}
            aria-label="Filter tasks by project"
          >
            <option value="all">
              All projects
            </option>

            {projects.map((project) => (
              <option
                key={project.id}
                value={project.id}
              >
                {project.name}
              </option>
            ))}
          </select>
        </div>

        <div className="tasks-status-filters">
          {STATUS_FILTERS.map((status) => (
            <button
              type="button"
              key={status}
              className={
                statusFilter === status
                  ? "is-active"
                  : ""
              }
              onClick={() =>
                setStatusFilter(status)
              }
            >
              {status}
            </button>
          ))}
        </div>

        {filteredTasks.length === 0 ? (
          <div className="tasks-empty">
            <ClipboardList size={32} />

            <h2>No tasks found</h2>

            <p>
              Try changing the search or filter
              criteria.
            </p>
          </div>
        ) : (
          <>
            <div className="tasks-table-wrap">
              <table className="tasks-table">
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Project</th>
                    <th>Volunteer</th>
                    <th>Due date</th>
                    <th>Priority</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTasks.map(
                    (task) => {
                      const project =
                        getProjectById(
                          task.projectId,
                        );

                      const volunteer =
                        getVolunteerById(
                          task.assignedVolunteerId,
                        );

                      return (
                        <tr
                          key={task.id}
                          onClick={() =>
                            navigate(
                              `/coordinator/tasks/${task.id}`,
                            )
                          }
                        >
                          <td>
                            <div className="tasks-table__task">
                              <strong>
                                {task.title}
                              </strong>

                              <span>
                                {task.id}
                              </span>
                            </div>
                          </td>

                          <td>
                            {project?.name ??
                              "Unknown project"}
                          </td>

                          <td>
                            <div className="tasks-table__volunteer">
                              <span className="tasks-table__avatar">
                                <UserRound
                                  size={14}
                                />
                              </span>

                              {getVolunteerName(
                                volunteer,
                              )}
                            </div>
                          </td>

                          <td>
                            {formatDate(
                              task.dueDate,
                            )}
                          </td>

                          <td>
                            <TaskPriority
                              priority={
                                task.priority
                              }
                            />
                          </td>

                          <td>
                            <TaskStatus
                              status={
                                task.status
                              }
                            />
                          </td>
                        </tr>
                      );
                    },
                  )}
                </tbody>
              </table>
            </div>

            <div className="tasks-mobile-list">
              {filteredTasks.map((task) => {
                const project =
                  getProjectById(
                    task.projectId,
                  );

                const volunteer =
                  getVolunteerById(
                    task.assignedVolunteerId,
                  );

                return (
                  <button
                    type="button"
                    className="tasks-mobile-card"
                    key={task.id}
                    onClick={() =>
                      navigate(
                        `/coordinator/tasks/${task.id}`,
                      )
                    }
                  >
                    <div className="tasks-mobile-card__top">
                      <TaskPriority
                        priority={
                          task.priority
                        }
                      />

                      <TaskStatus
                        status={task.status}
                      />
                    </div>

                    <strong>
                      {task.title}
                    </strong>

                    <span>
                      {project?.name ??
                        "Unknown project"}
                    </span>

                    <div className="tasks-mobile-card__meta">
                      <span>
                        <UserRound size={13} />
                        {getVolunteerName(
                          volunteer,
                        )}
                      </span>

                      <span>
                        <CalendarDays
                          size={13}
                        />
                        {formatDate(
                          task.dueDate,
                        )}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </section>
    </main>
  );
}

