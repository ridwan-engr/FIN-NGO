import {
  useCallback,
  useMemo,
  useState,
} from "react";

import AttendanceContext from "./attendanceContext.js";

import {
  ATTENDANCE_STATUS,
  ATTENDANCE_TYPE,
} from "../data/attendanceMock.js";

import {
  generateAttendanceId,
  getAttendanceRecords,
  saveAttendanceRecords,
} from "../services/attendanceService.js";

function calculateSubmittedHours(
  checkInAt,
  checkOutAt,
) {
  const start = new Date(checkInAt);
  const end = new Date(checkOutAt);

  const milliseconds =
    end.getTime() - start.getTime();

  if (
    Number.isNaN(milliseconds) ||
    milliseconds <= 0
  ) {
    return 0;
  }

  return Number(
    (
      milliseconds /
      (1000 * 60 * 60)
    ).toFixed(2),
  );
}

export function AttendanceProvider({
  children,
}) {
  const [
    attendanceRecords,
    setAttendanceRecords,
  ] = useState(() => getAttendanceRecords());

  const createCheckIn = useCallback(
    (payload) => {
      if (
        !payload?.volunteerId ||
        !payload?.projectId
      ) {
        return null;
      }

      const existingActiveRecord =
        attendanceRecords.find(
          (record) =>
            record.volunteerId ===
              payload.volunteerId &&
            record.checkOutAt === null,
        );

      if (existingActiveRecord) {
        return existingActiveRecord;
      }

      const now = new Date().toISOString();

      const createdRecord = {
        id: generateAttendanceId(
          attendanceRecords,
        ),
        volunteerId: payload.volunteerId,
        projectId: payload.projectId,
        taskId: payload.taskId || null,
        type: ATTENDANCE_TYPE.CHECK_IN,
        status: ATTENDANCE_STATUS.PENDING,
        checkInAt: now,
        checkOutAt: null,
        submittedHours: null,
        verifiedHours: null,
        verificationNote: "",
        verifiedAt: null,
        verifiedBy: null,
        createdAt: now,
        updatedAt: now,
      };

      const updatedRecords = [
        createdRecord,
        ...attendanceRecords,
      ];

      saveAttendanceRecords(updatedRecords);
      setAttendanceRecords(updatedRecords);

      return createdRecord;
    },
    [attendanceRecords],
  );

  const checkOut = useCallback(
    (attendanceId) => {
      const existingRecord =
        attendanceRecords.find(
          (record) =>
            record.id === attendanceId,
        );

      if (
        !existingRecord ||
        existingRecord.checkOutAt !== null
      ) {
        return null;
      }

      const now = new Date().toISOString();

      const updatedRecord = {
        ...existingRecord,
        type: ATTENDANCE_TYPE.CHECK_OUT,
        status: ATTENDANCE_STATUS.PENDING,
        checkOutAt: now,
        submittedHours:
          calculateSubmittedHours(
            existingRecord.checkInAt,
            now,
          ),
        updatedAt: now,
      };

      const updatedRecords =
        attendanceRecords.map((record) =>
          record.id === attendanceId
            ? updatedRecord
            : record,
        );

      saveAttendanceRecords(updatedRecords);
      setAttendanceRecords(updatedRecords);

      return updatedRecord;
    },
    [attendanceRecords],
  );

  const updateAttendance = useCallback(
    (attendanceId, updates) => {
      let updatedRecord = null;

      setAttendanceRecords(
        (currentRecords) => {
          const existingRecord =
            currentRecords.find(
              (record) =>
                record.id === attendanceId,
            );

          if (!existingRecord) {
            return currentRecords;
          }

          updatedRecord = {
            ...existingRecord,
            ...updates,
            updatedAt:
              new Date().toISOString(),
          };

          const updatedRecords =
            currentRecords.map((record) =>
              record.id === attendanceId
                ? updatedRecord
                : record,
            );

          saveAttendanceRecords(
            updatedRecords,
          );

          return updatedRecords;
        },
      );

      return updatedRecord;
    },
    [],
  );

  const verifyAttendance = useCallback(
    (
      attendanceId,
      {
        verifiedBy,
        verifiedHours,
        verificationNote = "",
      } = {},
    ) => {
      let verifiedRecord = null;

      setAttendanceRecords(
        (currentRecords) => {
          const existingRecord =
            currentRecords.find(
              (record) =>
                record.id === attendanceId,
            );

          if (
            !existingRecord ||
            existingRecord.status !==
              ATTENDANCE_STATUS.PENDING ||
            !existingRecord.checkOutAt
          ) {
            return currentRecords;
          }

          const submittedHours = Number(
            existingRecord.submittedHours ?? 0,
          );

          const requestedHours =
            verifiedHours === undefined ||
            verifiedHours === null ||
            verifiedHours === ""
              ? submittedHours
              : Number(verifiedHours);

          if (
            !Number.isFinite(requestedHours) ||
            requestedHours < 0
          ) {
            return currentRecords;
          }

          const now =
            new Date().toISOString();

          verifiedRecord = {
            ...existingRecord,
            status:
              ATTENDANCE_STATUS.VERIFIED,
            verifiedHours: Number(
              requestedHours.toFixed(2),
            ),
            verificationNote:
              verificationNote.trim(),
            verifiedAt: now,
            verifiedBy:
              verifiedBy || null,
            updatedAt: now,
          };

          const updatedRecords =
            currentRecords.map((record) =>
              record.id === attendanceId
                ? verifiedRecord
                : record,
            );

          saveAttendanceRecords(
            updatedRecords,
          );

          return updatedRecords;
        },
      );

      return verifiedRecord;
    },
    [],
  );

  const rejectAttendance = useCallback(
    (
      attendanceId,
      {
        verifiedBy,
        verificationNote = "",
      } = {},
    ) => {
      let rejectedRecord = null;

      setAttendanceRecords(
        (currentRecords) => {
          const existingRecord =
            currentRecords.find(
              (record) =>
                record.id === attendanceId,
            );

          if (
            !existingRecord ||
            existingRecord.status !==
              ATTENDANCE_STATUS.PENDING ||
            !existingRecord.checkOutAt
          ) {
            return currentRecords;
          }

          const now =
            new Date().toISOString();

          rejectedRecord = {
            ...existingRecord,
            status:
              ATTENDANCE_STATUS.REJECTED,
            verifiedHours: null,
            verificationNote:
              verificationNote.trim(),
            verifiedAt: now,
            verifiedBy:
              verifiedBy || null,
            updatedAt: now,
          };

          const updatedRecords =
            currentRecords.map((record) =>
              record.id === attendanceId
                ? rejectedRecord
                : record,
            );

          saveAttendanceRecords(
            updatedRecords,
          );

          return updatedRecords;
        },
      );

      return rejectedRecord;
    },
    [],
  );

  const getAttendanceById = useCallback(
    (attendanceId) =>
      attendanceRecords.find(
        (record) =>
          record.id === attendanceId,
      ) ?? null,
    [attendanceRecords],
  );

  const getAttendanceByVolunteer =
    useCallback(
      (volunteerId) =>
        attendanceRecords.filter(
          (record) =>
            record.volunteerId ===
            volunteerId,
        ),
      [attendanceRecords],
    );

  const getAttendanceByProject =
    useCallback(
      (projectId) =>
        attendanceRecords.filter(
          (record) =>
            record.projectId === projectId,
        ),
      [attendanceRecords],
    );

  const getPendingAttendance =
    useCallback(
      () =>
        attendanceRecords.filter(
          (record) =>
            record.status ===
              ATTENDANCE_STATUS.PENDING &&
            record.checkOutAt !== null,
        ),
      [attendanceRecords],
    );

  const value = useMemo(
    () => ({
      attendanceRecords,
      createCheckIn,
      checkOut,
      updateAttendance,
      verifyAttendance,
      rejectAttendance,
      getAttendanceById,
      getAttendanceByVolunteer,
      getAttendanceByProject,
      getPendingAttendance,
    }),
    [
      attendanceRecords,
      createCheckIn,
      checkOut,
      updateAttendance,
      verifyAttendance,
      rejectAttendance,
      getAttendanceById,
      getAttendanceByVolunteer,
      getAttendanceByProject,
      getPendingAttendance,
    ],
  );

  return (
    <AttendanceContext.Provider
      value={value}
    >
      {children}
    </AttendanceContext.Provider>
  );
}
