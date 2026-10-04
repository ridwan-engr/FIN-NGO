import { projects as seedProjects } from "../data/projectsMock.js";

const STORAGE_KEY = "fin_projects";

function cloneSeedProjects() {
  return seedProjects.map((project) => ({
    ...project,
  }));
}

export function getProjects() {
  try {
    const storedProjects = localStorage.getItem(STORAGE_KEY);

    if (!storedProjects) {
      const initialProjects = cloneSeedProjects();

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(initialProjects),
      );

      return initialProjects;
    }

    const parsedProjects = JSON.parse(storedProjects);

    if (!Array.isArray(parsedProjects)) {
      throw new Error("Stored project data is invalid.");
    }

    return parsedProjects;
  } catch {
    const fallbackProjects = cloneSeedProjects();

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(fallbackProjects),
    );

    return fallbackProjects;
  }
}

export function saveProjects(projects) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(projects),
  );
}

export function generateProjectId(projects) {
  const highestNumber = projects.reduce(
    (highest, project) => {
      const match = /^PRJ-(\d+)$/.exec(project.id);

      if (!match) {
        return highest;
      }

      return Math.max(
        highest,
        Number.parseInt(match[1], 10),
      );
    },
    0,
  );

  return `PRJ-${String(highestNumber + 1).padStart(
    3,
    "0",
  )}`;
}
