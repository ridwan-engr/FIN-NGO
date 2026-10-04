import {
  VOLUNTEER_STATUS,
} from "../data/volunteersMock.js";

export const RESPONSIVENESS_THRESHOLDS = {
  AWAITING_RESPONSE_DAYS: 3,
  UNRESPONSIVE_DAYS: 7,
};

const DAY_IN_MS =
  24 * 60 * 60 * 1000;

function isValidDate(value) {
  if (!value) {
    return false;
  }

  return Number.isFinite(
    new Date(value).getTime(),
  );
}

export function getDaysSinceActivity(
  lastActivityAt,
  now = new Date(),
) {
  if (!isValidDate(lastActivityAt)) {
    return null;
  }

  const activityTime =
    new Date(lastActivityAt).getTime();

  const currentTime =
    new Date(now).getTime();

  if (!Number.isFinite(currentTime)) {
    return null;
  }

  const elapsed =
    currentTime - activityTime;

  if (elapsed <= 0) {
    return 0;
  }

  return Math.floor(
    elapsed / DAY_IN_MS,
  );
}

export function deriveVolunteerStatus(
  volunteer,
  now = new Date(),
) {
  if (!volunteer) {
    return null;
  }

  if (
    volunteer.status ===
    VOLUNTEER_STATUS.INACTIVE
  ) {
    return VOLUNTEER_STATUS.INACTIVE;
  }

  const daysSinceActivity =
    getDaysSinceActivity(
      volunteer.lastActivityAt,
      now,
    );

  /*
   * Legacy volunteers may not yet have an
   * activity timestamp. Preserve their
   * existing status until real activity
   * establishes the new lifecycle.
   */
  if (daysSinceActivity === null) {
    return (
      volunteer.status ??
      VOLUNTEER_STATUS.ACTIVE
    );
  }

  if (
    daysSinceActivity >
    RESPONSIVENESS_THRESHOLDS
      .UNRESPONSIVE_DAYS
  ) {
    return VOLUNTEER_STATUS.UNRESPONSIVE;
  }

  if (
    daysSinceActivity >
    RESPONSIVENESS_THRESHOLDS
      .AWAITING_RESPONSE_DAYS
  ) {
    return VOLUNTEER_STATUS.AWAITING_RESPONSE;
  }

  return VOLUNTEER_STATUS.ACTIVE;
}

export function applyVolunteerResponsiveness(
  volunteer,
  now = new Date(),
) {
  if (!volunteer) {
    return volunteer;
  }

  const status =
    deriveVolunteerStatus(
      volunteer,
      now,
    );

  if (status === volunteer.status) {
    return volunteer;
  }

  return {
    ...volunteer,
    status,
    statusUpdatedAt:
      new Date(now).toISOString(),
  };
}
