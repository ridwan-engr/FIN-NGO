export const coordinatorDashboardData = {
  coordinator: {
    name: "David Adebayo",
    initials: "DA",
    role: "Project Coordinator",
    location: "Agege, Lagos",
  },

  desktopMetrics: [
    {
      id: "engaged-volunteers",
      label: "Engaged volunteers",
      value: "180",
    },
    {
      id: "projects-managed",
      label: "Projects managed",
      value: "15",
    },
    {
      id: "verified-hours",
      label: "Verified hours",
      value: "1,240",
    },
    {
      id: "task-completion",
      label: "Current task completion",
      value: "80%",
    },
  ],

  mobileMetrics: [
    {
      id: "volunteers-engaged",
      label: "Volunteers Engaged",
      value: "180",
    },
    {
      id: "projects-managed",
      label: "Projects Managed",
      value: "15",
    },
    {
      id: "pending-reviews",
      label: "Pending reviews",
      value: "2",
    },
  ],

  bestProject: {
    id: "project-quiz-essay",
    name: "Quiz and Essay Competition",
    status: "Completed",
    volunteers: 17,
    completedTasks: 15,
    totalTasks: 15,
    progress: 100,
    rating: 5,
    review:
      "Project was completed on time, no complaints from schools and volunteers involved.",
  },

  tasksNeedingAttention: [
    {
      id: "task-001",
      initials: "AN",
      volunteer: "Deborah Samson",
      volunteerShort: "Deborah S.",
      project: "Collaboration with techCrush",
      activity: "Monitor project and presentation",
      mobileActivity: "Monitor project and Presentation",
      issue: "due in 14 days",
      mobileIssue: "Due in 14 days",
      status: "In progress",
    },
    {
      id: "task-002",
      initials: "AN",
      volunteer: "Michael Chibuzor",
      volunteerShort: "Michael C.",
      project: "Collaboration with techCrush",
      activity: "Monitor quizzes and examination",
      mobileActivity: "Monitor Quizzes and Examination",
      issue: "awaiting 2 submissions",
      mobileIssue: "Awaiting 2 submissions",
      status: "Pending",
    },
    {
      id: "task-003",
      initials: "AN",
      volunteer: "Samuel Chukwu",
      volunteerShort: "Samuel C.",
      project: "Collaboration with techCrush",
      activity: "Monitor class tasks and assignments",
      mobileActivity: "Monitor Class Tasks and Assignments",
      issue: "awaiting 1 submission",
      mobileIssue: "Awaiting 1 submission",
      status: "Pending",
    },
  ],
};
