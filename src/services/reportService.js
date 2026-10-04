export const REPORT_STATUS_FILTERS = [
  "All",
  "Not Started",
  "In Progress",
  "Completed",
];

export const ATTENDANCE_FILTERS = [
  "All",
  "No Attendance",
  "Checked In",
  "Pending Verification",
  "Verified",
  "Rejected",
];

function getVolunteerName(volunteer) {
  if (!volunteer) {
    return "Unassigned";
  }

  return [
    volunteer.firstName,
    volunteer.lastName,
  ]
    .filter(Boolean)
    .join(" ");
}

function getAttendanceState(records) {
  if (!records.length) {
    return "No Attendance";
  }

  const activeRecord = records.find(
    (record) =>
      record.checkOutAt === null,
  );

  if (activeRecord) {
    return "Checked In";
  }

  const latestRecord = [...records].sort(
    (a, b) =>
      new Date(b.checkInAt).getTime() -
      new Date(a.checkInAt).getTime(),
  )[0];

  return (
    latestRecord?.status ??
    "No Attendance"
  );
}

function sumHours(records, field) {
  return Number(
    records
      .reduce(
        (total, record) =>
          total +
          Number(record[field] ?? 0),
        0,
      )
      .toFixed(2),
  );
}

export function buildReportRows({
  tasks = [],
  volunteers = [],
  projects = [],
  attendanceRecords = [],
}) {
  const volunteerMap = new Map(
    volunteers.map((volunteer) => [
      volunteer.id,
      volunteer,
    ]),
  );

  const projectMap = new Map(
    projects.map((project) => [
      project.id,
      project,
    ]),
  );

  const attendanceByTask = new Map();

  attendanceRecords.forEach((record) => {
    if (!record.taskId) {
      return;
    }

    const existing =
      attendanceByTask.get(record.taskId) ??
      [];

    existing.push(record);

    attendanceByTask.set(
      record.taskId,
      existing,
    );
  });

  return tasks.map((task) => {
    const volunteer =
      volunteerMap.get(
        task.assignedVolunteerId,
      ) ?? null;

    const project =
      projectMap.get(task.projectId) ??
      null;

    const taskAttendance =
      attendanceByTask.get(task.id) ??
      [];

    return {
      id: task.id,
      taskId: task.id,
      taskTitle: task.title,
      taskStatus: task.status,
      priority: task.priority,
      dueDate: task.dueDate,

      projectId: task.projectId,
      projectName:
        project?.name ??
        task.projectId ??
        "Unknown project",

      volunteerId:
        task.assignedVolunteerId,
      volunteerName:
        getVolunteerName(volunteer),
      volunteerStatus:
        volunteer?.status ??
        "Unassigned",

      attendanceCount:
        taskAttendance.length,

      attendanceStatus:
        getAttendanceState(
          taskAttendance,
        ),

      submittedHours:
        sumHours(
          taskAttendance,
          "submittedHours",
        ),

      verifiedHours:
        sumHours(
          taskAttendance,
          "verifiedHours",
        ),
    };
  });
}

export function filterReportRows(
  rows,
  {
    search = "",
    taskStatus = "All",
    attendanceStatus = "All",
    projectId = "All",
  } = {},
) {
  const query = search
    .trim()
    .toLowerCase();

  return rows.filter((row) => {
    if (
      taskStatus !== "All" &&
      row.taskStatus !== taskStatus
    ) {
      return false;
    }

    if (
      attendanceStatus !== "All" &&
      row.attendanceStatus !==
        attendanceStatus
    ) {
      return false;
    }

    if (
      projectId !== "All" &&
      row.projectId !== projectId
    ) {
      return false;
    }

    if (!query) {
      return true;
    }

    const searchableValue = [
      row.taskId,
      row.taskTitle,
      row.projectName,
      row.volunteerId,
      row.volunteerName,
      row.volunteerStatus,
      row.taskStatus,
      row.attendanceStatus,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableValue.includes(query);
  });
}

function escapeCsvValue(value) {
  const normalized =
    value === null ||
    value === undefined
      ? ""
      : String(value);

  return `"${normalized.replace(
    /"/g,
    '""',
  )}"`;
}

export function reportRowsToCsv(rows) {
  const headers = [
    "Volunteer",
    "Volunteer ID",
    "Volunteer Status",
    "Project",
    "Task",
    "Task ID",
    "Task Status",
    "Attendance",
    "Attendance Records",
    "Submitted Hours",
    "Verified Hours",
    "Due Date",
  ];

  const body = rows.map((row) => [
    row.volunteerName,
    row.volunteerId ?? "",
    row.volunteerStatus,
    row.projectName,
    row.taskTitle,
    row.taskId,
    row.taskStatus,
    row.attendanceStatus,
    row.attendanceCount,
    row.submittedHours,
    row.verifiedHours,
    row.dueDate,
  ]);

  return [
    headers,
    ...body,
  ]
    .map((record) =>
      record
        .map(escapeCsvValue)
        .join(","),
    )
    .join("\r\n");
}

export function downloadReportCsv(
  rows,
  filename = "fin-volunteer-report.csv",
) {
  const csv =
    reportRowsToCsv(rows);

  const blob = new Blob(
    [`\uFEFF${csv}`],
    {
      type:
        "text/csv;charset=utf-8;",
    },
  );

  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}
