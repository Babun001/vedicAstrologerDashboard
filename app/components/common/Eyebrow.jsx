/* ---------------- Section eyebrow (ornamental divider) ---------------- */
export const Eyebrow = ({ children }) => (
  <div className="cr-eyebrow">
    <span className="cr-eyebrow-line" />
    <span className="cr-eyebrow-text">{children}</span>
    <span className="cr-eyebrow-line" />
  </div>
);