import {
  useMemo,
  useState,
} from "react";

import {
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  ListTodo,
  LogOut,
  MapPin,
  UserRound,
} from "lucide-react";

import useAuth from "../../hooks/useAuth.js";
import useAttendance from "../../hooks/useAttendance.js";
import useProjects from "../../hooks/useProjects.js";
import useTasks from "../../hooks/useTasks.js";
import useVolunteers from "../../hooks/useVolunteers.js";

import StatusChip from "../../components/ui/StatusChip.jsx";

import "./VolunteerDashboard.css";

const TASK_FILTERS = [
  "All",
  "Not Started",
  "In Progress",
  "Completed",
];

function formatDate(value) {
  if (!value) {
    return "No due date";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getInitials(firstName, lastName) {
  return `${firstName?.charAt(0) ?? ""}${lastName?.charAt(0) ?? ""
    }`.toUpperCase() || "VO";
}

function TaskMetric({
  icon: Icon,
  label,
  value,
}) {
  return (
    <article className="volunteer-dashboard-metric">
      <span className="volunteer-dashboard-metric__icon">
        <Icon size={18} />
      </span>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </article>
  );
}

export default function VolunteerDashboard() {
  const { user, logout } = useAuth();

  const {
    getVolunteerByAuthUserId,
    getVolunteerByEmail,
    recordVolunteerActivity,
  } = useVolunteers();

  const {
    getTasksByVolunteer,
    updateTaskStatus,
  } = useTasks();

  const { projects } = useProjects();
  const {
    createCheckIn,
    checkOut,
    getAttendanceByVolunteer,
  } = useAttendance();

  const [statusFilter, setStatusFilter] =
    useState("All");

  const volunteer = useMemo(() => {
    if (!user) {
      return null;
    }

    return (
      getVolunteerByAuthUserId(user.id) ??
      getVolunteerByEmail(user.email)
    );
  }, [
    user,
    getVolunteerByAuthUserId,
    getVolunteerByEmail,
  ]);

  const projectMap = useMemo(
    () =>
      new Map(
        projects.map((project) => [
          project.id,
          project,
        ]),
      ),
    [projects],
  );

  const assignedTasks = useMemo(
    () =>
      volunteer
        ? getTasksByVolunteer(volunteer.id)
        : [],
    [volunteer, getTasksByVolunteer],
  );

  const attendanceRecords = useMemo(
    () =>
      volunteer
        ? getAttendanceByVolunteer(volunteer.id)
        : [],
    [volunteer, getAttendanceByVolunteer],
  );

  const activeCheckIn = useMemo(
    () =>
      attendanceRecords.find(
        (record) => record.checkOutAt === null,
      ) ?? null,
    [attendanceRecords],
  );

  const taskMetrics = useMemo(() => {
    const notStarted = assignedTasks.filter(
      (task) => task.status === "Not Started",
    ).length;

    const inProgress = assignedTasks.filter(
      (task) => task.status === "In Progress",
    ).length;

    const completed = assignedTasks.filter(
      (task) => task.status === "Completed",
    ).length;

    return {
      total: assignedTasks.length,
      notStarted,
      inProgress,
      completed,
    };
  }, [assignedTasks]);

  const filteredTasks = useMemo(
    () =>
      statusFilter === "All"
        ? assignedTasks
        : assignedTasks.filter(
          (task) =>
            task.status === statusFilter,
        ),
    [assignedTasks, statusFilter],
  );

  const assignedProjectCount =
    volunteer?.projectIds?.length ?? 0;
  function handleCheckIn(task) {
    if (!volunteer || activeCheckIn) {
      return;
    }

    if (
      !task ||
      task.assignedVolunteerId !== volunteer.id
    ) {
      return;
    }

    const projectAssigned =
      volunteer.projectIds?.includes(task.projectId);

    if (!projectAssigned) {
      return;
    }

    const createdAttendance =
      createCheckIn({
        volunteerId: volunteer.id,
        projectId: task.projectId,
        taskId: task.id,
      });

    if (createdAttendance) {
      recordVolunteerActivity(
        volunteer.id,
        createdAttendance.checkInAt ??
          new Date().toISOString(),
      );
    }
  }

  function handleCheckOut(task) {
    if (
      !volunteer ||
      !activeCheckIn ||
      activeCheckIn.taskId !== task.id
    ) {
      return;
    }

    const completedAttendance =
      checkOut(activeCheckIn.id);

    if (completedAttendance) {
      recordVolunteerActivity(
        volunteer.id,
        completedAttendance.checkOutAt ??
          new Date().toISOString(),
      );
    }
  }

  function handleTaskStatusChange(
    taskId,
    nextStatus,
  ) {
    if (!volunteer) {
      return;
    }

    const ownedTask = assignedTasks.find(
      (task) =>
        task.id === taskId &&
        task.assignedVolunteerId === volunteer.id,
    );

    if (!ownedTask) {
      return;
    }

    const validTransition =
      (ownedTask.status === "Not Started" &&
        nextStatus === "In Progress") ||
      (ownedTask.status === "In Progress" &&
        nextStatus === "Completed");

    if (!validTransition) {
      return;
    }

    const updatedTask =
      updateTaskStatus(
        taskId,
        nextStatus,
      );

    if (updatedTask) {
      recordVolunteerActivity(
        volunteer.id,
        updatedTask.updatedAt ??
          new Date().toISOString(),
      );
    }
  }

  return (
    <main className="volunteer-dashboard">
      <header className="volunteer-dashboard__header">
        <div>
          <p className="volunteer-dashboard__eyebrow">
            Volunteer Workspace
          </p>

          <h1>
            Welcome,{" "}
            {user?.firstName ?? "Volunteer"}
          </h1>

          <p className="volunteer-dashboard__intro">
            View your assigned projects and keep
            track of your volunteer tasks.
          </p>
        </div>

        <div className="volunteer-dashboard__account">
          <span className="volunteer-dashboard__avatar">
            {getInitials(
              user?.firstName,
              user?.lastName,
            )}
          </span>

          <div>
            <strong>
              {[
                user?.firstName,
                user?.lastName,
              ]
                .filter(Boolean)
                .join(" ") || "Volunteer"}
            </strong>

            <span>
              {volunteer?.id ??
                "Volunteer account"}
            </span>
          </div>

          <button
            type="button"
            onClick={logout}
            aria-label="Sign out"
          >
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </header>

      {!volunteer ? (
        <section className="volunteer-dashboard__identity-state">
          <UserRound size={28} />

          <h2>Preparing your volunteer profile</h2>

          <p>
            Your volunteer account is being linked
            to the operational volunteer directory.
          </p>
        </section>
      ) : (
        <>
          <section className="volunteer-dashboard__summary">
            <article className="volunteer-dashboard__profile-card">
              <div className="volunteer-dashboard__profile-heading">
                <span className="volunteer-dashboard__profile-avatar">
                  {getInitials(
                    volunteer.firstName,
                    volunteer.lastName,
                  )}
                </span>

                <div>
                  <strong>
                    {volunteer.firstName}{" "}
                    {volunteer.lastName}
                  </strong>

                  <span>
                    {volunteer.status}
                  </span>
                </div>
              </div>

              <div className="volunteer-dashboard__profile-stats">
                <div>
                  <BriefcaseBusiness size={15} />

                  <span>
                    {assignedProjectCount}{" "}
                    {assignedProjectCount === 1
                      ? "project"
                      : "projects"}
                  </span>
                </div>

                <div>
                  <Clock3 size={15} />

                  <span>
                    {volunteer.verifiedHours ?? 0}{" "}
                    verified hours
                  </span>
                </div>
              </div>
            </article>

            <div className="volunteer-dashboard__metrics">
              <TaskMetric
                icon={ListTodo}
                label="Assigned tasks"
                value={taskMetrics.total}
              />

              <TaskMetric
                icon={Circle}
                label="Not started"
                value={taskMetrics.notStarted}
              />

              <TaskMetric
                icon={CalendarDays}
                label="In progress"
                value={taskMetrics.inProgress}
              />

              <TaskMetric
                icon={CheckCircle2}
                label="Completed"
                value={taskMetrics.completed}
              />
            </div>
          </section>

          <section className="volunteer-dashboard__tasks">
            <header>
              <div>
                <h2>My tasks</h2>

                <p>
                  Tasks currently assigned to your
                  volunteer profile.
                </p>
              </div>

              <span>
                {assignedTasks.length}{" "}
                {assignedTasks.length === 1
                  ? "task"
                  : "tasks"}
              </span>
            </header>

            <div className="volunteer-dashboard__filters">
              {TASK_FILTERS.map((filter) => (
                <button
                  type="button"
                  key={filter}
                  className={
                    statusFilter === filter
                      ? "is-active"
                      : ""
                  }
                  onClick={() =>
                    setStatusFilter(filter)
                  }
                >
                  {filter}
                </button>
              ))}
            </div>

            {assignedTasks.length === 0 ? (
              <div className="volunteer-dashboard__empty">
                <ListTodo size={30} />

                <strong>
                  No tasks assigned yet
                </strong>

                <p>
                  When a coordinator assigns a task
                  to you, it will appear here.
                </p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="volunteer-dashboard__empty volunteer-dashboard__empty--compact">
                <ListTodo size={25} />

                <strong>
                  No {statusFilter.toLowerCase()} tasks
                </strong>

                <p>
                  There are no tasks matching this
                  status.
                </p>
              </div>
            ) : (
              <>
                <div className="volunteer-task-table">
                  <div className="volunteer-task-table__header">
                    <span>Task</span>
                    <span>Project</span>
                    <span>Due date</span>
                    <span>Priority</span>
                    <span>Status</span>
                    <span>Action</span>
                  </div>

                  {filteredTasks.map((task) => {
                    const project =
                      projectMap.get(
                        task.projectId,
                      );

                    return (
                      <article
                        key={task.id}
                        className="volunteer-task-table__row"
                      >
                        <div>
                          <strong>
                            {task.title}
                          </strong>

                          <small>
                            {task.id}
                          </small>
                        </div>

                        <span>
                          {project?.name ??
                            "Unknown project"}
                        </span>

                        <span>
                          {formatDate(
                            task.dueDate,
                          )}
                        </span>

                        <span
                          className={`volunteer-task-priority volunteer-task-priority--${task.priority
                            .toLowerCase()
                            .replaceAll(
                              " ",
                              "-",
                            )}`}
                        >
                          {task.priority}
                        </span>

                        <StatusChip
                          status={task.status}
                        />

                        <div className="volunteer-task-action">
                          {task.status !== "Completed" &&
                            !activeCheckIn && (
                              <button
                                type="button"
                                className="volunteer-attendance-button"
                                onClick={() => handleCheckIn(task)}
                              >
                                <MapPin size={13} />
                                Check in
                              </button>
                            )}

                          {activeCheckIn?.taskId === task.id && (
                            <button
                              type="button"
                              className="volunteer-attendance-button volunteer-attendance-button--checkout"
                              onClick={() => handleCheckOut(task)}
                            >
                              <MapPin size={13} />
                              Check out
                            </button>
                          )}

                          {task.status ===
                            "Not Started" && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleTaskStatusChange(
                                    task.id,
                                    "In Progress",
                                  )
                                }
                              >
                                Start task
                              </button>
                            )}

                          {task.status ===
                            "In Progress" && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleTaskStatusChange(
                                    task.id,
                                    "Completed",
                                  )
                                }
                              >
                                Mark completed
                              </button>
                            )}

                          {task.status ===
                            "Completed" && (
                              <span className="volunteer-task-action__complete">
                                <CheckCircle2
                                  size={14}
                                />
                                Completed
                              </span>
                            )}
                        </div>
                      </article>
                    );
                  })}
                </div>

                <div className="volunteer-task-cards">
                  {filteredTasks.map((task) => {
                    const project =
                      projectMap.get(
                        task.projectId,
                      );

                    return (
                      <article key={task.id}>
                        <div className="volunteer-task-card__top">
                          <div>
                            <small>
                              {task.id}
                            </small>

                            <h3>
                              {task.title}
                            </h3>
                          </div>

                          <StatusChip
                            status={task.status}
                          />
                        </div>

                        <div className="volunteer-task-card__meta">
                          <span>
                            <BriefcaseBusiness
                              size={14}
                            />

                            {project?.name ??
                              "Unknown project"}
                          </span>

                          <span>
                            <CalendarDays
                              size={14}
                            />

                            Due{" "}
                            {formatDate(
                              task.dueDate,
                            )}
                          </span>
                        </div>

                        {task.description && (
                          <p>
                            {task.description}
                          </p>
                        )}

                        <span
                          className={`volunteer-task-priority volunteer-task-priority--${task.priority
                            .toLowerCase()
                            .replaceAll(
                              " ",
                              "-",
                            )}`}
                        >
                          {task.priority} priority
                        </span>

                        <div className="volunteer-task-card__action">
                          {task.status !== "Completed" &&
                            !activeCheckIn && (
                              <button
                                type="button"
                                className="volunteer-attendance-button"
                                onClick={() => handleCheckIn(task)}
                              >
                                <MapPin size={13} />
                                Check in
                              </button>
                            )}

                          {activeCheckIn?.taskId === task.id && (
                            <button
                              type="button"
                              className="volunteer-attendance-button volunteer-attendance-button--checkout"
                              onClick={() => handleCheckOut(task)}
                            >
                              <MapPin size={13} />
                              Check out
                            </button>
                          )}

                          {task.status ===
                            "Not Started" && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleTaskStatusChange(
                                    task.id,
                                    "In Progress",
                                  )
                                }
                              >
                                Start task
                              </button>
                            )}

                          {task.status ===
                            "In Progress" && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleTaskStatusChange(
                                    task.id,
                                    "Completed",
                                  )
                                }
                              >
                                Mark completed
                              </button>
                            )}

                          {task.status ===
                            "Completed" && (
                              <span className="volunteer-task-action__complete">
                                <CheckCircle2
                                  size={14}
                                />
                                Completed
                              </span>
                            )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </>
            )}
          </section>
        </>
      )}
    </main>
  );
}





