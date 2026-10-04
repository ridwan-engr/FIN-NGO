import "./ProjectStatus.css";

export default function ProjectStatus({ status }) {
  const variant = status
    .toLowerCase()
    .replace(/\s+/g, "-");

  return (
    <span
      className={`project-status project-status--${variant}`}
    >
      <span className="project-status__dot" />
      {status}
    </span>
  );
}
