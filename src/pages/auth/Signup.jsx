import { useState } from "react";
import {
  Building2,
  Users,
  ClipboardList,
  UserRound,
  Mail,
  Phone,
  Command,
  LockKeyhole,
} from "lucide-react";

import {
  getRoleHomeRoute,
} from "../../config/roles.js";
import { Link, useNavigate } from "react-router-dom";

import useAuth from "../../hooks/useAuth.js";
import finLogo from "../../assets/branding/fin-logo.png";

import "./Auth.css";

const roles = [
  {
    id: "volunteer",
    label: "Volunteer",
    icon: Users,
  },
  {
    id: "coordinator",
    label: "Project Coordinator",
    icon: ClipboardList,
  },
];

function splitFullName(fullName) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" ") || parts[0] || "",
  };
}

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [selectedRole, setSelectedRole] =
    useState("volunteer");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    skills: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!form.fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (form.password.length < 8) {
      setError(
        "Password must contain at least 8 characters.",
      );
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const { firstName, lastName } =
      splitFullName(form.fullName);

    setSubmitting(true);

    try {
      const user = await signup({
        firstName,
        lastName,
        email: form.email,
        phone: form.phone,
        skills: form.skills,
        role: selectedRole,
        password: form.password,
      });

      navigate(
        getRoleHomeRoute(user.role),
        { replace: true },
      );
      
    } catch (signupError) {
      setError(signupError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const accountLabel =
    selectedRole === "coordinator"
      ? "Project Coordinator"
      : selectedRole === "ngo"
        ? "NGO"
        : "Volunteer";

  return (
    <main className="signup-page">
      <section className="signup-intro">
        <div className="signup-intro__content">
          <img
            src={finLogo}
            alt="Feasible Impact Network"
            className="signup-intro__logo"
          />

          <h1>Join Feasible Impact Network</h1>

          <p>Select your primary role to get started</p>

          <div
            className="signup-role-grid"
            aria-label="Select your primary role"
          >
            {roles.map((role) => {
              const Icon = role.icon;
              const isSelected =
                selectedRole === role.id;

              return (
                <button
                  key={role.id}
                  type="button"
                  className={[
                    "signup-role-card",
                    isSelected
                      ? "signup-role-card--selected"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() =>
                    handleRoleChange(role.id)
                  }
                  aria-pressed={isSelected}
                >
                  <span className="signup-role-card__icon">
                    <Icon
                      size={31}
                      strokeWidth={2.4}
                    />
                  </span>

                  <span className="signup-role-card__label">
                    {role.label ===
                      "Project Coordinator" ? (
                      <>
                        Project
                        <br />
                        Coordinator
                      </>
                    ) : (
                      role.label
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="signup-form-section">
        <div className="signup-card">
          <header className="signup-card__header">
            <h2>Signup</h2>

            <p>
              Create your {accountLabel} Account
            </p>
          </header>

          <form
            className="signup-form"
            onSubmit={handleSubmit}
          >
            {error && (
              <div
                className="signup-error"
                role="alert"
              >
                {error}
              </div>
            )}

            <label className="signup-input">
              <UserRound
                size={27}
                strokeWidth={1.8}
                aria-hidden="true"
              />

              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Full Name"
                autoComplete="name"
                required
              />
            </label>

            <label className="signup-input">
              <Mail
                size={27}
                strokeWidth={1.8}
                aria-hidden="true"
              />

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email Address"
                autoComplete="email"
                required
              />
            </label>

            <label className="signup-input">
              <Phone
                size={27}
                strokeWidth={1.8}
                aria-hidden="true"
              />

              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone Number"
                autoComplete="tel"
                required
              />
            </label>

            <label className="signup-input">
              <Command
                size={25}
                strokeWidth={2}
                aria-hidden="true"
              />

              <input
                type="text"
                name="skills"
                value={form.skills}
                onChange={handleChange}
                placeholder="Skills & Interest"
                required
              />
            </label>

            <label className="signup-input">
              <LockKeyhole
                size={27}
                strokeWidth={1.8}
                aria-hidden="true"
              />

              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                autoComplete="new-password"
                minLength="8"
                required
              />
            </label>

            <label className="signup-input">
              <LockKeyhole
                size={27}
                strokeWidth={1.8}
                aria-hidden="true"
              />

              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                autoComplete="new-password"
                minLength="8"
                required
              />
            </label>

            <button
              type="submit"
              className="signup-create-button"
              disabled={submitting}
            >
              {submitting
                ? "CREATING ACCOUNT..."
                : "CREATE ACCOUNT"}
            </button>
          </form>

          <p className="signup-signin">
            <span>Already Member?</span>
            <Link to="/login">Sign In</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

