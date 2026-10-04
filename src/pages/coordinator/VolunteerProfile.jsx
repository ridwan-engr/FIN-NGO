import { useMemo } from "react";

import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Mail,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import useProjects from "../../hooks/useProjects.js";
import useTasks from "../../hooks/useTasks.js";
import useVolunteers from "../../hooks/useVolunteers.js";

import StatusChip from "../../components/ui/StatusChip.jsx";

import "./VolunteerProfile.css";

function getVolunteerName(volunteer) {
  if (!volunteer) {
    return "";
  }

  return [
    volunteer.firstName,
    volunteer.lastName,
  ]
    .filter(Boolean)
    .join(" ");
}

function getInitials(volunteer) {
  if (!volunteer) {
    return "VO";
  }

  const first =
    volunteer.firstName?.charAt(0) ?? "";

  const last =
    volunteer.lastName?.charAt(0) ?? "";

  return `${first}${last}`.toUpperCase() || "VO";
}

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

export default function VolunteerProfile() {
  const navigate = useNavigate();

  const { volunteerId } = useParams();

  const {
    getVolunteerById,
  } = useVolunteers();

  const { projects } = useProjects();

  const {
    getTasksByVolunteer,
  } = useTasks();

  const volunteer =
    getVolunteerById(volunteerId);

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

  const assignedProjects = useMemo(
    () =>
      (volunteer?.projectIds ?? [])
        .map((projectId) =>
          projectMap.get(projectId),
        )
        .filter(Boolean),
    [volunteer, projectMap],
  );

  const assignedTasks = useMemo(
    () =>
      volunteer
        ? getTasksByVolunteer(volunteer.id)
        : [],
    [volunteer, getTasksByVolunteer],
  );

  const completedTasks = useMemo(
    () =>
      assignedTasks.filter(
        (task) => task.status === "Completed",
      ).length,
    [assignedTasks],
  );

  const activeTasks =
    assignedTasks.length - completedTasks;

  if (!volunteer) {
    return (
      <main className="volunteer-profile">
        <button
          type="button"
          className="volunteer-profile__back"
          onClick={() =>
            navigate("/coordinator/volunteers")
          }
        >
          <ArrowLeft size={16} />
          Back to volunteers
        </button>

        <section className="volunteer-profile__not-found">
          <UserRound size={32} />

          <h1>Volunteer not found</h1>

          <p>
            The requested volunteer record does not
            exist or is no longer available.
          </p>
        </section>
      </main>
    );
  }

  const volunteerName =
    getVolunteerName(volunteer);

  return (
    <main className="volunteer-profile">
      <p className="volunteer-profile__breadcrumb">
        Coordinator / Volunteers / {volunteerName}
      </p>

      <button
        type="button"
        className="volunteer-profile__back"
        onClick={() =>
          navigate("/coordinator/volunteers")
        }
      >
        <ArrowLeft size={15} />
        Back to volunteers
      </button>

      <section className="volunteer-profile__hero">
        <div className="volunteer-profile__identity">
          <span className="volunteer-profile__avatar">
            {getInitials(volunteer)}
          </span>

          <div>
            <div className="volunteer-profile__title">
              <h1>{volunteerName}</h1>

              <StatusChip
                status={volunteer.status}
              />
            </div>

            <p>{volunteer.id}</p>

            <span>
              {volunteer.projectIds?.length
                ? "Assigned volunteer"
                : "Currently unassigned"}
            </span>
          </div>
        </div>
      </section>

      <section className="volunteer-profile__metrics">
        <article>
          <span className="volunteer-profile__metric-icon">
            <BriefcaseBusiness size={18} />
          </span>

          <div>
            <small>Projects</small>
            <strong>
              {assignedProjects.length}
            </strong>
          </div>
        </article>

        <article>
          <span className="volunteer-profile__metric-icon">
            <CalendarDays size={18} />
          </span>

          <div>
            <small>Assigned tasks</small>
            <strong>
              {assignedTasks.length}
            </strong>
          </div>
        </article>

        <article>
          <span className="volunteer-profile__metric-icon">
            <Clock3 size={18} />
          </span>

          <div>
            <small>Verified hours</small>
            <strong>
              {volunteer.verifiedHours ?? 0}
            </strong>
          </div>
        </article>

        <article>
          <span className="volunteer-profile__metric-icon">
            <CheckCircle2 size={18} />
          </span>

          <div>
            <small>Completed tasks</small>
            <strong>{completedTasks}</strong>
          </div>
        </article>
      </section>

      <section className="volunteer-profile__grid">
        <article className="volunteer-profile-card">
          <header>
            <div>
              <h2>Volunteer information</h2>
              <p>
                Contact and operational information.
              </p>
            </div>
          </header>

          <div className="volunteer-profile__information">
            <div>
              <span>
                <Mail size={15} />
                Email address
              </span>

              <strong>
                {volunteer.email || "Not provided"}
              </strong>
            </div>

            <div>
              <span>
                <Phone size={15} />
                Phone number
              </span>

              <strong>
                {volunteer.phone || "Not provided"}
              </strong>
            </div>

            <div>
              <span>
                <MapPin size={15} />
                Location
              </span>

              <strong>
                {volunteer.location ||
                  "Not provided"}
              </strong>
            </div>

            <div>
              <span>
                <UserRound size={15} />
                Volunteer ID
              </span>

              <strong>{volunteer.id}</strong>
            </div>
          </div>
        </article>

        <article className="volunteer-profile-card">
          <header>
            <div>
              <h2>Skills & interests</h2>
              <p>
                Volunteer capability profile.
              </p>
            </div>
          </header>

          <div className="volunteer-profile__skills">
            {volunteer.skills?.length ? (
              volunteer.skills.map((skill) => (
                <span key={skill}>
                  {skill}
                </span>
              ))
            ) : (
              <p>No skills have been added.</p>
            )}
          </div>
        </article>
      </section>

      <section className="volunteer-profile-card volunteer-profile__projects">
        <header>
          <div>
            <h2>Assigned projects</h2>
            <p>
              Projects currently associated with this
              volunteer.
            </p>
          </div>

          <strong>
            {assignedProjects.length}
          </strong>
        </header>

        {assignedProjects.length ? (
          <div className="volunteer-profile__project-list">
            {assignedProjects.map((project) => (
              <button
                key={project.id}
                type="button"
                onClick={() =>
                  navigate(
                    `/coordinator/projects/${project.id}`,
                  )
                }
              >
                <span>
                  <BriefcaseBusiness size={17} />
                </span>

                <div>
                  <strong>{project.name}</strong>
                  <small>
                    {project.location ||
                      "Location not provided"}
                  </small>
                </div>

                <StatusChip
                  status={project.status}
                />
              </button>
            ))}
          </div>
        ) : (
          <div className="volunteer-profile__empty">
            <BriefcaseBusiness size={24} />

            <strong>No assigned projects</strong>

            <span>
              This volunteer is not currently assigned
              to a project.
            </span>
          </div>
        )}
      </section>

      <section className="volunteer-profile-card volunteer-profile__tasks">
        <header>
          <div>
            <h2>Assigned tasks</h2>
            <p>
              Current task workload and delivery
              status.
            </p>
          </div>

          <span>
            {activeTasks} active /{" "}
            {completedTasks} completed
          </span>
        </header>

        {assignedTasks.length ? (
          <>
            <div className="volunteer-profile-task-table">
              <div className="volunteer-profile-task-table__header">
                <span>Task</span>
                <span>Project</span>
                <span>Due date</span>
                <span>Priority</span>
                <span>Status</span>
              </div>

              {assignedTasks.map((task) => {
                const project =
                  projectMap.get(task.projectId);

                return (
                  <article
                    key={task.id}
                    className="volunteer-profile-task-table__row"
                  >
                    <div>
                      <strong>{task.title}</strong>
                      <small>{task.id}</small>
                    </div>

                    <span>
                      {project?.name ??
                        "Unknown project"}
                    </span>

                    <span>
                      {formatDate(task.dueDate)}
                    </span>

                    <span
                      className={`volunteer-profile__priority volunteer-profile__priority--${task.priority
                        .toLowerCase()
                        .replaceAll(" ", "-")}`}
                    >
                      {task.priority}
                    </span>

                    <StatusChip
                      status={task.status}
                    />
                  </article>
                );
              })}
            </div>

            <div className="volunteer-profile-task-cards">
              {assignedTasks.map((task) => {
                const project =
                  projectMap.get(task.projectId);

                return (
                  <article key={task.id}>
                    <div>
                      <strong>{task.title}</strong>

                      <StatusChip
                        status={task.status}
                      />
                    </div>

                    <span>
                      {project?.name ??
                        "Unknown project"}
                    </span>

                    <small>
                      Due {formatDate(task.dueDate)}
                    </small>
                  </article>
                );
              })}
            </div>
          </>
        ) : (
          <div className="volunteer-profile__empty">
            <CalendarDays size={24} />

            <strong>No assigned tasks</strong>

            <span>
              This volunteer does not currently have
              any assigned tasks.
            </span>
          </div>
        )}
      </section>
    </main>
  );
}
