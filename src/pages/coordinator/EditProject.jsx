import { useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Save,
} from "lucide-react";
import {
  Navigate,
  useNavigate,
  useParams,
} from "react-router-dom";

import useProjects from "../../hooks/useProjects.js";
import { PROJECT_STATUS } from "../../data/projectsMock.js";

import "./CreateProject.css";

export default function EditProject() {
  const navigate = useNavigate();
  const { projectId } = useParams();

  const {
    getProjectById,
    updateProject,
  } = useProjects();

  const project = getProjectById(projectId);

 const [form, setForm] = useState(() => ({
  name: project?.name ?? "",
  description: project?.description ?? "",
  location: project?.location ?? "",
  status:
    project?.status ?? PROJECT_STATUS.PLANNING,
  startDate: project?.startDate ?? "",
  endDate: project?.endDate ?? "",
}));

const [errors, setErrors] = useState({});
const [submitting, setSubmitting] = useState(false);

  if (!project) {
    return (
      <Navigate
        to="/coordinator/projects"
        replace
      />
    );
  }

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
      form: "",
    }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name =
        "Project name is required.";
    }

    if (!form.description.trim()) {
      nextErrors.description =
        "Project description is required.";
    }

    if (!form.location.trim()) {
      nextErrors.location =
        "Project location is required.";
    }

    if (!form.startDate) {
      nextErrors.startDate =
        "Start date is required.";
    }

    if (!form.endDate) {
      nextErrors.endDate =
        "End date is required.";
    }

    if (
      form.startDate &&
      form.endDate &&
      form.endDate < form.startDate
    ) {
      nextErrors.endDate =
        "End date cannot be earlier than the start date.";
    }

    return nextErrors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);

    try {
      const updatedProject = updateProject(
        project.id,
        form,
      );

      if (!updatedProject) {
        throw new Error(
          "Project could not be updated.",
        );
      }

      navigate(
        `/coordinator/projects/${project.id}`,
        {
          replace: true,
          state: {
            updated: true,
          },
        },
      );
    } catch {
      setErrors({
        form:
          "The project could not be updated. Please try again.",
      });

      setSubmitting(false);
    }
  };

  return (
    <main className="create-project-page">
      <div className="create-project-page__breadcrumb">
        Coordinator / Projects / {project.name} / Edit
      </div>

      <button
        type="button"
        className="create-project-page__back"
        onClick={() =>
          navigate(
            `/coordinator/projects/${project.id}`,
          )
        }
      >
        <ArrowLeft size={15} />
        Back to project
      </button>

      <header className="create-project-page__header">
        <div>
          <h1>Edit project</h1>

          <p>
            Update project information, timeline and
            operational status.
          </p>
        </div>
      </header>

      <form
        className="create-project-form"
        onSubmit={handleSubmit}
        noValidate
      >
        {errors.form && (
          <div
            className="create-project-form__error-banner"
            role="alert"
          >
            {errors.form}
          </div>
        )}

        <section className="create-project-section">
          <div className="create-project-section__heading">
            <span>01</span>

            <div>
              <h2>Project information</h2>

              <p>
                Update the project's identifying
                information and operating status.
              </p>
            </div>
          </div>

          <div className="create-project-fields">
            <label className="project-form-field project-form-field--full">
              <span>
                Project name
                <strong>*</strong>
              </span>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
              />

              {errors.name && (
                <small className="project-form-error">
                  {errors.name}
                </small>
              )}
            </label>

            <label className="project-form-field project-form-field--full">
              <span>
                Description
                <strong>*</strong>
              </span>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="5"
              />

              <div className="project-form-field__meta">
                {errors.description ? (
                  <small className="project-form-error">
                    {errors.description}
                  </small>
                ) : (
                  <small>
                    Describe the purpose and expected
                    impact.
                  </small>
                )}

                <small>
                  {form.description.length} characters
                </small>
              </div>
            </label>

            <label className="project-form-field">
              <span>
                Location
                <strong>*</strong>
              </span>

              <div className="project-form-input-icon">
                <MapPin size={15} />

                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                />
              </div>

              {errors.location && (
                <small className="project-form-error">
                  {errors.location}
                </small>
              )}
            </label>

            <label className="project-form-field">
              <span>Project status</span>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option value={PROJECT_STATUS.PLANNING}>
                  Planning
                </option>

                <option value={PROJECT_STATUS.ACTIVE}>
                  Active
                </option>

                <option value={PROJECT_STATUS.ON_HOLD}>
                  On Hold
                </option>

                <option value={PROJECT_STATUS.COMPLETED}>
                  Completed
                </option>
              </select>
            </label>
          </div>
        </section>

        <section className="create-project-section">
          <div className="create-project-section__heading">
            <span>02</span>

            <div>
              <h2>Project timeline</h2>

              <p>
                Adjust the planned start and completion
                dates.
              </p>
            </div>
          </div>

          <div className="create-project-fields">
            <label className="project-form-field">
              <span>
                Start date
                <strong>*</strong>
              </span>

              <div className="project-form-input-icon">
                <CalendarDays size={15} />

                <input
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                />
              </div>

              {errors.startDate && (
                <small className="project-form-error">
                  {errors.startDate}
                </small>
              )}
            </label>

            <label className="project-form-field">
              <span>
                End date
                <strong>*</strong>
              </span>

              <div className="project-form-input-icon">
                <CalendarDays size={15} />

                <input
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  min={form.startDate || undefined}
                  onChange={handleChange}
                />
              </div>

              {errors.endDate && (
                <small className="project-form-error">
                  {errors.endDate}
                </small>
              )}
            </label>
          </div>
        </section>

        <section className="create-project-section">
          <div className="create-project-section__heading">
            <span>03</span>

            <div>
              <h2>Project ownership</h2>

              <p>
                Project ownership remains assigned to the
                existing coordinator.
              </p>
            </div>
          </div>

          <div className="create-project-owner">
            <div className="create-project-owner__avatar">
              {project.coordinator
                .split(" ")
                .map((part) => part[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>

            <div>
              <strong>{project.coordinator}</strong>
              <span>Project coordinator</span>
            </div>
          </div>
        </section>

        <footer className="create-project-actions">
          <button
            type="button"
            className="create-project-actions__cancel"
            onClick={() =>
              navigate(
                `/coordinator/projects/${project.id}`,
              )
            }
          >
            Cancel
          </button>

          <button
            type="submit"
            className="create-project-actions__submit"
            disabled={submitting}
          >
            <Save size={14} />

            {submitting
              ? "Saving..."
              : "Save changes"}
          </button>
        </footer>
      </form>
    </main>
  );
}
