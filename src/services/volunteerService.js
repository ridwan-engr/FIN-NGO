import { volunteers as seedVolunteers } from "../data/volunteersMock.js";

const STORAGE_KEY = "fin_volunteers";

function cloneSeedVolunteers() {
  return seedVolunteers.map((volunteer) => ({
    ...volunteer,
    skills: [...volunteer.skills],
    projectIds: [...volunteer.projectIds],
  }));
}

export function getVolunteers() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      const initial = cloneSeedVolunteers();

      saveVolunteers(initial);

      return initial;
    }

    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      throw new Error(
        "Stored volunteer data is invalid.",
      );
    }

    return parsed;
  } catch {
    const fallback = cloneSeedVolunteers();

    saveVolunteers(fallback);

    return fallback;
  }
}

export function saveVolunteers(volunteers) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(volunteers),
  );
}

export function generateVolunteerId(volunteers) {
  const highestNumber = volunteers.reduce(
    (highest, volunteer) => {
      const numericId = Number(
        volunteer.id.replace("VOL-", ""),
      );

      return Number.isFinite(numericId)
        ? Math.max(highest, numericId)
        : highest;
    },
    0,
  );

  return `VOL-${String(
    highestNumber + 1,
  ).padStart(3, "0")}`;
}
