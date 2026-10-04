import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Clock3,
  FolderKanban,
  Search,
  UserRound,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import useAuth from "../../hooks/useAuth.js";
import useProjects from "../../hooks/useProjects.js";
import useVolunteers from "../../hooks/useVolunteers.js";

import StatusChip from "../../components/ui/StatusChip.jsx";

import "./Volunteers.css";

const STATUS_FILTERS = [
  "All",
  "Active",
  "Needs Attention",
  "Awaiting Response",
  "Unresponsive",
  "Inactive",
];

const ATTENTION_STATUSES = [
  "Awaiting Response",
  "Unresponsive",
];

function getVolunteerName(volunteer) {
  return [
    volunteer.firstName,
    volunteer.lastName,
  ]
    .filter(Boolean)
    .join(" ");
}

function getInitials(volunteer) {
  const first =
    volunteer.firstName?.charAt(0) ?? "";

  const last =
    volunteer.lastName?.charAt(0) ?? "";

  return `${first}${last}`.toUpperCase() || "VO";
}

export default function Volunteers() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { projects } = useProjects();
  const {
    volunteers,
    refreshVolunteerResponsiveness,
  } = useVolunteers();

  useEffect(() => {
    refreshVolunteerResponsiveness();
  }, [refreshVolunteerResponsiveness]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("All");

  const projectMap = useMemo(
    () =>
      new Map(
        projects.map((project) => [
          project.id,
          project,
        ]),
      ),
    [projects],
  );

  const filteredVolunteers = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return volunteers.filter((volunteer) => {
      if (
        statusFilter === "Needs Attention"
      ) {
        if (
          !ATTENTION_STATUSES.includes(
            volunteer.status,
          )
        ) {
          return false;
        }
      } else if (
        statusFilter !== "All" &&
        volunteer.status !== statusFilter
      ) {
        return false;
      }

      if (!query) {
        return true;
      }

      const projectNames = (
        volunteer.projectIds ?? []
      )
        .map(
          (projectId) =>
            projectMap.get(projectId)?.name ?? "",
        )
        .join(" ");

      const searchableValue = [
        volunteer.id,
        volunteer.firstName,
        volunteer.lastName,
        volunteer.email,
        volunteer.phone,
        volunteer.location,
        ...(volunteer.skills ?? []),
        projectNames,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableValue.includes(query);
    });
  }, [
    volunteers,
    search,
    statusFilter,
    projectMap,
  ]);

  const activeCount = useMemo(
    () =>
      volunteers.filter(
        (volunteer) =>
          volunteer.status === "Active",
      ).length,
    [volunteers],
  );

  const attentionCount = useMemo(
    () =>
      volunteers.filter((volunteer) =>
        ATTENTION_STATUSES.includes(
          volunteer.status,
        ),
      ).length,
    [volunteers],
  );

  const unassignedCount = useMemo(
    () =>
      volunteers.filter(
        (volunteer) =>
          !volunteer.projectIds?.length,
      ).length,
    [volunteers],
  );

  const verifiedHours = useMemo(
    () =>
      volunteers.reduce(
        (total, volunteer) =>
          total +
          Number(volunteer.verifiedHours ?? 0),
        0,
      ),
    [volunteers],
  );

  const firstName =
    user?.firstName ?? "Coordinator";

  const lastName =
    user?.lastName ?? "";

  const displayName =
    `${firstName} ${lastName}`.trim();

  return (
    <main className="fin-volunteers">
      <header className="fin-volunteers__header">
        <div>
          <p>Coordinator / Volunteers</p>

          <h1>Volunteer Management</h1>

          <span>
            View, monitor and manage volunteers
            across your projects.
          </span>
        </div>

        <div className="fin-volunteers__coordinator">
          <strong>{displayName}</strong>
          <span>Project Coordinator</span>
        </div>
      </header>

      <section className="fin-volunteers__metrics">
        <article>
          <span className="fin-volunteers__metric-icon">
            <UserRound size={18} />
          </span>

          <div>
            <small>Total volunteers</small>
            <strong>{volunteers.length}</strong>
          </div>
        </article>

        <article>
          <span className="fin-volunteers__metric-icon">
            <UserRound size={18} />
          </span>

          <div>
            <small>Active</small>
            <strong>{activeCount}</strong>
          </div>
        </article>

        <article
          role="button"
          tabIndex={0}
          aria-label={`Show ${attentionCount} volunteers needing attention`}
          onClick={() =>
            setStatusFilter("Needs Attention")
          }
          onKeyDown={(event) => {
            if (
              event.key === "Enter" ||
              event.key === " "
            ) {
              event.preventDefault();
              setStatusFilter(
                "Needs Attention",
              );
            }
          }}
        >
          <span className="fin-volunteers__metric-icon">
            <Clock3 size={18} />
          </span>

          <div>
            <small>Needs attention</small>
            <strong>{attentionCount}</strong>
          </div>
        </article>

        <article>
          <span className="fin-volunteers__metric-icon">
            <FolderKanban size={18} />
          </span>

          <div>
            <small>Unassigned</small>
            <strong>{unassignedCount}</strong>
          </div>
        </article>
      </section>

      <section className="fin-volunteers__directory">
        <div className="fin-volunteers__directory-heading">
          <div>
            <h2>Volunteers</h2>

            <span>
              {filteredVolunteers.length} of{" "}
              {volunteers.length} volunteers
            </span>
          </div>

          <span>
            {verifiedHours} verified hours
          </span>
        </div>

        <div className="fin-volunteers__controls">
          <div className="fin-volunteers__search">
            <Search
              size={18}
              strokeWidth={1.7}
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search volunteers, skills or projects"
              aria-label="Search volunteers"
            />
          </div>

          <div
            className="fin-volunteers__filters"
            aria-label="Volunteer status filter"
          >
            {STATUS_FILTERS.map((status) => (
              <button
                key={status}
                type="button"
                className={
                  statusFilter === status
                    ? "fin-volunteers__filter fin-volunteers__filter--active"
                    : "fin-volunteers__filter"
                }
                onClick={() =>
                  setStatusFilter(status)
                }
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {filteredVolunteers.length > 0 ? (
          <>
            <div className="fin-volunteers-table">
              <div className="fin-volunteers-table__header">
                <span>Volunteer</span>
                <span>Projects</span>
                <span>Skills</span>
                <span>Verified hours</span>
                <span>Status</span>
              </div>

              <div className="fin-volunteers-table__body">
                {filteredVolunteers.map(
                  (volunteer) => {
                    const projectNames = (
                      volunteer.projectIds ?? []
                    )
                      .map(
                        (projectId) =>
                          projectMap.get(projectId)
                            ?.name,
                      )
                      .filter(Boolean);

                    return (
                      <article
                        key={volunteer.id}
                        className="fin-volunteers-table__row"
                        role="link"
                        tabIndex={0}
                        onClick={() =>
                          navigate(
                            `/coordinator/volunteers/${volunteer.id}`,
                          )
                        }
                        onKeyDown={(event) => {
                          if (
                            event.key === "Enter" ||
                            event.key === " "
                          ) {
                            event.preventDefault();

                            navigate(
                              `/coordinator/volunteers/${volunteer.id}`,
                            );
                          }
                        }}
                      >
                        <div className="fin-volunteers-table__person">
                          <span className="fin-volunteers__avatar">
                            {getInitials(volunteer)}
                          </span>

                          <span>
                            <strong>
                              {getVolunteerName(
                                volunteer,
                              )}
                            </strong>

                            <small>
                              {volunteer.email}
                            </small>

                            <small>
                              {volunteer.id}
                            </small>
                          </span>
                        </div>

                        <div className="fin-volunteers-table__projects">
                          {projectNames.length > 0 ? (
                            <>
                              <strong>
                                {projectNames[0]}
                              </strong>

                              {projectNames.length >
                                1 && (
                                  <small>
                                    +
                                    {projectNames.length -
                                      1}{" "}
                                    more
                                  </small>
                                )}
                            </>
                          ) : (
                            <span className="fin-volunteers__unassigned">
                              Unassigned
                            </span>
                          )}
                        </div>

                        <div className="fin-volunteers-table__skills">
                          {(
                            volunteer.skills ?? []
                          )
                            .slice(0, 2)
                            .map((skill) => (
                              <span key={skill}>
                                {skill}
                              </span>
                            ))}

                          {!volunteer.skills
                            ?.length && (
                              <small>
                                No skills added
                              </small>
                            )}
                        </div>

                        <strong className="fin-volunteers-table__hours">
                          {volunteer.verifiedHours ??
                            0}{" "}
                          hrs
                        </strong>

                        <StatusChip
                          status={
                            volunteer.status
                          }
                        />
                      </article>
                    );
                  },
                )}
              </div>
            </div>

            <div className="fin-volunteer-cards">
              {filteredVolunteers.map(
                (volunteer) => {
                  const projectCount =
                    volunteer.projectIds?.length ??
                    0;

                  return (
                    <article
                      key={volunteer.id}
                      className="fin-volunteer-card"
                      role="link"
                      tabIndex={0}
                      onClick={() =>
                        navigate(
                          `/coordinator/volunteers/${volunteer.id}`,
                        )
                      }
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter" ||
                          event.key === " "
                        ) {
                          event.preventDefault();

                          navigate(
                            `/coordinator/volunteers/${volunteer.id}`,
                          );
                        }
                      }}
                    >
                      <div className="fin-volunteer-card__top">
                        <span className="fin-volunteers__avatar">
                          {getInitials(volunteer)}
                        </span>

                        <div>
                          <strong>
                            {getVolunteerName(
                              volunteer,
                            )}
                          </strong>

                          <span>
                            {volunteer.email}
                          </span>
                        </div>

                        <StatusChip
                          status={
                            volunteer.status
                          }
                        />
                      </div>

                      <div className="fin-volunteer-card__meta">
                        <span>
                          <FolderKanban
                            size={15}
                          />

                          {projectCount > 0
                            ? `${projectCount} project${projectCount === 1
                              ? ""
                              : "s"
                            }`
                            : "Unassigned"}
                        </span>

                        <span>
                          <Clock3 size={15} />

                          {volunteer.verifiedHours ??
                            0}{" "}
                          verified hrs
                        </span>
                      </div>

                      <div className="fin-volunteer-card__skills">
                        {(
                          volunteer.skills ?? []
                        ).map((skill) => (
                          <span key={skill}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </article>
                  );
                },
              )}
            </div>
          </>
        ) : (
          <div className="fin-volunteers__empty">
            <UserRound size={28} />

            <strong>
              No volunteers found
            </strong>

            <span>
              Try another search or status
              filter.
            </span>
          </div>
        )}
      </section>
    </main>
  );
}


