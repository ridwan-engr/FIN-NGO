export const VOLUNTEER_STATUS = {
  ACTIVE: "Active",
  AWAITING_RESPONSE: "Awaiting Response",
  UNRESPONSIVE: "Unresponsive",
  INACTIVE: "Inactive",
};

export const volunteers = [
  {
    id: "VOL-001",
    firstName: "Deborah",
    lastName: "Samson",
    email: "deborah.samson@feasibleimpact.org",
    phone: "+234 803 000 1001",
    skills: ["Education", "Presentation"],
    location: "Lagos",
    status: VOLUNTEER_STATUS.ACTIVE,
    projectIds: ["PRJ-001"],
    verifiedHours: 48,
  },
  {
    id: "VOL-002",
    firstName: "Michael",
    lastName: "Chibuzor",
    email: "michael.chibuzor@feasibleimpact.org",
    phone: "+234 803 000 1002",
    skills: ["Education", "Assessment"],
    location: "Lagos",
    status: VOLUNTEER_STATUS.ACTIVE,
    projectIds: ["PRJ-001"],
    verifiedHours: 36,
  },
  {
    id: "VOL-003",
    firstName: "Samuel",
    lastName: "Chukwu",
    email: "samuel.chukwu@feasibleimpact.org",
    phone: "+234 803 000 1003",
    skills: ["Mentoring", "Administration"],
    location: "Lagos",
    status: VOLUNTEER_STATUS.AWAITING_RESPONSE,
    projectIds: ["PRJ-001", "PRJ-002"],
    verifiedHours: 29,
  },
  {
    id: "VOL-004",
    firstName: "Fatima",
    lastName: "Ahmed",
    email: "fatima.ahmed@feasibleimpact.org",
    phone: "+234 803 000 1004",
    skills: ["Digital Skills", "Training"],
    location: "Ogun",
    status: VOLUNTEER_STATUS.ACTIVE,
    projectIds: ["PRJ-003"],
    verifiedHours: 42,
  },
  {
    id: "VOL-005",
    firstName: "Chinedu",
    lastName: "Eze",
    email: "chinedu.eze@feasibleimpact.org",
    phone: "+234 803 000 1005",
    skills: ["Environment", "Community Outreach"],
    location: "Lagos",
    status: VOLUNTEER_STATUS.ACTIVE,
    projectIds: ["PRJ-002"],
    verifiedHours: 51,
  },
  {
    id: "VOL-006",
    firstName: "Amina",
    lastName: "Bello",
    email: "amina.bello@feasibleimpact.org",
    phone: "+234 803 000 1006",
    skills: ["Health", "Community Outreach"],
    location: "Lagos",
    status: VOLUNTEER_STATUS.UNRESPONSIVE,
    projectIds: ["PRJ-004"],
    verifiedHours: 18,
  },
];

export function getVolunteerName(volunteer) {
  if (!volunteer) {
    return "Unassigned";
  }

  return `${volunteer.firstName} ${volunteer.lastName}`;
}
