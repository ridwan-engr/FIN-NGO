import { useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  MapPin,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import useAuth from "../../hooks/useAuth.js";
import useProjects from "../../hooks/useProjects.js";

import { PROJECT_STATUS } from "../../data/projectsMock.js";

import "./CreateProject.css";

const initialForm = {
  name: "",
  description: "",
  location: "",
  startDate: "",
  endDate: "",
  status: PROJECT_STATUS.PLANNING,
};

export default function CreateProject() {
  const navigate = useNavigate();

  const { user } = useAuth();
  const { createProject } = useProjects();

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const coordinatorName = user
    ? `${user.firstName} ${user.lastName}`
    : "Coordinator";

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
      nextErrors.name = "Project name is required.";
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
      const project = createProject({
        ...form,
        coordinator: coordinatorName,
      });

      navigate(
        `/coordinator/projects/${project.id}`,
        {
          replace: true,
          state: {
            created: true,
          },
        },
      );
    } catch {
      setErrors({
        form:
          "The project could not be created. Please try again.",
      });

      setSubmitting(false);
    }
  };

  return (
    <main className="create-project-page">
      <div className="create-project-page__breadcrumb">
        Coordinator / Projects / Create project
      </div>

      <button
        type="button"
        className="create-project-page__back"
        onClick={() =>
          navigate("/coordinator/projects")
        }
      >
        <ArrowLeft size={15} />
        Back to projects
      </button>

      <header className="create-project-page__header">
        <div>
          <h1>Create project</h1>

          <p>
            Define the project information, timeline and
            initial operating status.
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
                Provide the basic information used to identify
                the project.
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
                placeholder="e.g. Community Education"
                autoFocus
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
                placeholder="Describe the purpose and expected impact of this project..."
                rows="5"
              />

              <div className="project-form-field__meta">
                {errors.description ? (
                  <small className="project-form-error">
                    {errors.description}
                  </small>
                ) : (
                  <small>
                    Give coordinators and volunteers a clear
                    understanding of the project.
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
                  placeholder="City or state"
                />
              </div>

              {errors.location && (
                <small className="project-form-error">
                  {errors.location}
                </small>
              )}
            </label>

            <label className="project-form-field">
              <span>Initial status</span>

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
                Set the planned project start and completion
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
              <h2>Coordinator</h2>

              <p>
                The signed-in coordinator will initially own
                this project.
              </p>
            </div>
          </div>

          <div className="create-project-owner">
            <div className="create-project-owner__avatar">
              {user?.firstName?.[0] ?? "C"}
              {user?.lastName?.[0] ?? ""}
            </div>

            <div>
              <strong>{coordinatorName}</strong>
              <span>Project coordinator</span>
            </div>

            <Check size={17} />
          </div>
        </section>

        <footer className="create-project-actions">
          <button
            type="button"
            className="create-project-actions__cancel"
            onClick={() =>
              navigate("/coordinator/projects")
            }
          >
            Cancel
          </button>

          <button
            type="submit"
            className="create-project-actions__submit"
            disabled={submitting}
          >
            {submitting
              ? "Creating..."
              : "Create project"}
          </button>
        </footer>
      </form>
    </main>
  );
}
