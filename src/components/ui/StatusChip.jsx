import "./StatusChip.css";

export default function StatusChip({ status }) {
  const safeStatus = status || "Inactive";

  const normalizedStatus = safeStatus
    .toLowerCase()
    .replace(/\s+/g, "-");

  return (
    <span
      className={`status-chip status-chip--${normalizedStatus}`}
    >
      {safeStatus}
    </span>
  );
}
