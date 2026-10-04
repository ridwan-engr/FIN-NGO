import {
  useCallback,
  useMemo,
  useState,
} from "react";

import VolunteerContext from "./volunteerContext.js";

import {
  generateVolunteerId,
  getVolunteers,
  saveVolunteers,
} from "../services/volunteerService.js";

import {
  VOLUNTEER_STATUS,
} from "../data/volunteersMock.js";

import {
  applyVolunteerResponsiveness,
} from "../services/volunteerResponsivenessService.js";

export function VolunteerProvider({ children }) {
  const [volunteers, setVolunteers] = useState(() =>
    getVolunteers(),
  );

  const getVolunteerById = useCallback(
    (volunteerId) =>
      volunteers.find(
        (volunteer) =>
          volunteer.id === volunteerId,
      ) ?? null,
    [volunteers],
  );

  const getVolunteerByAuthUserId =
    useCallback(
      (authUserId) =>
        volunteers.find(
          (volunteer) =>
            volunteer.authUserId ===
            authUserId,
        ) ?? null,
      [volunteers],
    );

  const getVolunteerByEmail = useCallback(
    (email) => {
      if (!email) {
        return null;
      }

      const normalizedEmail =
        email.trim().toLowerCase();

      return (
        volunteers.find(
          (volunteer) =>
            volunteer.email
              .trim()
              .toLowerCase() ===
            normalizedEmail,
        ) ?? null
      );
    },
    [volunteers],
  );

  const getVolunteersByProject =
    useCallback(
      (projectId) =>
        volunteers.filter((volunteer) =>
          volunteer.projectIds.includes(
            projectId,
          ),
        ),
      [volunteers],
    );

  const updateVolunteer = useCallback(
    (volunteerId, updates) => {
      let updatedVolunteer = null;

      setVolunteers((currentVolunteers) => {
        const updatedVolunteers =
          currentVolunteers.map(
            (volunteer) => {
              if (
                volunteer.id !== volunteerId
              ) {
                return volunteer;
              }

              updatedVolunteer = {
                ...volunteer,
                ...updates,
              };

              return updatedVolunteer;
            },
          );

        saveVolunteers(updatedVolunteers);

        return updatedVolunteers;
      });

      return updatedVolunteer;
    },
    [],
  );

  const ensureVolunteerForUser =
    useCallback((user) => {
      if (
        !user ||
        user.role !== "volunteer"
      ) {
        return null;
      }

      let resolvedVolunteer = null;

      setVolunteers((currentVolunteers) => {
        const byAuthUser =
          currentVolunteers.find(
            (volunteer) =>
              volunteer.authUserId ===
              user.id,
          );

        if (byAuthUser) {
          resolvedVolunteer =
            byAuthUser;

          return currentVolunteers;
        }

        const normalizedEmail =
          user.email
            ?.trim()
            .toLowerCase();

        const byEmail =
          normalizedEmail
            ? currentVolunteers.find(
              (volunteer) =>
                volunteer.email
                  .trim()
                  .toLowerCase() ===
                normalizedEmail,
            )
            : null;

        const demoChinedu =
          user.id === "vol-001"
            ? currentVolunteers.find(
              (volunteer) =>
                volunteer.id ===
                "VOL-005",
            )
            : null;

        const existingVolunteer =
          byEmail ?? demoChinedu;

        if (existingVolunteer) {
          const updatedVolunteer = {
            ...existingVolunteer,
            authUserId: user.id,
          };

          const updatedVolunteers =
            currentVolunteers.map(
              (volunteer) =>
                volunteer.id ===
                  existingVolunteer.id
                  ? updatedVolunteer
                  : volunteer,
            );

          saveVolunteers(
            updatedVolunteers,
          );

          resolvedVolunteer =
            updatedVolunteer;

          return updatedVolunteers;
        }

        const newVolunteer = {
          id: generateVolunteerId(
            currentVolunteers,
          ),
          authUserId: user.id,
          firstName:
            user.firstName?.trim() ??
            "",
          lastName:
            user.lastName?.trim() ?? "",
          email:
            user.email
              ?.trim()
              .toLowerCase() ?? "",
          phone:
            user.phone?.trim() ?? "",
          skills: user.skills
            ? user.skills
              .split(",")
              .map((skill) =>
                skill.trim(),
              )
              .filter(Boolean)
            : [],
          location: "",
          status:
            VOLUNTEER_STATUS.ACTIVE,
          projectIds: [],
          verifiedHours: 0,
          createdAt:
            new Date().toISOString(),
          lastActivityAt:
            new Date().toISOString(),
          statusUpdatedAt:
            new Date().toISOString(),
        };

        const updatedVolunteers = [
          ...currentVolunteers,
          newVolunteer,
        ];

        saveVolunteers(
          updatedVolunteers,
        );

        resolvedVolunteer =
          newVolunteer;

        return updatedVolunteers;
      });

      return resolvedVolunteer;
    }, []);

  const assignVolunteerToProject = useCallback(
    (volunteerId, projectId) => {
      if (!volunteerId || !projectId) {
        return null;
      }

      let updatedVolunteer = null;

      setVolunteers((currentVolunteers) => {
        const volunteerExists =
          currentVolunteers.some(
            (volunteer) =>
              volunteer.id === volunteerId,
          );

        if (!volunteerExists) {
          return currentVolunteers;
        }

        const updatedVolunteers =
          currentVolunteers.map((volunteer) => {
            if (volunteer.id !== volunteerId) {
              return volunteer;
            }

            if (
              volunteer.projectIds.includes(
                projectId,
              )
            ) {
              updatedVolunteer = volunteer;
              return volunteer;
            }

            updatedVolunteer = {
              ...volunteer,
              projectIds: [
                ...volunteer.projectIds,
                projectId,
              ],
            };

            return updatedVolunteer;
          });

        saveVolunteers(updatedVolunteers);

        return updatedVolunteers;
      });

      return updatedVolunteer;
    },
    [],
  );

  const removeVolunteerFromProject =
    useCallback(
      (volunteerId, projectId) => {
        if (!volunteerId || !projectId) {
          return null;
        }

        let updatedVolunteer = null;

        setVolunteers((currentVolunteers) => {
          const volunteerExists =
            currentVolunteers.some(
              (volunteer) =>
                volunteer.id === volunteerId,
            );

          if (!volunteerExists) {
            return currentVolunteers;
          }

          const updatedVolunteers =
            currentVolunteers.map(
              (volunteer) => {
                if (
                  volunteer.id !== volunteerId
                ) {
                  return volunteer;
                }

                updatedVolunteer = {
                  ...volunteer,
                  projectIds:
                    volunteer.projectIds.filter(
                      (id) => id !== projectId,
                    ),
                };

                return updatedVolunteer;
              },
            );

          saveVolunteers(updatedVolunteers);

          return updatedVolunteers;
        });

        return updatedVolunteer;
      },
      [],
    );

  const recordVolunteerActivity =
    useCallback(
      (
        volunteerId,
        activityAt =
          new Date().toISOString(),
      ) => {
        if (!volunteerId) {
          return null;
        }

        let updatedVolunteer = null;

        setVolunteers(
          (currentVolunteers) => {
            const updatedVolunteers =
              currentVolunteers.map(
                (volunteer) => {
                  if (
                    volunteer.id !==
                    volunteerId
                  ) {
                    return volunteer;
                  }

                  if (
                    volunteer.status ===
                    VOLUNTEER_STATUS.INACTIVE
                  ) {
                    updatedVolunteer =
                      volunteer;

                    return volunteer;
                  }

                  updatedVolunteer = {
                    ...volunteer,
                    lastActivityAt:
                      activityAt,
                    status:
                      VOLUNTEER_STATUS.ACTIVE,
                    statusUpdatedAt:
                      activityAt,
                  };

                  return updatedVolunteer;
                },
              );

            saveVolunteers(
              updatedVolunteers,
            );

            return updatedVolunteers;
          },
        );

        return updatedVolunteer;
      },
      [],
    );

  const refreshVolunteerResponsiveness =
    useCallback(
      (now = new Date()) => {
        let changed = false;

        setVolunteers(
          (currentVolunteers) => {
            const updatedVolunteers =
              currentVolunteers.map(
                (volunteer) => {
                  const updatedVolunteer =
                    applyVolunteerResponsiveness(
                      volunteer,
                      now,
                    );

                  if (
                    updatedVolunteer !==
                    volunteer
                  ) {
                    changed = true;
                  }

                  return updatedVolunteer;
                },
              );

            if (changed) {
              saveVolunteers(
                updatedVolunteers,
              );

              return updatedVolunteers;
            }

            return currentVolunteers;
          },
        );

        return changed;
      },
      [],
    );

  const value = useMemo(
    () => ({
      volunteers,
      getVolunteerById,
      getVolunteerByAuthUserId,
      getVolunteerByEmail,
      getVolunteersByProject,
      updateVolunteer,
      ensureVolunteerForUser,
      assignVolunteerToProject,
      removeVolunteerFromProject,
      recordVolunteerActivity,
      refreshVolunteerResponsiveness,
    }),
    [
      volunteers,
      getVolunteerById,
      getVolunteerByAuthUserId,
      getVolunteerByEmail,
      getVolunteersByProject,
      updateVolunteer,
      ensureVolunteerForUser,
      assignVolunteerToProject,
      removeVolunteerFromProject,
      recordVolunteerActivity,
      refreshVolunteerResponsiveness,
    ],
  );
  return (
    <VolunteerContext.Provider value={value}>
      {children}
    </VolunteerContext.Provider>
  );
}


