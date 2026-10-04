export const TASK_STATUS = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
};

export const TASK_PRIORITY = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

export const tasks = [
  {
    id: "TSK-001",
    projectId: "PRJ-001",
    title: "Monitor project and presentation",
    description:
      "Support and monitor project presentation activities.",
    assignedVolunteerId: "VOL-001",
    status: TASK_STATUS.IN_PROGRESS,
    priority: TASK_PRIORITY.MEDIUM,
    dueDate: "2026-10-16",
    createdAt: "2026-10-01T09:00:00.000Z",
    updatedAt: "2026-10-01T09:00:00.000Z",
  },
  {
    id: "TSK-002",
    projectId: "PRJ-001",
    title: "Monitor quizzes and examination",
    description:
      "Coordinate quiz and examination monitoring activities.",
    assignedVolunteerId: "VOL-002",
    status: TASK_STATUS.NOT_STARTED,
    priority: TASK_PRIORITY.HIGH,
    dueDate: "2026-10-20",
    createdAt: "2026-10-01T09:10:00.000Z",
    updatedAt: "2026-10-01T09:10:00.000Z",
  },
  {
    id: "TSK-003",
    projectId: "PRJ-001",
    title: "Monitor class tasks and assignments",
    description:
      "Monitor class tasks, submissions and assignments.",
    assignedVolunteerId: "VOL-003",
    status: TASK_STATUS.NOT_STARTED,
    priority: TASK_PRIORITY.MEDIUM,
    dueDate: "2026-10-22",
    createdAt: "2026-10-01T09:20:00.000Z",
    updatedAt: "2026-10-01T09:20:00.000Z",
  },
  {
    id: "TSK-004",
    projectId: "PRJ-002",
    title: "Coordinate community clean-up",
    description:
      "Coordinate volunteers participating in the community clean-up.",
    assignedVolunteerId: "VOL-005",
    status: TASK_STATUS.COMPLETED,
    priority: TASK_PRIORITY.MEDIUM,
    dueDate: "2026-09-28",
    createdAt: "2026-09-15T10:00:00.000Z",
    updatedAt: "2026-09-28T16:00:00.000Z",
  },
  {
    id: "TSK-005",
    projectId: "PRJ-003",
    title: "Digital skills training support",
    description:
      "Support delivery of practical digital skills training.",
    assignedVolunteerId: "VOL-004",
    status: TASK_STATUS.IN_PROGRESS,
    priority: TASK_PRIORITY.HIGH,
    dueDate: "2026-10-25",
    createdAt: "2026-09-20T11:00:00.000Z",
    updatedAt: "2026-10-01T08:30:00.000Z",
  },
  {
    id: "TSK-006",
    projectId: "PRJ-004",
    title: "Prepare health outreach materials",
    description:
      "Prepare educational materials for the community health outreach.",
    assignedVolunteerId: null,
    status: TASK_STATUS.NOT_STARTED,
    priority: TASK_PRIORITY.HIGH,
    dueDate: "2026-10-18",
    createdAt: "2026-10-01T12:00:00.000Z",
    updatedAt: "2026-10-01T12:00:00.000Z",
  },
];
