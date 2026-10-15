import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../context/authContext.js";
import "./Settings.css";

const PREFERENCES_KEY = "fin_coordinator_preferences";

const DEFAULT_PREFERENCES = {
  emailNotifications: true,
  taskReminders: true,
  compactView: false,
};

function readPreferences() {
  try {
    const saved = localStorage.getItem(PREFERENCES_KEY);
    return saved
      ? { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) }
      : DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export default function Settings() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const user = auth?.user;

  const [preferences, setPreferences] = useState(readPreferences);
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState("success");

  useEffect(() => {
    document.title = "Settings | FIN Coordinator";
  }, []);

  const updatePreference = (event) => {
    const { name, checked } = event.target;
    setPreferences((current) => ({ ...current, [name]: checked }));
    setFeedback("");
  };

  const savePreferences = (event) => {
    event.preventDefault();

    try {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
      setFeedbackType("success");
      setFeedback("Your preferences have been saved on this device.");
    } catch {
      setFeedbackType("error");
      setFeedback("Preferences could not be saved. Check your browser storage settings.");
    }
  };

  const resetPreferences = () => {
    setPreferences(DEFAULT_PREFERENCES);
    try {
      localStorage.setItem(
        PREFERENCES_KEY,
        JSON.stringify(DEFAULT_PREFERENCES),
      );
      setFeedbackType("success");
      setFeedback("Preferences have been reset to their defaults.");
    } catch {
      setFeedbackType("error");
      setFeedback("Preferences could not be reset in browser storage.");
    }
  };

  const handleSignOut = () => {
    if (!window.confirm("Are you sure you want to sign out?")) return;

    auth?.logout?.();
    navigate("/login", { replace: true });
  };

  const fullName =
    user?.name ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    "Coordinator";

  const initials = fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  return (
    <main className="fin-settings">
      <header className="fin-settings__header">
        <div>
          <p className="fin-settings__eyebrow">ACCOUNT MANAGEMENT</p>
          <h1>Settings</h1>
          <p className="fin-settings__subtitle">
            Manage your account information, preferences, and session.
          </p>
        </div>
      </header>

      {feedback && (
        <div
          className={`fin-settings__feedback fin-settings__feedback--${feedbackType}`}
          role="status"
          aria-live="polite"
        >
          {feedback}
        </div>
      )}

      <section className="fin-settings__card" aria-labelledby="profile-heading">
        <div className="fin-settings__section-heading">
          <div>
            <h2 id="profile-heading">Profile information</h2>
            <p>Your account details currently available to this application.</p>
          </div>
          <span className="fin-settings__tag">Read only</span>
        </div>

        <div className="fin-settings__profile">
          <div className="fin-settings__avatar" aria-hidden="true">
            {initials || "C"}
          </div>
          <div>
            <h3>{fullName}</h3>
            <p>{user?.email || "No email available"}</p>
            <span className="fin-settings__role">
              {(user?.role || "coordinator").replace(/[_-]/g, " ")}
            </span>
          </div>
        </div>

        <div className="fin-settings__details">
          <div className="fin-settings__detail">
            <span>Full name</span>
            <strong>{fullName}</strong>
          </div>
          <div className="fin-settings__detail">
            <span>Email address</span>
            <strong>{user?.email || "Not provided"}</strong>
          </div>
          <div className="fin-settings__detail">
            <span>Phone number</span>
            <strong>{user?.phone || "Not provided"}</strong>
          </div>
          <div className="fin-settings__detail">
            <span>Account role</span>
            <strong>
              {(user?.role || "coordinator").replace(/[_-]/g, " ")}
            </strong>
          </div>
        </div>

        <p className="fin-settings__note">
          Profile editing is unavailable until a supported profile-update API
          is confirmed. These details are displayed from your signed-in session.
        </p>
      </section>

      <section className="fin-settings__card" aria-labelledby="preferences-heading">
        <div className="fin-settings__section-heading">
          <div>
            <h2 id="preferences-heading">Preferences</h2>
            <p>Choose how you would like to use the coordinator workspace.</p>
          </div>
        </div>

        <form onSubmit={savePreferences}>
          <div className="fin-settings__preference">
            <div>
              <label htmlFor="emailNotifications">Email notifications</label>
              <p>Preference for receiving project and account updates by email.</p>
            </div>
            <input
              id="emailNotifications"
              name="emailNotifications"
              type="checkbox"
              checked={preferences.emailNotifications}
              onChange={updatePreference}
            />
          </div>

          <div className="fin-settings__preference">
            <div>
              <label htmlFor="taskReminders">Task reminders</label>
              <p>Preference for reminders about assigned tasks and deadlines.</p>
            </div>
            <input
              id="taskReminders"
              name="taskReminders"
              type="checkbox"
              checked={preferences.taskReminders}
              onChange={updatePreference}
            />
          </div>

          <div className="fin-settings__preference">
            <div>
              <label htmlFor="compactView">Compact view</label>
              <p>Save your preference for a more condensed workspace layout.</p>
            </div>
            <input
              id="compactView"
              name="compactView"
              type="checkbox"
              checked={preferences.compactView}
              onChange={updatePreference}
            />
          </div>

          <p className="fin-settings__note">
            These preferences are stored in this browser only. Notification
            delivery and workspace-wide layout changes are not activated by
            these settings.
          </p>

          <div className="fin-settings__actions">
            <button className="fin-settings__button fin-settings__button--secondary" type="button" onClick={resetPreferences}>
              Reset preferences
            </button>
            <button className="fin-settings__button fin-settings__button--primary" type="submit">
              Save preferences
            </button>
          </div>
        </form>
      </section>

      <section className="fin-settings__card" aria-labelledby="security-heading">
        <div className="fin-settings__section-heading">
          <div>
            <h2 id="security-heading">Security and session</h2>
            <p>Manage the current sign-in session for this device.</p>
          </div>
        </div>

        <div className="fin-settings__security-row">
          <div>
            <h3>Signed-in session</h3>
            <p>
              Your current session is maintained using the application's local
              browser storage.
            </p>
          </div>
          <span className="fin-settings__session-status">Active</span>
        </div>

        <div className="fin-settings__security-row">
          <div>
            <h3>Password management</h3>
            <p>
              Password changes are not available here because a supported
              password-update endpoint has not been confirmed.
            </p>
          </div>
        </div>

        <div className="fin-settings__actions">
          <button
            className="fin-settings__button fin-settings__button--danger"
            type="button"
            onClick={handleSignOut}
          >
            Sign out
          </button>
        </div>
      </section>

      <p className="fin-settings__footer">
        Feasible Impact Network · Coordinator workspace
      </p>
    </main>
  );
}
