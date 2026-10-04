import { tasks as seedTasks } from "../data/tasksMock.js";

const STORAGE_KEY = "fin_tasks";

function cloneSeedTasks() {
  return seedTasks.map((task) => ({
    ...task,
  }));
}

export function getTasks() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      const initial = cloneSeedTasks();
      saveTasks(initial);
      return initial;
    }

    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      throw new Error("Stored task data is invalid.");
    }

    return parsed;
  } catch {
    const fallback = cloneSeedTasks();
    saveTasks(fallback);
    return fallback;
  }
}

export function saveTasks(tasks) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(tasks),
  );
}

export function generateTaskId(tasks) {
  const highestNumber = tasks.reduce(
    (highest, task) => {
      const match = /^TSK-(\d+)$/.exec(task.id);

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

  return `TSK-${String(highestNumber + 1).padStart(
    3,
    "0",
  )}`;
}
