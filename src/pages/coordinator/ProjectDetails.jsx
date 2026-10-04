import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  MapPin,
  Pencil,
  Plus,
  UserRound,
  Users,
} from "lucide-react";

import { useState } from "react";

import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import ProjectStatus from "../../components/ui/ProjectStatus.jsx";

import useProjects from "../../hooks/useProjects.js";
import useTasks from "../../hooks/useTasks.js";
import useVolunteers from "../../hooks/useVolunteers.js";

import { getVolunteerName } from "../../data/volunteersMock.js";

import "./ProjectDetails.css";

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

function getStatusClass(status) {
  return status
    .toLowerCase()
    .replace(/\s+/g, "-");
}

export default function ProjectDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = useParams();

  const {
    getProjectById,
    updateProject,
  } = useProjects();

  const {
    getTasksByProject,
  } = useTasks();

  const {
    volunteers,
    getVolunteerById,
    getVolunteersByProject,
    assignVolunteerToProject,
    removeVolunteerFromProject,
  } = useVolunteers();

  const [
    selectedVolunteerId,
    setSelectedVolunteerId,
  ] = useState("");

  const [
    showVolunteerAssignment,
    setShowVolunteerAssignment,
  ] = useState(false);

  const project = getProjectById(projectId);

  if (!project) {
    return (
      <Navigate
        to="/coordinator/projects"
        replace
      />
    );
  }

  const projectVolunteers =
    getVolunteersByProject(project.id);

  const availableVolunteers = volunteers.filter(
    (volunteer) =>
      !volunteer.projectIds.includes(project.id),
  );

  const projectTasks =
    getTasksByProject(project.id);

  const completedOperationalTasks =
    projectTasks.filter(
      (task) => task.status === "Completed",
    ).length;

  const operationalProgress =
    projectTasks.length > 0
      ? Math.round(
        (completedOperationalTasks /
          projectTasks.length) *
        100,
      )
      : 0;

  function handleAssignVolunteer() {
    if (!selectedVolunteerId) {
      return;
    }

    assignVolunteerToProject(
      selectedVolunteerId,
      project.id,
    );

    updateProject(project.id, {
      volunteers: projectVolunteers.length + 1,
    });

    setSelectedVolunteerId("");
    setShowVolunteerAssignment(false);
  }

  function handleRemoveVolunteer(volunteerId) {
    removeVolunteerFromProject(
      volunteerId,
      project.id,
    );

    updateProject(project.id, {
      volunteers: Math.max(
        0,
        projectVolunteers.length - 1,
      ),
    });
  }

  return (
    <main className="project-details-page">
      <div className="project-details-page__breadcrumb">
        Coordinator / Projects / {project.name}
      </div>

      {location.state?.created && (
        <div className="project-created-notice">
          <CheckCircle2 size={16} />

          <span>
            Project created successfully.
          </span>
        </div>
      )}

      <button
        type="button"
        className="project-details-page__back"
        onClick={() =>
          navigate("/coordinator/projects")
        }
      >
        <ArrowLeft size={15} />
        Back to projects
      </button>

      <header className="project-details-header">
        <div>
          <div className="project-details-header__title">
            <h1>{project.name}</h1>

            <ProjectStatus
              status={project.status}
            />
          </div>

          <p>{project.description}</p>
        </div>

        <div className="project-details-header__actions">
          <button
            type="button"
            className="project-details-header__edit-button"
            onClick={() =>
              navigate(
                `/coordinator/projects/${project.id}/edit`,
              )
            }
          >
            <Pencil size={14} />
            Edit project
          </button>

          <button
            type="button"
            className="project-details-header__task-button"
            onClick={() =>
              navigate(
                `/coordinator/tasks/new?project=${project.id}`,
              )
            }
          >
            <Plus size={15} />
            Create task
          </button>
        </div>
      </header>

      <section className="project-details-metrics">
        <article>
          <span>Progress</span>
          <strong>{project.progress}%</strong>

          <div className="project-details-progress">
            <span
              style={{
                width: `${project.progress}%`,
              }}
            />
          </div>
        </article>

        <article>
          <span>Volunteers</span>

          <div>
            <Users size={17} />
            <strong>{project.volunteers}</strong>
          </div>
        </article>

        <article>
          <span>Tasks</span>

          <div>
            <ClipboardList size={17} />
            <strong>{project.tasks}</strong>
          </div>

          <small>
            {project.completedTasks} completed
          </small>
        </article>
      </section>

      <div className="project-details-grid">
        <section className="project-details-card">
          <div className="project-details-card__header">
            <h2>Project information</h2>
            <span>Overview</span>
          </div>

          <dl className="project-details-information">
            <div>
              <dt>
                <MapPin size={15} />
                Location
              </dt>

              <dd>{project.location}</dd>
            </div>

            <div>
              <dt>
                <CalendarDays size={15} />
                Start date
              </dt>

              <dd>
                {formatDate(project.startDate)}
              </dd>
            </div>

            <div>
              <dt>
                <CalendarDays size={15} />
                End date
              </dt>

              <dd>
                {formatDate(project.endDate)}
              </dd>
            </div>

            <div>
              <dt>Project ID</dt>
              <dd>{project.id}</dd>
            </div>
          </dl>
        </section>

        <section className="project-volunteers">
          <div className="project-volunteers__header">
            <div>
              <h2>Project volunteers</h2>

              <p>
                Volunteers currently assigned to this
                project.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setShowVolunteerAssignment(
                  (current) => !current,
                )
              }
            >
              <Plus size={14} />
              Assign volunteer
            </button>
          </div>

          {showVolunteerAssignment && (
            <div className="project-volunteer-assignment">
              <div>
                <label htmlFor="project-volunteer">
                  Volunteer
                </label>

                <select
                  id="project-volunteer"
                  value={selectedVolunteerId}
                  onChange={(event) =>
                    setSelectedVolunteerId(
                      event.target.value,
                    )
                  }
                >
                  <option value="">
                    Select volunteer
                  </option>

                  {availableVolunteers.map(
                    (volunteer) => (
                      <option
                        key={volunteer.id}
                        value={volunteer.id}
                      >
                        {getVolunteerName(volunteer)}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <button
                type="button"
                disabled={!selectedVolunteerId}
                onClick={handleAssignVolunteer}
              >
                Assign
              </button>
            </div>
          )}

          {projectVolunteers.length === 0 ? (
            <div className="project-volunteers__empty">
              <Users size={24} />

              <strong>
                No volunteers assigned
              </strong>

              <span>
                Assign a volunteer before creating
                volunteer-specific tasks.
              </span>
            </div>
          ) : (
            <div className="project-volunteers__list">
              {projectVolunteers.map(
                (volunteer) => (
                  <div
                    className="project-volunteer-row"
                    key={volunteer.id}
                  >
                    <div className="project-volunteer-row__identity">
                      <div className="project-volunteer-row__avatar">
                        {volunteer.firstName
                          .charAt(0)
                          .toUpperCase()}
                        {volunteer.lastName
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <strong>
                          {getVolunteerName(
                            volunteer,
                          )}
                        </strong>

                        <span>
                          {volunteer.id} ·{" "}
                          {volunteer.email}
                        </span>
                      </div>
                    </div>

                    <div className="project-volunteer-row__meta">
                      <span className="project-volunteer-row__status">
                        {volunteer.status}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveVolunteer(
                            volunteer.id,
                          )
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </section>

        <section className="project-details-card">
          <div className="project-details-card__header">
            <h2>Coordinator</h2>
            <span>Project owner</span>
          </div>

          <div className="project-details-coordinator">
            <div className="project-details-coordinator__avatar">
              {project.coordinator
                .split(" ")
                .map((part) => part[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>

            <div>
              <strong>
                {project.coordinator}
              </strong>

              <span>Coordinator</span>
            </div>
          </div>
        </section>
      </div>

      <section className="project-operational-tasks">
        <div className="project-operational-tasks__header">
          <div>
            <h2>Project tasks</h2>

            <p>
              Operational tasks currently
              recorded for this project.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                `/coordinator/tasks?project=${project.id}`,
              )
            }
          >
            View all tasks
          </button>
        </div>

        <div className="project-operational-summary">
          <div>
            <span>Operational tasks</span>
            <strong>
              {projectTasks.length}
            </strong>
          </div>

          <div>
            <span>Completed</span>
            <strong>
              {completedOperationalTasks}
            </strong>
          </div>

          <div>
            <span>Completion</span>
            <strong>
              {operationalProgress}%
            </strong>
          </div>
        </div>

        {projectTasks.length === 0 ? (
          <div className="project-tasks-empty">
            <ClipboardList size={28} />

            <h3>No operational tasks yet</h3>

            <p>
              Create the first task for this
              project and assign it to an
              eligible volunteer.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/coordinator/tasks/new?project=${project.id}`,
                )
              }
            >
              <Plus size={14} />
              Create task
            </button>
          </div>
        ) : (
          <>
            <div className="project-tasks-table-wrap">
              <table className="project-tasks-table">
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Volunteer</th>
                    <th>Due date</th>
                    <th>Priority</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {projectTasks.map((task) => {
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
                          <div className="project-task-name">
                            <strong>
                              {task.title}
                            </strong>

                            <span>
                              {task.id}
                            </span>
                          </div>
                        </td>

                        <td>
                          <div className="project-task-volunteer">
                            <UserRound
                              size={13}
                            />

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
                          <span
                            className={`project-task-priority project-task-priority--${task.priority.toLowerCase()}`}
                          >
                            {task.priority}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`project-task-status project-task-status--${getStatusClass(
                              task.status,
                            )}`}
                          >
                            {task.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="project-tasks-mobile">
              {projectTasks.map((task) => {
                const volunteer =
                  getVolunteerById(
                    task.assignedVolunteerId,
                  );

                return (
                  <button
                    type="button"
                    key={task.id}
                    className="project-task-mobile-card"
                    onClick={() =>
                      navigate(
                        `/coordinator/tasks/${task.id}`,
                      )
                    }
                  >
                    <div className="project-task-mobile-card__top">
                      <span>
                        {task.id}
                      </span>

                      <span
                        className={`project-task-status project-task-status--${getStatusClass(
                          task.status,
                        )}`}
                      >
                        {task.status}
                      </span>
                    </div>

                    <strong>
                      {task.title}
                    </strong>

                    <span>
                      <UserRound size={12} />
                      {getVolunteerName(
                        volunteer,
                      )}
                    </span>

                    <span>
                      <CalendarDays size={12} />
                      {formatDate(
                        task.dueDate,
                      )}
                    </span>
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
