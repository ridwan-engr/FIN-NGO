import "./ProjectProgressCard.css";

export default function ProjectProgressCard({ projects }) {
  return (
    <section className="project-progress-card dashboard-card">
      <div className="dashboard-card__header">
        <div>
          <h2>Project progress</h2>
          <p>Current project completion</p>
        </div>

        <span className="project-progress-card__period">
          Last 3 months
        </span>
      </div>

      <div className="project-progress-card__list">
        {projects.map((project) => (
          <div
            className="project-progress-card__item"
            key={project.id}
          >
            <div className="project-progress-card__meta">
              <span>{project.name}</span>
              <strong>{project.progress}%</strong>
            </div>

            <div
              className="project-progress-card__track"
              role="progressbar"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow={project.progress}
              aria-label={`${project.name} progress`}
            >
              <span
                style={{
                  width: `${project.progress}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
