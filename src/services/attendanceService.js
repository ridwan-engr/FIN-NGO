import {
  attendanceRecords as seedAttendanceRecords,
} from "../data/attendanceMock.js";

const STORAGE_KEY = "fin_attendance";

function cloneSeedRecords() {
  return seedAttendanceRecords.map((record) => ({
    ...record,
  }));
}

export function getAttendanceRecords() {
  try {
    const stored = localStorage.getItem(
      STORAGE_KEY,
    );

    if (!stored) {
      const initial = cloneSeedRecords();

      saveAttendanceRecords(initial);

      return initial;
    }

    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      throw new Error(
        "Stored attendance data is invalid.",
      );
    }

    return parsed;
  } catch {
    const fallback = cloneSeedRecords();

    saveAttendanceRecords(fallback);

    return fallback;
  }
}

export function saveAttendanceRecords(records) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(records),
  );
}

export function generateAttendanceId(records) {
  const highestNumber = records.reduce(
    (highest, record) => {
      const match = /^ATT-(\d+)$/.exec(
        record.id ?? "",
      );

      if (!match) {
        return highest;
      }

      return Math.max(
        highest,
        Number(match[1]),
      );
    },
    0,
  );

  return `ATT-${String(
    highestNumber + 1,
  ).padStart(3, "0")}`;
}
