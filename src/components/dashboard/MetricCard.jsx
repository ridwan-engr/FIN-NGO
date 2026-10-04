import {
  Users,
  FolderKanban,
  Clock3,
  CircleCheckBig,
  TrendingUp,
} from "lucide-react";

import "./MetricCard.css";

const icons = {
  users: Users,
  projects: FolderKanban,
  clock: Clock3,
  tasks: CircleCheckBig,
};

export default function MetricCard({
  label,
  value,
  trend,
  trendLabel,
  icon,
}) {
  const Icon = icons[icon] ?? CircleCheckBig;

  return (
    <article className="metric-card">
      <div className="metric-card__top">
        <div className="metric-card__icon">
          <Icon size={18} strokeWidth={1.8} />
        </div>

        <span className="metric-card__label">
          {label}
        </span>
      </div>

      <strong className="metric-card__value">
        {value}
      </strong>

      <div className="metric-card__trend">
        <span className="metric-card__trend-value">
          <TrendingUp size={13} strokeWidth={2} />
          {trend}
        </span>

        <span>{trendLabel}</span>
      </div>
    </article>
  );
}
