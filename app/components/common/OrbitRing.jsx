/* ---------------- Orbit ring ---------------- */
export const OrbitRing = ({
  value,
  max,
  size = 44,
  stroke = 4,
  color = "var(--gold)",
}) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  return (
    <div className="cr-orbit-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#E3D0A5"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - pct * c}
        />
      </svg>
      <div
        className="cr-orbit-label"
        style={{ fontSize: size * 0.28, color: "var(--text)" }}
      >
        {value}
      </div>
    </div>
  );
};