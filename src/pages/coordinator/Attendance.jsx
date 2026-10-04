import {
  CheckCircle2,
  Clock3,
  Search,
  Timer,
  UserRound,
  XCircle,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import useAttendance from "../../hooks/useAttendance.js";
import useAuth from "../../hooks/useAuth.js";
import useProjects from "../../hooks/useProjects.js";
import useTasks from "../../hooks/useTasks.js";
import useVolunteers from "../../hooks/useVolunteers.js";

import {
  ATTENDANCE_STATUS,
} from "../../data/attendanceMock.js";

import "./Attendance.css";

const STATUS_FILTERS = [
  "All",
  ATTENDANCE_STATUS.PENDING,
  ATTENDANCE_STATUS.VERIFIED,
  ATTENDANCE_STATUS.REJECTED,
];

function formatDateTime(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatHours(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  const hours = Number(value);

  if (!Number.isFinite(hours)) {
    return "—";
  }

  return `${hours.toFixed(2)} hrs`;
}

function getVolunteerName(volunteer) {
  if (!volunteer) {
    return "Unknown volunteer";
  }

  return [
    volunteer.firstName,
    volunteer.lastName,
  ]
    .filter(Boolean)
    .join(" ");
}

function getInitials(volunteer) {
  if (!volunteer) {
    return "VO";
  }

  const first =
    volunteer.firstName?.charAt(0) ?? "";

  const last =
    volunteer.lastName?.charAt(0) ?? "";

  return `${first}${last}`.toUpperCase() || "VO";
}

function AttendanceStatus({ status }) {
  const className = status
    .toLowerCase()
    .replace(/\s+/g, "-");

  return (
    <span
      className={`attendance-status attendance-status--${className}`}
    >
      {status}
    </span>
  );
}

export default function Attendance() {
  const { user } = useAuth();

  const {
    attendanceRecords,
    verifyAttendance,
    rejectAttendance,
  } = useAttendance();

  const {
    getVolunteerById,
    updateVolunteer,
  } = useVolunteers();

  const { getProjectById } =
    useProjects();

  const { getTaskById } =
    useTasks();

  const [searchTerm, setSearchTerm] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [actionRecordId, setActionRecordId] =
    useState(null);

  const [verificationNote, setVerificationNote] =
    useState("");

  const [verifiedHoursInput, setVerifiedHoursInput] =
    useState("");

  const completedRecords = useMemo(
    () =>
      attendanceRecords.filter(
        (record) => Boolean(record.checkOutAt),
      ),
    [attendanceRecords],
  );

  const metrics = useMemo(() => {
    const pending =
      completedRecords.filter(
        (record) =>
          record.status ===
          ATTENDANCE_STATUS.PENDING,
      ).length;

    const verified =
      completedRecords.filter(
        (record) =>
          record.status ===
          ATTENDANCE_STATUS.VERIFIED,
      );

    const rejected =
      completedRecords.filter(
        (record) =>
          record.status ===
          ATTENDANCE_STATUS.REJECTED,
      ).length;

    const verifiedHours =
      verified.reduce(
        (total, record) =>
          total +
          Number(record.verifiedHours ?? 0),
        0,
      );

    return {
      total: completedRecords.length,
      pending,
      verified: verified.length,
      rejected,
      verifiedHours: Number(
        verifiedHours.toFixed(2),
      ),
    };
  }, [completedRecords]);

  const filteredRecords = useMemo(() => {
    const query =
      searchTerm.trim().toLowerCase();

    return completedRecords.filter(
      (record) => {
        if (
          statusFilter !== "All" &&
          record.status !== statusFilter
        ) {
          return false;
        }

        if (!query) {
          return true;
        }

        const volunteer =
          getVolunteerById(
            record.volunteerId,
          );

        const project =
          getProjectById(record.projectId);

        const task =
          record.taskId
            ? getTaskById(record.taskId)
            : null;

        const searchableValue = [
          record.id,
          record.volunteerId,
          record.projectId,
          record.taskId,
          getVolunteerName(volunteer),
          volunteer?.email,
          project?.name,
          task?.title,
          record.status,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableValue.includes(
          query,
        );
      },
    );
  }, [
    completedRecords,
    searchTerm,
    statusFilter,
    getVolunteerById,
    getProjectById,
    getTaskById,
  ]);

  function synchronizeVolunteerHours(
    volunteerId,
    nextAttendanceRecords,
  ) {
    const totalVerifiedHours =
      nextAttendanceRecords
        .filter(
          (record) =>
            record.volunteerId ===
              volunteerId &&
            record.status ===
              ATTENDANCE_STATUS.VERIFIED,
        )
        .reduce(
          (total, record) =>
            total +
            Number(
              record.verifiedHours ?? 0,
            ),
          0,
        );

    updateVolunteer(volunteerId, {
      verifiedHours: Number(
        totalVerifiedHours.toFixed(2),
      ),
    });
  }

  function openVerification(record) {
    setActionRecordId(record.id);

    setVerifiedHoursInput(
      String(record.submittedHours ?? 0),
    );

    setVerificationNote(
      record.verificationNote ?? "",
    );
  }

  function closeVerification() {
    setActionRecordId(null);
    setVerifiedHoursInput("");
    setVerificationNote("");
  }

  function handleVerify(record) {
    const hours =
      Number(verifiedHoursInput);

    if (
      !Number.isFinite(hours) ||
      hours < 0
    ) {
      return;
    }

    const verifiedRecord =
      verifyAttendance(record.id, {
        verifiedBy:
          user?.id ?? user?.email ?? null,
        verifiedHours: hours,
        verificationNote,
      });

    if (!verifiedRecord) {
      return;
    }

    const nextRecords =
      attendanceRecords.map(
        (attendanceRecord) =>
          attendanceRecord.id ===
          verifiedRecord.id
            ? verifiedRecord
            : attendanceRecord,
      );

    synchronizeVolunteerHours(
      verifiedRecord.volunteerId,
      nextRecords,
    );

    closeVerification();
  }

  function handleReject(record) {
    const rejectedRecord =
      rejectAttendance(record.id, {
        verifiedBy:
          user?.id ?? user?.email ?? null,
        verificationNote,
      });

    if (!rejectedRecord) {
      return;
    }

    const nextRecords =
      attendanceRecords.map(
        (attendanceRecord) =>
          attendanceRecord.id ===
          rejectedRecord.id
            ? rejectedRecord
            : attendanceRecord,
      );

    synchronizeVolunteerHours(
      rejectedRecord.volunteerId,
      nextRecords,
    );

    closeVerification();
  }

  const coordinatorName = [
    user?.firstName,
    user?.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <main className="attendance-page">
      <div className="attendance-breadcrumb">
        Coordinator / Attendance
      </div>

      <header className="attendance-header">
        <div>
          <h1>Attendance Management</h1>

          <p>
            Review volunteer attendance,
            verify submitted hours and
            maintain attendance history.
          </p>
        </div>

        <div className="attendance-coordinator">
          <strong>
            {coordinatorName ||
              "Project Coordinator"}
          </strong>

          <span>Project Coordinator</span>
        </div>
      </header>

      <section className="attendance-metrics">
        <article>
          <span className="attendance-metric-icon">
            <Timer size={19} />
          </span>

          <div>
            <small>
              Attendance records
            </small>
            <strong>{metrics.total}</strong>
          </div>
        </article>

        <article>
          <span className="attendance-metric-icon">
            <Clock3 size={19} />
          </span>

          <div>
            <small>
              Pending verification
            </small>
            <strong>{metrics.pending}</strong>
          </div>
        </article>

        <article>
          <span className="attendance-metric-icon">
            <CheckCircle2 size={19} />
          </span>

          <div>
            <small>Verified</small>
            <strong>
              {metrics.verified}
            </strong>
          </div>
        </article>

        <article>
          <span className="attendance-metric-icon">
            <Timer size={19} />
          </span>

          <div>
            <small>Verified hours</small>
            <strong>
              {metrics.verifiedHours.toFixed(
                2,
              )}
            </strong>
          </div>
        </article>
      </section>

      <section className="attendance-panel">
        <div className="attendance-panel__heading">
          <div>
            <h2>Attendance records</h2>

            <span>
              {filteredRecords.length} of{" "}
              {completedRecords.length} records
            </span>
          </div>

          {metrics.rejected > 0 && (
            <span className="attendance-rejected-summary">
              {metrics.rejected} rejected
            </span>
          )}
        </div>

        <div className="attendance-toolbar">
          <label className="attendance-search">
            <Search size={17} />

            <input
              type="search"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value,
                )
              }
              placeholder="Search volunteer, project or task"
            />
          </label>

          <div className="attendance-filters">
            {STATUS_FILTERS.map(
              (status) => (
                <button
                  key={status}
                  type="button"
                  className={
                    statusFilter === status
                      ? "is-active"
                      : ""
                  }
                  onClick={() =>
                    setStatusFilter(status)
                  }
                >
                  {status}
                </button>
              ),
            )}
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="attendance-empty">
            <Timer size={30} />

            <strong>
              No attendance records found
            </strong>

            <span>
              Completed volunteer attendance
              sessions will appear here.
            </span>
          </div>
        ) : (
          <>
            <div className="attendance-table-wrap">
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>Volunteer</th>
                    <th>Project / Task</th>
                    <th>Check in</th>
                    <th>Check out</th>
                    <th>Hours</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRecords.map(
                    (record) => {
                      const volunteer =
                        getVolunteerById(
                          record.volunteerId,
                        );

                      const project =
                        getProjectById(
                          record.projectId,
                        );

                      const task =
                        record.taskId
                          ? getTaskById(
                              record.taskId,
                            )
                          : null;


                      return (
                        <tr key={record.id}>
                          <td>
                            <div className="attendance-person">
                              <span className="attendance-avatar">
                                {getInitials(
                                  volunteer,
                                )}
                              </span>

                              <span>
                                <strong>
                                  {getVolunteerName(
                                    volunteer,
                                  )}
                                </strong>

                                <small>
                                  {record.id}
                                </small>
                              </span>
                            </div>
                          </td>

                          <td>
                            <div className="attendance-project-task">
                              <strong>
                                {project?.name ??
                                  "Unknown project"}
                              </strong>

                              <span>
                                {task?.title ??
                                  "No task"}
                              </span>
                            </div>
                          </td>

                          <td>
                            {formatDateTime(
                              record.checkInAt,
                            )}
                          </td>

                          <td>
                            {formatDateTime(
                              record.checkOutAt,
                            )}
                          </td>

                          <td>
                            <strong>
                              {formatHours(
                                record.submittedHours,
                              )}
                            </strong>
                          </td>

                          <td>
                            <AttendanceStatus
                              status={
                                record.status
                              }
                            />
                          </td>

                          <td>
                            {record.status ===
                            ATTENDANCE_STATUS.PENDING ? (
                              <button
                                type="button"
                                className="attendance-review-button"
                                onClick={() =>
                                  openVerification(
                                    record,
                                  )
                                }
                              >
                                Review
                              </button>
                            ) : (
                              <span className="attendance-action-complete">
                                {record.status ===
                                ATTENDANCE_STATUS.VERIFIED ? (
                                  <CheckCircle2
                                    size={15}
                                  />
                                ) : (
                                  <XCircle
                                    size={15}
                                  />
                                )}

                                {record.status}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    },
                  )}
                </tbody>
              </table>
            </div>

            <div className="attendance-mobile-list">
              {filteredRecords.map(
                (record) => {
                  const volunteer =
                    getVolunteerById(
                      record.volunteerId,
                    );

                  const project =
                    getProjectById(
                      record.projectId,
                    );

                  const task =
                    record.taskId
                      ? getTaskById(
                          record.taskId,
                        )
                      : null;

                  return (
                    <article
                      className="attendance-mobile-card"
                      key={record.id}
                    >
                      <div className="attendance-mobile-card__top">
                        <div className="attendance-person">
                          <span className="attendance-avatar">
                            {getInitials(
                              volunteer,
                            )}
                          </span>

                          <span>
                            <strong>
                              {getVolunteerName(
                                volunteer,
                              )}
                            </strong>

                            <small>
                              {record.id}
                            </small>
                          </span>
                        </div>

                        <AttendanceStatus
                          status={record.status}
                        />
                      </div>

                      <div className="attendance-mobile-card__project">
                        <strong>
                          {project?.name ??
                            "Unknown project"}
                        </strong>

                        <span>
                          {task?.title ??
                            "No task"}
                        </span>
                      </div>

                      <div className="attendance-mobile-card__times">
                        <span>
                          <small>Check in</small>
                          {formatDateTime(
                            record.checkInAt,
                          )}
                        </span>

                        <span>
                          <small>Check out</small>
                          {formatDateTime(
                            record.checkOutAt,
                          )}
                        </span>

                        <span>
                          <small>Submitted</small>
                          {formatHours(
                            record.submittedHours,
                          )}
                        </span>
                      </div>

                      {record.status ===
                        ATTENDANCE_STATUS.PENDING && (
                        <button
                          type="button"
                          className="attendance-review-button attendance-review-button--mobile"
                          onClick={() =>
                            openVerification(
                              record,
                            )
                          }
                        >
                          Review attendance
                        </button>
                      )}
                    </article>
                  );
                },
              )}
            </div>
          </>
        )}
      </section>

      {actionRecordId && (
        <div
          className="attendance-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeVerification();
            }
          }}
        >
          <section
            className="attendance-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="attendance-review-title"
          >
            <div className="attendance-modal__header">
              <div>
                <span>
                  Attendance verification
                </span>

                <h2 id="attendance-review-title">
                  Review submitted hours
                </h2>
              </div>

              <button
                type="button"
                className="attendance-modal__close"
                onClick={closeVerification}
                aria-label="Close attendance review"
              >
                ×
              </button>
            </div>

            {(() => {
              const record =
                attendanceRecords.find(
                  (item) =>
                    item.id ===
                    actionRecordId,
                );

              if (!record) {
                return null;
              }

              const volunteer =
                getVolunteerById(
                  record.volunteerId,
                );

              const project =
                getProjectById(
                  record.projectId,
                );

              const task =
                record.taskId
                  ? getTaskById(
                      record.taskId,
                    )
                  : null;

              return (
                <>
                  <div className="attendance-modal__summary">
                    <div>
                      <UserRound
                        size={17}
                      />

                      <span>
                        <small>
                          Volunteer
                        </small>

                        <strong>
                          {getVolunteerName(
                            volunteer,
                          )}
                        </strong>
                      </span>
                    </div>

                    <div>
                      <small>Project</small>

                      <strong>
                        {project?.name ??
                          "Unknown project"}
                      </strong>
                    </div>

                    <div>
                      <small>Task</small>

                      <strong>
                        {task?.title ??
                          "No task"}
                      </strong>
                    </div>

                    <div>
                      <small>
                        Submitted hours
                      </small>

                      <strong>
                        {formatHours(
                          record.submittedHours,
                        )}
                      </strong>
                    </div>
                  </div>

                  <label className="attendance-field">
                    <span>
                      Verified hours
                    </span>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        verifiedHoursInput
                      }
                      onChange={(event) =>
                        setVerifiedHoursInput(
                          event.target.value,
                        )
                      }
                    />
                  </label>

                  <label className="attendance-field">
                    <span>
                      Verification note
                    </span>

                    <textarea
                      rows="3"
                      value={
                        verificationNote
                      }
                      onChange={(event) =>
                        setVerificationNote(
                          event.target.value,
                        )
                      }
                      placeholder="Optional note about this attendance record"
                    />
                  </label>

                  <div className="attendance-modal__actions">
                    <button
                      type="button"
                      className="attendance-reject-button"
                      onClick={() =>
                        handleReject(record)
                      }
                    >
                      <XCircle
                        size={16}
                      />
                      Reject
                    </button>

                    <button
                      type="button"
                      className="attendance-verify-button"
                      onClick={() =>
                        handleVerify(record)
                      }
                    >
                      <CheckCircle2
                        size={16}
                      />
                      Verify hours
                    </button>
                  </div>
                </>
              );
            })()}
          </section>
        </div>
      )}
    </main>
  );
}

