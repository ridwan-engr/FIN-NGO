import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import useAttendance from "../../hooks/useAttendance.js";
import useAuth from "../../hooks/useAuth.js";
import useProjects from "../../hooks/useProjects.js";
import useTasks from "../../hooks/useTasks.js";
import useVolunteers from "../../hooks/useVolunteers.js";

import { ATTENDANCE_STATUS } from "../../data/attendanceMock.js";
import { coordinatorDashboardData } from "../../data/coordinatorDashboardMock.js";

import "./CoordinatorDashboard.css";

function DashboardMetric({ label, value }) {
  return (
    <article className="fin-dashboard-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function DashboardStatus({ status }) {
  const statusClass = status
    .toLowerCase()
    .replace(/\s+/g, "-");

  return (
    <span
      className={`fin-dashboard-status fin-dashboard-status--${statusClass}`}
    >
      {status}
    </span>
  );
}

function getVolunteerName(volunteer) {
  if (!volunteer) {
    return "Unassigned";
  }

  return [
    volunteer.firstName,
    volunteer.lastName,
  ]
    .filter(Boolean)
    .join(" ");
}

function getVolunteerShortName(volunteer) {
  if (!volunteer) {
    return "Unassigned";
  }

  const firstName =
    volunteer.firstName ?? "";

  const lastInitial =
    volunteer.lastName?.charAt(0) ?? "";

  return lastInitial
    ? `${firstName} ${lastInitial}.`
    : firstName;
}

function getVolunteerInitials(volunteer) {
  if (!volunteer) {
    return "NA";
  }

  return [
    volunteer.firstName?.charAt(0),
    volunteer.lastName?.charAt(0),
  ]
    .filter(Boolean)
    .join("")
    .toUpperCase();
}

function formatMetricNumber(value) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
}

export default function CoordinatorDashboard() {
  const navigate = useNavigate();

  const { user } = useAuth();

  const {
    projects,
    getProjectById,
  } = useProjects();

  const {
    volunteers,
    getVolunteerById,
  } = useVolunteers();

  const { tasks } = useTasks();

  const { attendanceRecords } =
    useAttendance();

  const { coordinator } =
    coordinatorDashboardData;

  const coordinatorName =
    [user?.firstName, user?.lastName]
      .filter(Boolean)
      .join(" ") || coordinator.name;

  const dashboardData = useMemo(() => {
    const engagedVolunteers =
      volunteers.filter(
        (volunteer) =>
          volunteer.status !== "Inactive",
      ).length;

    const projectsManaged =
      projects.length;

    const verifiedHours =
      attendanceRecords
        .filter(
          (record) =>
            record.status ===
            ATTENDANCE_STATUS.VERIFIED,
        )
        .reduce(
          (total, record) =>
            total +
            Number(
              record.verifiedHours ?? 0,
            ),
          0,
        );

    const completedTasks =
      tasks.filter(
        (task) =>
          task.status === "Completed",
      ).length;

    const taskCompletion =
      tasks.length > 0
        ? Math.round(
            (completedTasks /
              tasks.length) *
              100,
          )
        : 0;

    const pendingReviews =
      attendanceRecords.filter(
        (record) =>
          record.status ===
            ATTENDANCE_STATUS.PENDING &&
          Boolean(record.checkOutAt),
      ).length;

    const desktopMetrics = [
      {
        id: "engaged-volunteers",
        label: "Engaged volunteers",
        value: formatMetricNumber(
          engagedVolunteers,
        ),
      },
      {
        id: "projects-managed",
        label: "Projects managed",
        value: formatMetricNumber(
          projectsManaged,
        ),
      },
      {
        id: "verified-hours",
        label: "Verified hours",
        value: formatMetricNumber(
          Number(
            verifiedHours.toFixed(2),
          ),
        ),
      },
      {
        id: "task-completion",
        label:
          "Current task completion",
        value: `${taskCompletion}%`,
      },
    ];

    const mobileMetrics = [
      {
        id: "volunteers-engaged",
        label: "Volunteers Engaged",
        value: formatMetricNumber(
          engagedVolunteers,
        ),
      },
      {
        id: "projects-managed",
        label: "Projects Managed",
        value: formatMetricNumber(
          projectsManaged,
        ),
      },
      {
        id: "pending-reviews",
        label: "Pending reviews",
        value: formatMetricNumber(
          pendingReviews,
        ),
      },
    ];

    const projectPerformance =
      projects.map((project) => {
        const projectTasks =
          tasks.filter(
            (task) =>
              task.projectId ===
              project.id,
          );

        const projectCompletedTasks =
          projectTasks.filter(
            (task) =>
              task.status ===
              "Completed",
          ).length;

        const progress =
          projectTasks.length > 0
            ? Math.round(
                (projectCompletedTasks /
                  projectTasks.length) *
                  100,
              )
            : Number(
                project.progress ?? 0,
              );

        const projectVolunteers =
          volunteers.filter(
            (volunteer) =>
              Array.isArray(
                volunteer.projectIds,
              ) &&
              volunteer.projectIds.includes(
                project.id,
              ),
          );

        return {
          ...project,
          progress,
          completedTasks:
            projectCompletedTasks,
          totalTasks:
            projectTasks.length,
          volunteers:
            projectVolunteers.length,
        };
      });

    const sortedProjects = [
      ...projectPerformance,
    ].sort((a, b) => {
      if (b.progress !== a.progress) {
        return b.progress - a.progress;
      }

      if (
        b.completedTasks !==
        a.completedTasks
      ) {
        return (
          b.completedTasks -
          a.completedTasks
        );
      }

      return (
        b.volunteers -
        a.volunteers
      );
    });

    const topProject =
      sortedProjects[0] ?? null;

    const bestProject = topProject
      ? {
          id: topProject.id,
          name: topProject.name,
          status:
            topProject.status ??
            "Active",
          volunteers:
            topProject.volunteers,
          completedTasks:
            topProject.completedTasks,
          totalTasks:
            topProject.totalTasks,
          progress:
            topProject.progress,
          rating:
            topProject.progress >= 100
              ? 5
              : topProject.progress >= 80
                ? 4
                : topProject.progress >= 60
                  ? 3
                  : topProject.progress >= 40
                    ? 2
                    : 1,
          review:
            topProject.progress >= 100
              ? "All tracked tasks for this project are complete."
              : `${topProject.completedTasks} of ${topProject.totalTasks} tracked tasks are complete.`,
        }
      : {
          id: "",
          name: "No project available",
          status: "Inactive",
          volunteers: 0,
          completedTasks: 0,
          totalTasks: 0,
          progress: 0,
          rating: 1,
          review:
            "Create a project to begin tracking progress.",
        };

    const attentionTasks =
      tasks
        .filter(
          (task) =>
            task.status !== "Completed",
        )
        .map((task) => {
          const volunteer =
            task.assignedVolunteerId
              ? getVolunteerById(
                  task.assignedVolunteerId,
                )
              : null;

          const project =
            getProjectById(
              task.projectId,
            );

          let issue =
            task.status === "In Progress"
              ? "task in progress"
              : "task not started";

          if (
            volunteer?.status ===
            "Awaiting Response"
          ) {
            issue =
              "volunteer awaiting response";
          }

          if (
            volunteer?.status ===
            "Unresponsive"
          ) {
            issue =
              "volunteer unresponsive";
          }

          return {
            id: task.id,
            initials:
              getVolunteerInitials(
                volunteer,
              ),
            volunteer:
              getVolunteerName(volunteer),
            volunteerShort:
              getVolunteerShortName(
                volunteer,
              ),
            project:
              project?.name ??
              "Unknown project",
            activity: task.title,
            mobileActivity:
              task.title,
            issue,
            mobileIssue:
              issue.charAt(0).toUpperCase() +
              issue.slice(1),
            status:
              volunteer?.status ===
                "Unresponsive"
                ? "Unresponsive"
                : volunteer?.status ===
                    "Awaiting Response"
                  ? "Pending"
                  : task.status ===
                      "In Progress"
                    ? "In progress"
                    : "Pending",
          };
        })
        .slice(0, 5);

    return {
      desktopMetrics,
      mobileMetrics,
      bestProject,
      tasksNeedingAttention:
        attentionTasks,
    };
  }, [
    projects,
    volunteers,
    tasks,
    attendanceRecords,
    getProjectById,
    getVolunteerById,
  ]);

  const {
    desktopMetrics,
    mobileMetrics,
    bestProject,
    tasksNeedingAttention,
  } = dashboardData;

  return (
    <main className="fin-dashboard">
      <header className="fin-dashboard-header">
        <div className="fin-dashboard-header__identity">
          <h1>
            Welcome, {coordinatorName}
          </h1>
        </div>

        <div className="fin-dashboard-header__meta">
          <span>{coordinator.role}</span>
          <span>{coordinator.location}</span>
        </div>
      </header>

      <section className="fin-dashboard-contribution">
        <h2>Contribution at a glance</h2>

        <div className="fin-dashboard-metrics fin-dashboard-metrics--desktop">
          {desktopMetrics.map((metric) => (
            <DashboardMetric
              key={metric.id}
              label={metric.label}
              value={metric.value}
            />
          ))}
        </div>

        <div className="fin-dashboard-metrics fin-dashboard-metrics--mobile">
          {mobileMetrics.map((metric) => (
            <DashboardMetric
              key={metric.id}
              label={metric.label}
              value={metric.value}
            />
          ))}
        </div>
      </section>

      <section className="fin-best-project-section">
        <h2 className="fin-mobile-section-title">
          Best project
        </h2>

        <article
          className="fin-best-project"
          onClick={() => {
            if (bestProject.id) {
              navigate(
                `/coordinator/projects/${bestProject.id}`,
              );
            }
          }}
        >
          <div className="fin-best-project__top">
            <DashboardStatus
              status={bestProject.status}
            />

            <div
              className="fin-best-project__rating"
              aria-label={`${bestProject.rating} star rating`}
            >
              {Array.from(
                {
                  length:
                    bestProject.rating,
                },
                (_, index) => (
                  <span key={index}>
                    ★
                  </span>
                ),
              )}
            </div>
          </div>

          <h2>{bestProject.name}</h2>

          <p className="fin-best-project__summary">
            {bestProject.volunteers} volunteers •{" "}
            {bestProject.completedTasks}/
            {bestProject.totalTasks} tasks complete
          </p>

          <div className="fin-best-project__progress-row">
            <div className="fin-best-project__progress">
              <span
                style={{
                  width: `${bestProject.progress}%`,
                }}
              />
            </div>

            <strong>
              {bestProject.progress}%
            </strong>
          </div>

          <p className="fin-best-project__review">
            Review: {bestProject.review}
          </p>
        </article>
      </section>

      <section className="fin-attention">
        <h2>Tasks needing attention</h2>

        {tasksNeedingAttention.length ===
        0 ? (
          <div
            style={{
              padding: "24px 0",
              color:
                "var(--color-text-muted)",
              fontSize: "13px",
            }}
          >
            No tasks currently require
            attention.
          </div>
        ) : (
          <>
            <div className="fin-attention__desktop">
              <table>
                <thead>
                  <tr>
                    <th>Volunteer</th>
                    <th>Project</th>
                    <th>Activity</th>
                    <th>Issue</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {tasksNeedingAttention.map(
                    (task) => (
                      <tr
                        key={task.id}
                        onClick={() =>
                          navigate(
                            `/coordinator/tasks?task=${task.id}`,
                          )
                        }
                      >
                        <td>
                          {task.volunteer}
                        </td>

                        <td>
                          {task.project}
                        </td>

                        <td>
                          {task.activity}
                        </td>

                        <td>
                          {task.issue}
                        </td>

                        <td>
                          <DashboardStatus
                            status={
                              task.status
                            }
                          />
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>

            <div className="fin-attention__mobile">
              {tasksNeedingAttention.map(
                (task) => (
                  <button
                    type="button"
                    key={task.id}
                    className="fin-task-card"
                    onClick={() =>
                      navigate(
                        `/coordinator/tasks?task=${task.id}`,
                      )
                    }
                  >
                    <span className="fin-task-card__avatar">
                      {task.initials}
                    </span>

                    <span className="fin-task-card__content">
                      <strong>
                        {
                          task.mobileActivity
                        }
                      </strong>

                      <small>
                        {
                          task.volunteerShort
                        }{" "}
                        • {task.mobileIssue}
                      </small>
                    </span>

                    <DashboardStatus
                      status={task.status}
                    />
                  </button>
                ),
              )}
            </div>
          </>
        )}
      </section>

      <footer className="fin-dashboard__workspace">
        COORDINATOR WORKSPACE
      </footer>
    </main>
  );
}
