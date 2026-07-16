import { Users, ShieldAlert, Bell, Activity, Baby } from "lucide-react";

export default function StatCard({ title, value, tone = "primary" }) {
  const toneClass =
    tone === "danger"
      ? "nt-kpi-card nt-kpi-card--danger"
      : tone === "warning"
        ? "nt-kpi-card nt-kpi-card--warning"
        : tone === "dark"
          ? "nt-kpi-card nt-kpi-card--dark"
          : "nt-kpi-card";

  // Select icon and colors based on tone or title content
  let Icon = Activity;
  let iconColor = "text-success";
  let iconBg = "bg-success-subtle";

  if (tone === "danger") {
    Icon = ShieldAlert;
    iconColor = "text-danger";
    iconBg = "bg-danger-subtle";
  } else if (tone === "warning") {
    Icon = ShieldAlert;
    iconColor = "text-warning text-dark";
    iconBg = "bg-warning-subtle";
  } else if (tone === "dark") {
    Icon = Bell;
    iconColor = "text-dark";
    iconBg = "bg-light";
  } else {
    const lower = String(title).toLowerCase();
    if (lower.includes("child")) {
      Icon = Baby;
      iconColor = "text-primary";
      iconBg = "bg-primary-subtle";
    } else if (lower.includes("user") || lower.includes("center")) {
      Icon = Users;
      iconColor = "text-info";
      iconBg = "bg-info-subtle";
    }
  }

  return (
    <div className={`card nt-card h-100 ${toneClass}`}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <div className="text-muted small mb-1">{title}</div>
            <div className="fs-3 fw-extrabold text-slate-900">{value}</div>
          </div>
          <div className={`nt-kpi-icon ${iconBg} ${iconColor}`}>
            <Icon size={20} />
          </div>
        </div>
      </div>
    </div>
  );
}

