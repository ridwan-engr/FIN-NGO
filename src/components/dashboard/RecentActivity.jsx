import StatusChip from "../ui/StatusChip.jsx";

import "./RecentActivity.css";

export default function RecentActivity({
  activities,
  onViewAll,
}) {
  return (
    <section className="recent-activity dashboard-card">
      <div className="dashboard-card__header">
        <div>
          <h2>Recent activity</h2>
          <p>Latest volunteer and project activity</p>
        </div>

        <button
          type="button"
          className="recent-activity__view-all"
          onClick={onViewAll}
        >
          View all
        </button>
      </div>

      <div className="recent-activity__table-wrapper">
        <table className="recent-activity__table">
          <thead>
            <tr>
              <th>Volunteer</th>
              <th>Project</th>
              <th>Activity</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {activities.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>{item.volunteer}</strong>
                </td>

                <td>{item.project}</td>
                <td>{item.activity}</td>

                <td>
                  <StatusChip status={item.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
