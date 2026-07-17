export const LotusWatermark = ({ size = 300, opacity = 0.1, className = "" }) => (
  <img
    src="/lotus-mandala.webp"
    alt=""
    aria-hidden="true"
    className={`cr-mandala-spin ${className}`}
    style={{ width: size, height: size, opacity, objectFit: "contain" }}
  />
);