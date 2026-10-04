import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
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

import {
  TASK_PRIORITY,
  TASK_STATUS,
} from "../../data/tasksMock.js";

import { getVolunteerName } from "../../data/volunteersMock.js";

import useProjects from "../../hooks/useProjects.js";
import useTasks from "../../hooks/useTasks.js";
import useVolunteers from "../../hooks/useVolunteers.js";

import "./CreateTask.css";

const INITIAL_FORM = {
  projectId: "",
  title: "",
  description: "",
  assignedVolunteerId: "",
  priority: TASK_PRIORITY.MEDIUM,
  dueDate: "",
};

export default function CreateTask() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const { projects, getProjectById } =
    useProjects();

  const { createTask } = useTasks();

  const {
    volunteers,
    getVolunteersByProject,
  } = useVolunteers();

  const requestedProjectId =
    searchParams.get("project") ?? "";

  const validRequestedProject =
    projects.some(
      (project) =>
        project.id === requestedProjectId,
    )
      ? requestedProjectId
      : "";

  const [form, setForm] = useState(() => ({
    ...INITIAL_FORM,
    projectId: validRequestedProject,
  }));

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const selectedProject = useMemo(
    () =>
      form.projectId
        ? getProjectById(form.projectId)
        : null,
    [form.projectId, getProjectById],
  );

  const eligibleVolunteers = useMemo(() => {
    if (!form.projectId) {
      return volunteers;
    }

    return getVolunteersByProject(
      form.projectId,
    );
  }, [
    form.projectId,
    volunteers,
    getVolunteersByProject,
  ]);

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: "",
    }));
  }

  function handleProjectChange(value) {
    setForm((current) => ({
      ...current,
      projectId: value,
      assignedVolunteerId: "",
    }));

    setErrors((current) => ({
      ...current,
      projectId: "",
      assignedVolunteerId: "",
    }));
  }

  function validate() {
    const nextErrors = {};

    if (!form.projectId) {
      nextErrors.projectId =
        "Select a project.";
    }

    if (!form.title.trim()) {
      nextErrors.title =
        "Enter a task title.";
    }

    if (!form.dueDate) {
      nextErrors.dueDate =
        "Select a due date.";
    }

    if (
      form.assignedVolunteerId &&
      !eligibleVolunteers.some(
        (volunteer) =>
          volunteer.id ===
          form.assignedVolunteerId,
      )
    ) {
      nextErrors.assignedVolunteerId =
        "Select a volunteer assigned to this project.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    const createdTask = createTask({
      projectId: form.projectId,
      title: form.title,
      description: form.description,
      assignedVolunteerId:
        form.assignedVolunteerId,
      priority: form.priority,
      status: TASK_STATUS.NOT_STARTED,
      dueDate: form.dueDate,
    });

    navigate(
      `/coordinator/tasks?project=${createdTask.projectId}`,
      {
        replace: true,
        state: {
          created: true,
          taskId: createdTask.id,
        },
      },
    );
  }

  return (
    <main className="create-task-page">
      <div className="create-task-page__breadcrumb">
        Coordinator / Tasks / Create task
      </div>

      <button
        type="button"
        className="create-task-back"
        onClick={() =>
          navigate("/coordinator/tasks")
        }
      >
        <ArrowLeft size={15} />
        Back to tasks
      </button>

      <header className="create-task-header">
        <div className="create-task-header__icon">
          <ClipboardList size={22} />
        </div>

        <div>
          <h1>Create Task</h1>

          <p>
            Add a task to a project and assign
            it to an eligible volunteer.
          </p>
        </div>
      </header>

      <form
        className="create-task-form"
        onSubmit={handleSubmit}
        noValidate
      >
        <section className="create-task-card">
          <div className="create-task-card__header">
            <div>
              <h2>Task information</h2>
              <p>
                Define the project, activity
                and delivery requirements.
              </p>
            </div>

            <span>Required fields *</span>
          </div>

          <div className="create-task-grid">
            <label className="create-task-field">
              <span>Project *</span>

              <select
                value={form.projectId}
                onChange={(event) =>
                  handleProjectChange(
                    event.target.value,
                  )
                }
                className={
                  errors.projectId
                    ? "has-error"
                    : ""
                }
              >
                <option value="">
                  Select project
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

              {errors.projectId && (
                <small className="create-task-error">
                  {errors.projectId}
                </small>
              )}
            </label>

            <label className="create-task-field">
              <span>Priority *</span>

              <select
                value={form.priority}
                onChange={(event) =>
                  updateField(
                    "priority",
                    event.target.value,
                  )
                }
              >
                {Object.values(
                  TASK_PRIORITY,
                ).map((priority) => (
                  <option
                    key={priority}
                    value={priority}
                  >
                    {priority}
                  </option>
                ))}
              </select>
            </label>

            <label className="create-task-field create-task-field--wide">
              <span>Task title *</span>

              <input
                type="text"
                value={form.title}
                onChange={(event) =>
                  updateField(
                    "title",
                    event.target.value,
                  )
                }
                placeholder="e.g. Coordinate volunteer orientation"
                className={
                  errors.title
                    ? "has-error"
                    : ""
                }
              />

              {errors.title && (
                <small className="create-task-error">
                  {errors.title}
                </small>
              )}
            </label>

            <label className="create-task-field create-task-field--wide">
              <span>Description</span>

              <textarea
                rows="5"
                value={form.description}
                onChange={(event) =>
                  updateField(
                    "description",
                    event.target.value,
                  )
                }
                placeholder="Describe the activity, expected outcome and any important instructions."
              />
            </label>
          </div>
        </section>

        <section className="create-task-card">
          <div className="create-task-card__header">
            <div>
              <h2>Assignment & schedule</h2>

              <p>
                Choose a volunteer and set the
                expected completion date.
              </p>
            </div>
          </div>

          <div className="create-task-grid">
            <label className="create-task-field">
              <span>
                <UserRound size={14} />
                Volunteer
              </span>

              <select
                value={
                  form.assignedVolunteerId
                }
                disabled={!form.projectId}
                onChange={(event) =>
                  updateField(
                    "assignedVolunteerId",
                    event.target.value,
                  )
                }
                className={
                  errors.assignedVolunteerId
                    ? "has-error"
                    : ""
                }
              >
                <option value="">
                  {form.projectId
                    ? "Leave unassigned"
                    : "Select a project first"}
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

              {errors.assignedVolunteerId && (
                <small className="create-task-error">
                  {
                    errors.assignedVolunteerId
                  }
                </small>
              )}

              {form.projectId &&
                eligibleVolunteers.length ===
                  0 && (
                  <small className="create-task-help">
                    No volunteers are currently
                    assigned to this project.
                    You can create the task
                    unassigned.
                  </small>
                )}
            </label>

            <label className="create-task-field">
              <span>
                <CalendarDays size={14} />
                Due date *
              </span>

              <input
                type="date"
                value={form.dueDate}
                onChange={(event) =>
                  updateField(
                    "dueDate",
                    event.target.value,
                  )
                }
                className={
                  errors.dueDate
                    ? "has-error"
                    : ""
                }
              />

              {errors.dueDate && (
                <small className="create-task-error">
                  {errors.dueDate}
                </small>
              )}
            </label>
          </div>

          {selectedProject && (
            <div className="create-task-project-summary">
              <CheckCircle2 size={17} />

              <div>
                <strong>
                  {selectedProject.name}
                </strong>

                <span>
                  {selectedProject.location} ·{" "}
                  {eligibleVolunteers.length}{" "}
                  eligible volunteer
                  {eligibleVolunteers.length ===
                  1
                    ? ""
                    : "s"}
                </span>
              </div>
            </div>
          )}
        </section>

        <div className="create-task-actions">
          <button
            type="button"
            className="create-task-cancel"
            onClick={() =>
              navigate(
                form.projectId
                  ? `/coordinator/tasks?project=${form.projectId}`
                  : "/coordinator/tasks",
              )
            }
          >
            Cancel
          </button>

          <button
            type="submit"
            className="create-task-submit"
            disabled={isSubmitting}
          >
            <ClipboardList size={16} />

            {isSubmitting
              ? "Creating..."
              : "Create task"}
          </button>
        </div>
      </form>
    </main>
  );
}
