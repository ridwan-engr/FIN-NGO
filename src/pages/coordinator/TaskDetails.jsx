import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FolderKanban,
  UserMinus,
  UserRound,
} from "lucide-react";

import {
  Navigate,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  TASK_STATUS,
} from "../../data/tasksMock.js";

import {
  getVolunteerName,
} from "../../data/volunteersMock.js";

import useProjects from "../../hooks/useProjects.js";
import useTasks from "../../hooks/useTasks.js";
import useVolunteers from "../../hooks/useVolunteers.js";

import "./TaskDetails.css";

function formatDate(value) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(
    new Date(`${value}T00:00:00`),
  );
}

function formatDateTime(value) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getStatusClass(status) {
  return status
    .toLowerCase()
    .replace(/\s+/g, "-");
}

export default function TaskDetails() {
  const navigate = useNavigate();
  const { taskId } = useParams();

  const {
    getTaskById,
    assignVolunteer,
    updateTaskStatus,
  } = useTasks();

  const {
    getProjectById,
  } = useProjects();

  const {
    getVolunteerById,
    getVolunteersByProject,
  } = useVolunteers();

  const task = getTaskById(taskId);

  if (!task) {
    return (
      <Navigate
        to="/coordinator/tasks"
        replace
      />
    );
  }

  const project =
    getProjectById(task.projectId);

  const assignedVolunteer =
    getVolunteerById(
      task.assignedVolunteerId,
    );

  const eligibleVolunteers =
    getVolunteersByProject(
      task.projectId,
    );

  function handleAssignment(event) {
    assignVolunteer(
      task.id,
      event.target.value,
    );
  }

  function handleUnassign() {
    assignVolunteer(task.id, null);
  }

  function handleStatusChange(event) {
    updateTaskStatus(
      task.id,
      event.target.value,
    );
  }

  return (
    <main className="task-details-page">
      <div className="task-details-page__breadcrumb">
        Coordinator / Tasks / {task.id}
      </div>

      <button
        type="button"
        className="task-details-back"
        onClick={() =>
          navigate(
            `/coordinator/tasks?project=${task.projectId}`,
          )
        }
      >
        <ArrowLeft size={15} />
        Back to tasks
      </button>

      <header className="task-details-header">
        <div>
          <div className="task-details-header__eyebrow">
            <ClipboardList size={15} />
            {task.id}
          </div>

          <h1>{task.title}</h1>

          <p>
            {task.description ||
              "No description has been added for this task."}
          </p>
        </div>

        <span
          className={`task-details-status task-details-status--${getStatusClass(
            task.status,
          )}`}
        >
          {task.status}
        </span>
      </header>

      <section className="task-details-summary">
        <article>
          <span>Project</span>

          <div>
            <FolderKanban size={17} />

            <strong>
              {project?.name ??
                "Unknown project"}
            </strong>
          </div>
        </article>

        <article>
          <span>Due date</span>

          <div>
            <CalendarDays size={17} />

            <strong>
              {formatDate(task.dueDate)}
            </strong>
          </div>
        </article>

        <article>
          <span>Priority</span>

          <strong
            className={`task-details-priority task-details-priority--${task.priority.toLowerCase()}`}
          >
            {task.priority}
          </strong>
        </article>
      </section>

      <div className="task-details-grid">
        <section className="task-details-card">
          <div className="task-details-card__header">
            <div>
              <h2>Volunteer assignment</h2>

              <p>
                Assign or reassign this task to
                a volunteer on the project.
              </p>
            </div>
          </div>

          <div className="task-details-current-assignee">
            <div className="task-details-avatar">
              <UserRound size={19} />
            </div>

            <div>
              <span>Current assignee</span>

              <strong>
                {getVolunteerName(
                  assignedVolunteer,
                )}
              </strong>

              {assignedVolunteer && (
                <small>
                  {assignedVolunteer.email}
                </small>
              )}
            </div>
          </div>

          <label className="task-details-field">
            <span>
              {assignedVolunteer
                ? "Reassign volunteer"
                : "Assign volunteer"}
            </span>

            <select
              value={
                task.assignedVolunteerId ??
                ""
              }
              onChange={handleAssignment}
            >
              <option value="">
                Unassigned
              </option>

              {eligibleVolunteers.map(
                (volunteer) => (
                  <option
                    key={volunteer.id}
                    value={volunteer.id}
                  >
                    {getVolunteerName(
                      volunteer,
                    )}
                  </option>
                ),
              )}
            </select>
          </label>

          {assignedVolunteer && (
            <button
              type="button"
              className="task-details-unassign"
              onClick={handleUnassign}
            >
              <UserMinus size={15} />
              Unassign volunteer
            </button>
          )}

          {eligibleVolunteers.length ===
            0 && (
            <p className="task-details-note">
              No volunteers are currently
              assigned to this project.
            </p>
          )}
        </section>

        <section className="task-details-card">
          <div className="task-details-card__header">
            <div>
              <h2>Task status</h2>

              <p>
                Track the current execution
                state of this task.
              </p>
            </div>
          </div>

          <label className="task-details-field">
            <span>Current status</span>

            <select
              value={task.status}
              onChange={handleStatusChange}
            >
              {Object.values(
                TASK_STATUS,
              ).map((status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>
              ))}
            </select>
          </label>

          <div className="task-details-status-summary">
            <CheckCircle2 size={18} />

            <div>
              <strong>
                {task.status}
              </strong>

              <span>
                Changes are saved
                automatically.
              </span>
            </div>
          </div>
        </section>
      </div>

      <section className="task-details-card task-details-card--information">
        <div className="task-details-card__header">
          <div>
            <h2>Task information</h2>

            <p>
              Operational details for this
              assignment.
            </p>
          </div>
        </div>

        <dl className="task-details-information">
          <div>
            <dt>Task ID</dt>
            <dd>{task.id}</dd>
          </div>

          <div>
            <dt>Project ID</dt>
            <dd>{task.projectId}</dd>
          </div>

          <div>
            <dt>Created</dt>
            <dd>
              {formatDateTime(
                task.createdAt,
              )}
            </dd>
          </div>

          <div>
            <dt>Last updated</dt>
            <dd>
              {formatDateTime(
                task.updatedAt,
              )}
            </dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
