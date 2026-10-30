// One number with a label, used on the admin dashboard.
export default function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="stat-card">
      <span className="stat-icon">{Icon && <Icon size={22} aria-hidden="true" />}</span>
      <div>
        <p className="stat-value">{value}</p>
        <p className="stat-label">{label}</p>
      </div>
    </div>
  )
}
