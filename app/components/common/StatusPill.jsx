export const StatusPill = ({ status }) => {
  const map = {
    new: { label: "New", cls: "new" },
    progress: { label: "In progress", cls: "progress" },
    replied: { label: "Replied", cls: "replied" },
    closed: { label: "Closed", cls: "closed" },
    ready: { label: "Ready", cls: "ready" },
    delivered: { label: "Delivered", cls: "delivered" },
    failed: { label: "Failed to send", cls: "failed" },
  };
  const s = map[status] || map.new;
  return (
    <span className={`cr-pill ${s.cls}`}>
      <span className="cr-pill-dot" /> {s.label}
    </span>
  );
};