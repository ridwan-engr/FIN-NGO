import { useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  canRoleAccessPath,
  getRoleHomeRoute,
} from "../../config/roles.js";

import useAuth from "../../hooks/useAuth.js";

import "./Auth.css";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      const user = await login(form);

      const requestedPath = location.state?.from?.pathname;

      const canReturnToRequestedPath =
        requestedPath &&
        canRoleAccessPath(
          user.role,
          requestedPath,
        );

      if (canReturnToRequestedPath) {
        navigate(requestedPath, {
          replace: true,
        });

        return;
      }

      navigate(
        getRoleHomeRoute(user.role),
        { replace: true },
      );
      
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-brand-panel">
        <div className="auth-brand">
          <span className="auth-brand__mark">FIN</span>

          <div>
            <strong>Feasible Impact</strong>
            <span>Network · Nigeria</span>
          </div>
        </div>

        <div className="auth-brand-panel__content">
          <span className="auth-brand-panel__eyebrow">
            Coordinator Workspace
          </span>

          <h1>
            Coordinate impact.
            <br />
            Empower people.
          </h1>

          <p>
            Manage projects, volunteers, attendance and
            measurable community impact from one workspace.
          </p>
        </div>

        <span className="auth-brand-panel__footer">
          Feasible Impact Network
        </span>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-container">
          <div className="auth-form-heading">
            <span>Welcome back</span>
            <h2>Sign in to your account</h2>

            <p>
              Enter your credentials to continue to your
              workspace.
            </p>
          </div>

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >
            {error && (
              <div
                className="auth-error"
                role="alert"
              >
                {error}
              </div>
            )}

            <label className="auth-field">
              <span>Email address</span>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="name@organisation.org"
                autoComplete="email"
                required
              />
            </label>

            <label className="auth-field">
              <span>Password</span>

              <div className="auth-password">
                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  onClick={() =>
                    setShowPassword((value) => !value)
                  }
                >
                  {showPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>
            </label>

            <div className="auth-form__options">
              <label className="auth-checkbox">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                className="auth-text-button"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={submitting}
            >
              {submitting ? "Signing in..." : "Sign in"}

              {!submitting && (
                <ArrowRight size={16} />
              )}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account?
            <Link to="/signup">Create account</Link>
          </p>

          <div className="auth-demo">
            <strong>Demo coordinator</strong>
            <span>coordinator@feasibleimpact.org</span>
            <span>Password123!</span>
          </div>
        </div>
      </section>
    </main>
  );
}

