export default function StatCard({ title, value, tone = "primary" }) {
  const toneClass =
    tone === "danger"
      ? "nt-kpi-card nt-kpi-card--danger"
      : tone === "warning"
        ? "nt-kpi-card nt-kpi-card--warning"
        : tone === "dark"
          ? "nt-kpi-card nt-kpi-card--dark"
          : "nt-kpi-card";

  return (
    <div className={`card nt-card ${toneClass}`}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <div className="text-muted small">{title}</div>
            <div className="fs-4 fw-bold">{value}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

