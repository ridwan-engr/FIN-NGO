import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Mail,
  LockKeyhole,
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

import finLogo from "../../assets/branding/fin-logo.png";
import loginIllustration from "../../assets/images/login-illustration.png";
import googleIcon from "../../assets/google/flat-color-icons_google.png";
import appleIcon from "../../assets/apple/Vector.png";

import "./Auth.css";
import "./LoginPage.css";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
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

      if (rememberMe) {
        localStorage.setItem(
          "fin_remember_login",
          "true",
        );
      } else {
        localStorage.removeItem(
          "fin_remember_login",
        );
      }

      const requestedPath =
        location.state?.from?.pathname;

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

      navigate(getRoleHomeRoute(user.role), {
        replace: true,
      });
    } catch (loginError) {
      setError(
        loginError?.message ||
          "Unable to sign in. Please check your details and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleMobileBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <main className="auth-page login-page">
      {/* =====================================================
          MOBILE HERO / DECORATIVE BACKGROUND
      ====================================================== */}
      <div
        className="login-mobile-hero"
        aria-hidden="true"
      >
        <div className="login-mobile-wave">
          <svg
            viewBox="0 0 804 412"
            preserveAspectRatio="none"
            role="presentation"
          >
            {/* Main green wave */}
            <path
              className="login-wave-green"
              d="
                M0 0
                H804
                V412
                C744 352 682 274 607 210
                C535 148 466 99 405 114
                C330 133 263 201 182 250
                C111 293 55 286 0 285
                Z
              "
            />

            {/* Mint overlay */}
            <path
              className="login-wave-mint"
              d="
                M0 285
                C56 286 112 292 183 250
                C260 204 329 136 405 114
                C433 106 461 111 487 125
                L0 386
                Z
              "
            />
          </svg>
        </div>

        <button
          type="button"
          className="login-mobile-back"
          onClick={handleMobileBack}
          aria-label="Go back"
        >
          <ArrowLeft
            size={30}
            strokeWidth={2.5}
          />
        </button>
      </div>

      {/* =====================================================
          DESKTOP BRAND PANEL
      ====================================================== */}
      <section className="login-brand-panel">
        <div className="login-brand-content">
          <div className="login-brand-lockup">
            <img
              src={finLogo}
              alt="Feasible Impact Network"
              className="login-brand-logo"
            />

            <h2 className="login-brand-name">
              Feasible Impact Network
            </h2>
          </div>

          <div className="login-hero">
            <img
              src={loginIllustration}
              alt="People collaborating around a laptop"
              className="login-illustration"
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          LOGIN PANEL
      ====================================================== */}
      <section className="login-form-panel">
        <div className="login-card">
          {/* =================================================
              HEADING
          ================================================== */}
          <header className="login-heading">
            <h1>Welcome Back</h1>

            <p className="desktop-login-subtitle">
              Please sign in to continue
            </p>

            <p className="mobile-login-subtitle">
              Please enter email id and password
              <br />
              to Sign in
            </p>
          </header>

          {/* =================================================
              FORM
          ================================================== */}
          <form
            className="login-form"
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

            {/* EMAIL */}
            <label className="login-field">
              <span className="login-field-label">
                Email address
              </span>

              <div className="login-input-wrap">
                <Mail
                  className="login-input-icon"
                  size={22}
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
              </div>
            </label>

            {/* PASSWORD */}
            <label className="login-field">
              <span className="login-field-label">
                Password
              </span>

              <div className="login-input-wrap">
                <LockKeyhole
                  className="login-input-icon"
                  size={22}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />

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
                  className="login-password-toggle"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  onClick={() =>
                    setShowPassword(
                      (value) => !value,
                    )
                  }
                >
                  {showPassword ? (
                    <EyeOff size={26} />
                  ) : (
                    <Eye size={26} />
                  )}
                </button>
              </div>
            </label>

            {/* =================================================
                OPTIONS
            ================================================== */}
            <div className="login-options">
              <label className="login-remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) =>
                    setRememberMe(
                      event.target.checked,
                    )
                  }
                />

                <span>Remember Me</span>
              </label>

              <Link
                className="login-forgot"
                to="/forgot-password"
              >
                Forgot Password?
              </Link>
            </div>

            {/* =================================================
                PRIMARY BUTTON
            ================================================== */}
            <button
              type="submit"
              className="login-submit"
              disabled={submitting}
            >
              <span className="desktop-submit-text">
                {submitting
                  ? "SIGNING IN..."
                  : "SIGN IN"}
              </span>

              <span className="mobile-submit-text">
                {submitting
                  ? "LOGGING IN..."
                  : "LOGIN"}
              </span>

              <ArrowRight
                className="desktop-submit-arrow"
                size={22}
                strokeWidth={1.8}
              />
            </button>
          </form>

          {/* =================================================
              DIVIDER
          ================================================== */}
          <div className="login-divider">
            <span />
            <strong>OR</strong>
            <span />
          </div>

          {/* =================================================
              SOCIAL LOGIN
          ================================================== */}
          <div className="login-socials">
            {/* GOOGLE */}
            <button
              type="button"
              className="login-social-button"
              aria-label="Continue with Google"
            >
              <img
                src={googleIcon}
                alt=""
                className="google-icon"
                aria-hidden="true"
              />

              <span>
                Continue with Google
              </span>
            </button>

            {/* APPLE */}
            <button
              type="button"
              className="login-social-button"
              aria-label="Continue with Apple"
            >
              <img
                src={appleIcon}
                alt=""
                className="apple-icon"
                aria-hidden="true"
              />

              <span>
                Continue with Apple
              </span>
            </button>
          </div>

          {/* =================================================
              SIGN UP
          ================================================== */}
          <p className="login-signup">
            <span>New Member?</span>

            <Link to="/signup">
              Sign Up
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
