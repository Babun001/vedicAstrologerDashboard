import { starData } from "../data/commonData";

export const StarField = () => (
  <div className="cr-stars" aria-hidden="true">
    {starData.map((s, i) => (
      <span
        key={i}
        className="cr-star"
        style={{
          left: `${s.x}%`,
          top: `${s.y}%`,
          width: s.s,
          height: s.s,
          animationDelay: `${s.d}s`,
          animationDuration: `${s.dur}s`,
        }}
      />
    ))}
  </div>
);
