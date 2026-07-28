"use client";

import { useState, useRef, useEffect } from "react";
import { Lock, Eye, EyeOff, ChevronDown, Check } from "lucide-react";

/* ---- Password field with eye toggle ---- */
export function PasswordField({ name, value, onChange, placeholder }) {
  const [visible, setVisible] = useState(false);

  const toggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setVisible((prev) => !prev);
  };

  return (
    <div className="cr-field cr-field--password" data-field={name}>
      <Lock size={15} color="#9C8A6A" />
      <input
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={
          name === "confirmPassword" ? "new-password" : "current-password"
        }
      />
      <button
        type="button"
        className="cr-field-eye-btn"
        onMouseDown={(e) => e.preventDefault()}
        onClick={toggle}
        tabIndex={-1}
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? (
          <EyeOff size={15} color="#9C8A6A" />
        ) : (
          <Eye size={15} color="#9C8A6A" />
        )}
      </button>
    </div>
  );
}

/* ---- Multi-select dropdown (used for Expertise & Languages) ---- */
export function MultiSelectDropdown({
  icon,
  options,
  selected,
  onChange,
  placeholder,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const toggleOption = (opt) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((s) => s !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  const label = selected.length ? selected.join(", ") : placeholder;

  return (
    <div className="cr-field cr-dropdown" ref={ref}>
      {icon}
      <button
        type="button"
        className="cr-dropdown-trigger"
        onClick={() => setOpen((o) => !o)}
      >
        <span className={selected.length ? "" : "cr-dropdown-placeholder"}>
          {label}
        </span>
        <ChevronDown size={15} color="#9C8A6A" style={{ flexShrink: 0 }} />
      </button>

      {open && (
        <div className="cr-dropdown-panel">
          {options.map((opt) => {
            const isSelected = selected.includes(opt);
            return (
              <div
                key={opt}
                className={`cr-dropdown-option ${isSelected ? "cr-dropdown-option--selected" : ""}`}
                onClick={() => toggleOption(opt)}
              >
                <span className="cr-dropdown-checkbox">
                  {isSelected && <Check size={12} color="#fff" />}
                </span>
                {opt}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---- Skeleton for the auth-card layout ---- */
export function AuthCardSkeleton({ fields = 6 }) {
  return (
    <div className="cr-login-wrap">
      <div className="cr-login-card cr-login-card--wide">
        <div className="cr-skel cr-skel-avatar" />
        <div className="cr-skel cr-skel-title" />
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="cr-skel cr-skel-field" />
        ))}
        <div className="cr-skel cr-skel-btn" />
      </div>
    </div>
  );
}
