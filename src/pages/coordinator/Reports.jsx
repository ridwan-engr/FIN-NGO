import {
  CheckCircle2,
  Clock3,
  Download,
  FileBarChart2,
  Search,
  UsersRound,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import StatusChip from "../../components/ui/StatusChip.jsx";

import useAttendance from "../../hooks/useAttendance.js";
import useProjects from "../../hooks/useProjects.js";
import useTasks from "../../hooks/useTasks.js";
import useVolunteers from "../../hooks/useVolunteers.js";

import {
  ATTENDANCE_FILTERS,
  REPORT_STATUS_FILTERS,
  buildReportRows,
  downloadReportCsv,
  filterReportRows,
} from "../../services/reportService.js";

import "./Reports.css";

function formatHours(value) {
  const hours = Number(value ?? 0);

  return Number.isInteger(hours)
    ? String(hours)
    : hours.toFixed(2);
}

function getAttendanceClass(status) {
  return status
    .toLowerCase()
    .replace(/\s+/g, "-");
}

export default function Reports() {
  const { tasks } = useTasks();
  const { volunteers } = useVolunteers();
  const { projects } = useProjects();
  const { attendanceRecords } =
    useAttendance();

  const [search, setSearch] =
    useState("");

  const [projectId, setProjectId] =
    useState("All");

  const [taskStatus, setTaskStatus] =
    useState("All");

  const [
    attendanceStatus,
    setAttendanceStatus,
  ] = useState("All");

  const reportRows = useMemo(
    () =>
      buildReportRows({
        tasks,
        volunteers,
        projects,
        attendanceRecords,
      }),
    [
      tasks,
      volunteers,
      projects,
      attendanceRecords,
    ],
  );

  const filteredRows = useMemo(
    () =>
      filterReportRows(reportRows, {
        search,
        projectId,
        taskStatus,
        attendanceStatus,
      }),
    [
      reportRows,
      search,
      projectId,
      taskStatus,
      attendanceStatus,
    ],
  );

  const completedCount = useMemo(
    () =>
      reportRows.filter(
        (row) =>
          row.taskStatus === "Completed",
      ).length,
    [reportRows],
  );

  const verifiedHours = useMemo(
    () =>
      Number(
        attendanceRecords
          .reduce(
            (total, record) =>
              total +
              Number(
                record.verifiedHours ?? 0,
              ),
            0,
          )
          .toFixed(2),
      ),
    [attendanceRecords],
  );

  function handleExport() {
    const date =
      new Date()
        .toISOString()
        .slice(0, 10);

    downloadReportCsv(
      filteredRows,
      `fin-volunteer-report-${date}.csv`,
    );
  }

  function clearFilters() {
    setSearch("");
    setProjectId("All");
    setTaskStatus("All");
    setAttendanceStatus("All");
  }

  const hasFilters =
    search ||
    projectId !== "All" ||
    taskStatus !== "All" ||
    attendanceStatus !== "All";

  return (
    <main className="fin-reports">
      <header className="fin-reports__header">
        <div>
          <p>Coordinator / Reports</p>

          <h1>Reports</h1>

          <span>
            Review volunteer activity,
            task delivery and attendance
            performance.
          </span>
        </div>

        <button
          type="button"
          className="fin-reports__export"
          onClick={handleExport}
          disabled={
            filteredRows.length === 0
          }
        >
          <Download size={17} />
          Export CSV
        </button>
      </header>

      <section className="fin-reports__metrics">
        <article>
          <span className="fin-reports__metric-icon">
            <FileBarChart2 size={18} />
          </span>

          <div>
            <small>Total tasks</small>
            <strong>
              {reportRows.length}
            </strong>
          </div>
        </article>

        <article>
          <span className="fin-reports__metric-icon">
            <CheckCircle2 size={18} />
          </span>

          <div>
            <small>Completed</small>
            <strong>
              {completedCount}
            </strong>
          </div>
        </article>

        <article>
          <span className="fin-reports__metric-icon">
            <UsersRound size={18} />
          </span>

          <div>
            <small>
              Attendance records
            </small>
            <strong>
              {attendanceRecords.length}
            </strong>
          </div>
        </article>

        <article>
          <span className="fin-reports__metric-icon">
            <Clock3 size={18} />
          </span>

          <div>
            <small>Verified hours</small>
            <strong>
              {formatHours(
                verifiedHours,
              )}
            </strong>
          </div>
        </article>
      </section>

      <section className="fin-reports__panel">
        <div className="fin-reports__panel-heading">
          <div>
            <h2>Volunteer activity report</h2>

            <span>
              {filteredRows.length} of{" "}
              {reportRows.length} task
              {reportRows.length === 1
                ? ""
                : "s"}
            </span>
          </div>

          {hasFilters && (
            <button
              type="button"
              className="fin-reports__clear"
              onClick={clearFilters}
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="fin-reports__controls">
          <label className="fin-reports__search">
            <Search
              size={18}
              strokeWidth={1.7}
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search volunteer, task or project"
              aria-label="Search reports"
            />
          </label>

          <select
            value={projectId}
            onChange={(event) =>
              setProjectId(
                event.target.value,
              )
            }
            aria-label="Filter by project"
          >
            <option value="All">
              All projects
            </option>

            {projects.map((project) => (
              <option
                key={project.id}
                value={project.id}
              >
                {project.name}
              </option>
            ))}
          </select>

          <select
            value={taskStatus}
            onChange={(event) =>
              setTaskStatus(
                event.target.value,
              )
            }
            aria-label="Filter by task status"
          >
            {REPORT_STATUS_FILTERS.map(
              (status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status === "All"
                    ? "All task statuses"
                    : status}
                </option>
              ),
            )}
          </select>

          <select
            value={attendanceStatus}
            onChange={(event) =>
              setAttendanceStatus(
                event.target.value,
              )
            }
            aria-label="Filter by attendance status"
          >
            {ATTENDANCE_FILTERS.map(
              (status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status === "All"
                    ? "All attendance"
                    : status}
                </option>
              ),
            )}
          </select>
        </div>

        {filteredRows.length > 0 ? (
          <>
            <div className="fin-reports-table">
              <div className="fin-reports-table__header">
                <span>Volunteer</span>
                <span>Project / Task</span>
                <span>Attendance</span>
                <span>Hours</span>
                <span>Status</span>
              </div>

              <div className="fin-reports-table__body">
                {filteredRows.map(
                  (row) => (
                    <article
                      key={row.id}
                      className="fin-reports-table__row"
                    >
                      <div className="fin-reports-table__volunteer">
                        <strong>
                          {row.volunteerName}
                        </strong>

                        <small>
                          {row.volunteerId ??
                            "No volunteer"}
                        </small>

                        <StatusChip
                          status={
                            row.volunteerStatus
                          }
                        />
                      </div>

                      <div className="fin-reports-table__task">
                        <strong>
                          {row.projectName}
                        </strong>

                        <span>
                          {row.taskTitle}
                        </span>

                        <small>
                          {row.taskId} ·{" "}
                          {row.priority} priority
                        </small>
                      </div>

                      <div>
                        <span
                          className={`fin-reports__attendance fin-reports__attendance--${getAttendanceClass(
                            row.attendanceStatus,
                          )}`}
                        >
                          {
                            row.attendanceStatus
                          }
                        </span>

                        <small className="fin-reports__record-count">
                          {row.attendanceCount}{" "}
                          record
                          {row.attendanceCount ===
                          1
                            ? ""
                            : "s"}
                        </small>
                      </div>

                      <div className="fin-reports-table__hours">
                        <strong>
                          {formatHours(
                            row.verifiedHours,
                          )}{" "}
                          hrs
                        </strong>

                        <small>
                          {formatHours(
                            row.submittedHours,
                          )}{" "}
                          submitted
                        </small>
                      </div>

                      <div className="fin-reports-table__status">
                        <StatusChip
                          status={
                            row.taskStatus
                          }
                        />

                        <small>
                          Due{" "}
                          {row.dueDate ||
                            "Not set"}
                        </small>
                      </div>
                    </article>
                  ),
                )}
              </div>
            </div>

            <div className="fin-report-cards">
              {filteredRows.map((row) => (
                <article
                  key={row.id}
                  className="fin-report-card"
                >
                  <div className="fin-report-card__top">
                    <div>
                      <strong>
                        {row.volunteerName}
                      </strong>

                      <small>
                        {row.volunteerId ??
                          "Unassigned"}
                      </small>
                    </div>

                    <StatusChip
                      status={
                        row.taskStatus
                      }
                    />
                  </div>

                  <div className="fin-report-card__task">
                    <strong>
                      {row.taskTitle}
                    </strong>

                    <span>
                      {row.projectName}
                    </span>
                  </div>

                  <div className="fin-report-card__meta">
                    <span>
                      Attendance
                      <strong>
                        {
                          row.attendanceStatus
                        }
                      </strong>
                    </span>

                    <span>
                      Verified hours
                      <strong>
                        {formatHours(
                          row.verifiedHours,
                        )}
                      </strong>
                    </span>
                  </div>

                  <div className="fin-report-card__footer">
                    <StatusChip
                      status={
                        row.volunteerStatus
                      }
                    />

                    <small>
                      Due{" "}
                      {row.dueDate ||
                        "Not set"}
                    </small>
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className="fin-reports__empty">
            <FileBarChart2 size={30} />

            <strong>
              No report records found
            </strong>

            <span>
              Adjust the search or filters
              to view more records.
            </span>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
