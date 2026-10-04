import { USER_ROLES } from "../config/roles.js";

const SESSION_STORAGE_KEY = "fin_auth_user";
const USERS_STORAGE_KEY = "fin_registered_users";

const demoUsers = [
  {
    id: "coord-001",
    firstName: "Adaobi",
    lastName: "Nwosu",
    email: "coordinator@feasibleimpact.org",
    phone: "",
    skills: "",
    password: "Password123!",
    role: USER_ROLES.COORDINATOR,
  },
  {
    id: "vol-001",
    firstName: "Chinedu",
    lastName: "Eze",
    email: "volunteer@feasibleimpact.org",
    phone: "",
    skills: "Community outreach",
    password: "Password123!",
    role: USER_ROLES.VOLUNTEER,
  },
  {
    id: "ngo-001",
    firstName: "Feasible Impact",
    lastName: "Network",
    email: "ngo@feasibleimpact.org",
    phone: "",
    skills: "",
    password: "Password123!",
    role: USER_ROLES.NGO,
  },
];

function delay(ms = 300) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function publicUser(user) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone ?? "",
    skills: user.skills ?? "",
    role: user.role,
  };
}

function getRegisteredUsers() {
  try {
    const storedUsers = localStorage.getItem(
      USERS_STORAGE_KEY,
    );

    if (!storedUsers) {
      return [];
    }

    const parsedUsers = JSON.parse(storedUsers);

    return Array.isArray(parsedUsers)
      ? parsedUsers
      : [];
  } catch {
    return [];
  }
}

function saveRegisteredUsers(users) {
  localStorage.setItem(
    USERS_STORAGE_KEY,
    JSON.stringify(users),
  );
}

function getAllUsers() {
  return [
    ...demoUsers,
    ...getRegisteredUsers(),
  ];
}

export async function loginUser(credentials) {
  await delay();

  const email = credentials.email
    .trim()
    .toLowerCase();

  const user = getAllUsers().find(
    (item) =>
      item.email.toLowerCase() === email &&
      item.password === credentials.password,
  );

  if (!user) {
    throw new Error(
      "Invalid email address or password.",
    );
  }

  const authenticatedUser = publicUser(user);

  localStorage.setItem(
    SESSION_STORAGE_KEY,
    JSON.stringify(authenticatedUser),
  );

  return authenticatedUser;
}

export async function registerUser(payload) {
  await delay();

  const email = payload.email
    .trim()
    .toLowerCase();

  const existingUser = getAllUsers().some(
    (item) =>
      item.email.toLowerCase() === email,
  );

  if (existingUser) {
    throw new Error(
      "An account with this email already exists.",
    );
  }

  if (
    !Object.values(USER_ROLES).includes(payload.role)
  ) {
    throw new Error(
      "Please select a valid account role.",
    );
  }

  const newUser = {
    id: `user-${Date.now()}`,
    firstName: payload.firstName.trim(),
    lastName: payload.lastName.trim(),
    email,
    phone: payload.phone?.trim() ?? "",
    skills: payload.skills?.trim() ?? "",
    password: payload.password,
    role: payload.role,
    createdAt: new Date().toISOString(),
  };

  const registeredUsers = getRegisteredUsers();

  saveRegisteredUsers([
    ...registeredUsers,
    newUser,
  ]);

  const authenticatedUser = publicUser(newUser);

  localStorage.setItem(
    SESSION_STORAGE_KEY,
    JSON.stringify(authenticatedUser),
  );

  return authenticatedUser;
}

export function getStoredUser() {
  try {
    const value = localStorage.getItem(
      SESSION_STORAGE_KEY,
    );

    return value
      ? JSON.parse(value)
      : null;
  } catch {
    localStorage.removeItem(
      SESSION_STORAGE_KEY,
    );

    return null;
  }
}

export function logoutUser() {
  localStorage.removeItem(
    SESSION_STORAGE_KEY,
  );
}
