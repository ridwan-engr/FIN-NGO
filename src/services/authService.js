import { USER_ROLES } from "../config/roles.js";

const SESSION_STORAGE_KEY = "fin_auth_user";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "https://cohort8-group12-capstone-project-backend.onrender.com"
).replace(/\/+$/, "");

function splitName(fullName = "") {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

function normalizeUser(user, token) {
  if (!user || typeof user !== "object") {
    throw new Error("The server returned an invalid user response.");
  }

  const name = user.name || user.fullName || "";
  const split = splitName(name);

  return {
    id: user.id || user._id || "",
    firstName: user.firstName || split.firstName,
    lastName: user.lastName || split.lastName,
    name: name || [user.firstName, user.lastName].filter(Boolean).join(" "),
    email: user.email || "",
    phone: user.phoneNumber || user.phone || "",
    skills: user.skills || "",
    role: user.role || "",
    organizationId: user.organizationId ?? null,
    token: token || user.token || "",
  };
}

async function apiRequest(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new Error(
      "Unable to connect to the server. Check your internet connection or try again shortly.",
    );
  }

  const responseText = await response.text();
  let result = {};

  if (responseText) {
    try {
      result = JSON.parse(responseText);
    } catch {
      result = { message: responseText };
    }
  }

  if (!response.ok) {
    const message =
      result.message ||
      result.error ||
      result.errors?.[0]?.message ||
      `Request failed with status ${response.status}.`;

    throw new Error(message);
  }

  return result;
}

function saveSession(user) {
  if (!user.token) {
    throw new Error(
      "Authentication succeeded without a session token. Please sign in again.",
    );
  }

  localStorage.setItem(
    SESSION_STORAGE_KEY,
    JSON.stringify(user),
  );
}

export async function loginUser(credentials) {
  const email = credentials.email?.trim().toLowerCase();
  const password = credentials.password;

  if (!email || !password) {
    throw new Error("Enter your email address and password.");
  }

  const result = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  const responseUser = result.user || result.data?.user;
  const token = responseUser?.token || result.token;

  if (!responseUser || !token) {
    throw new Error(
      "The server response did not contain the expected user and authentication token.",
    );
  }

  const authenticatedUser = normalizeUser(responseUser, token);

  saveSession(authenticatedUser);

  return authenticatedUser;
}

export async function registerUser(payload) {
  const name =
    payload.name ||
    [payload.firstName, payload.lastName].filter(Boolean).join(" ");

  const email = payload.email?.trim().toLowerCase();
  const role = payload.role;

  if (!name.trim()) {
    throw new Error("Please enter your full name.");
  }

  if (!email || !payload.password) {
    throw new Error("Email address and password are required.");
  }

  if (
    ![USER_ROLES.VOLUNTEER, USER_ROLES.COORDINATOR].includes(role)
  ) {
    throw new Error(
      "The backend currently supports signup for volunteers and project coordinators only. NGO accounts require a supported backend registration process.",
    );
  }

  await apiRequest("/auth/signup", {
    method: "POST",
    body: JSON.stringify({
      name: name.trim(),
      email,
      password: payload.password,
      phoneNumber: payload.phone?.trim() || "",
      role,
    }),
  });

  // Signup does not return a JWT in the documented API response.
  // Sign in after registration to obtain a token and establish a session.
  return loginUser({
    email,
    password: payload.password,
  });
}

export function getStoredUser() {
  try {
    const value = localStorage.getItem(SESSION_STORAGE_KEY);

    if (!value) return null;

    const user = JSON.parse(value);

    if (!user?.token || !user?.role) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }

    return user;
  } catch {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

export function logoutUser() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}
