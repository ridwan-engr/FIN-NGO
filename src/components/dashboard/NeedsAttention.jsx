import {
  CircleCheck,
  ListTodo,
  CalendarClock,
  ChevronRight,
} from "lucide-react";

import "./NeedsAttention.css";

const icons = {
  verification: CircleCheck,
  task: ListTodo,
  attendance: CalendarClock,
};

export default function NeedsAttention({
  items,
  onSelect,
}) {
  return (
    <section className="needs-attention dashboard-card">
      <div className="dashboard-card__header">
        <div>
          <h2>Needs attention</h2>
          <p>Items requiring action</p>
        </div>
      </div>

      <div className="needs-attention__list">
        {items.map((item) => {
          const Icon = icons[item.type];

          return (
            <button
              type="button"
              className="needs-attention__item"
              key={item.id}
              onClick={() => onSelect?.(item)}
            >
              <span className="needs-attention__icon">
                <Icon size={17} strokeWidth={1.8} />
              </span>

              <span className="needs-attention__content">
                <strong>{item.count}</strong>
                <span>{item.label}</span>
              </span>

              <ChevronRight
                className="needs-attention__chevron"
                size={16}
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}
