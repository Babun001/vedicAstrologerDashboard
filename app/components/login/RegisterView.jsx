"use client";

import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  Lock,
  Briefcase,
  Sparkles,
  Languages,
  FileText,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { LotusWatermark } from "../common/LotusWatermark";
import axiosInstanceClient from "../services/client.services";

const RegisterView = ({ onSwitchToLogin }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    experience: "",
    expertise: "",
    languages: "",
    bio: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const update = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    if (!form.name.trim()) return "Full name is required.";
    if (!form.email.trim()) return "Email is required.";
    if (!form.phone.trim()) return "Phone number is required.";
    if (form.password.length < 6)
      return "Password must be at least 6 characters.";
    if (form.password !== form.confirmPassword)
      return "Passwords do not match.";
    return "";
  };

  const handleRegister = async () => {
    const validationError = validate();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");

      await axiosInstanceClient.post("/astrologer/register", {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        experience: Number(form.experience) || 0,
        expertise: form.expertise
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        languages: form.languages
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        bio: form.bio.trim(),
      });

      setSubmitted(true);
    } catch (error) {
      console.error(
        "Astrologer registration failed:",
        error.response?.data || error.message,
      );
      setErrorMsg(
        error.response?.data?.message ||
          "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="cr-login-wrap">
        <LotusWatermark
          className="cr-login-mandala"
          size={780}
          opacity={0.14}
        />
        <div className="cr-login-card">
          <div className="cr-register-success-icon">
            <CheckCircle2 size={26} color="var(--success)" />
          </div>
          <div
            className="cr-login-title cr-shimmer-text"
            style={{ marginTop: 14 }}
          >
            Application submitted
          </div>
          <div
            className="cr-login-sub"
            style={{
              color: "var(--text-dim)",
              textTransform: "none",
              letterSpacing: 0,
              fontWeight: 400,
            }}
          >
            Your registration is pending review. An admin will approve your
            account before you can sign in.
          </div>
          <button
            className="cr-login-btn"
            onClick={onSwitchToLogin}
            style={{ marginTop: 22 }}
          >
            Back to Sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cr-login-wrap">
      <LotusWatermark className="cr-login-mandala" size={780} opacity={0.14} />
      <div className="cr-login-card cr-login-card--wide">
        <img
          src="/image.webp"
          alt="Cosmic Remedies"
          className="cr-login-mark"
        />
        <div className="cr-login-title cr-shimmer-text">Cosmic Remedies</div>
        <div className="cr-login-sub">Register as an Astrologer</div>

        {errorMsg && (
          <div className="cr-error-box" style={{ marginBottom: 16 }}>
            <div className="cr-error-row">
              <AlertCircle
                size={16}
                color="var(--danger)"
                style={{ marginTop: 2, flexShrink: 0 }}
              />
              <p className="cr-error-msg">{errorMsg}</p>
            </div>
          </div>
        )}

        <div className="cr-field-row">
          <div className="cr-field-col">
            <label className="cr-field-label">Full Name</label>
            <div className="cr-field">
              <User size={15} color="#9C8A6A" />
              <input
                value={form.name}
                onChange={update("name")}
                placeholder="Anjali Sharma"
              />
            </div>
          </div>
          <div className="cr-field-col">
            <label className="cr-field-label">Phone</label>
            <div className="cr-field">
              <Phone size={15} color="#9C8A6A" />
              <input
                value={form.phone}
                onChange={update("phone")}
                placeholder="+91 98765 43210"
              />
            </div>
          </div>
        </div>

        <label className="cr-field-label">Email</label>
        <div className="cr-field">
          <Mail size={15} color="#9C8A6A" />
          <input
            value={form.email}
            onChange={update("email")}
            placeholder="you@cosmicremedies.com"
          />
        </div>

        <div className="cr-field-row">
          <div className="cr-field-col">
            <label className="cr-field-label">Password</label>
            <div className="cr-field">
              <Lock size={15} color="#9C8A6A" />
              <input
                type="password"
                value={form.password}
                onChange={update("password")}
                placeholder="••••••••"
              />
            </div>
          </div>
          <div className="cr-field-col">
            <label className="cr-field-label">Confirm Password</label>
            <div className="cr-field">
              <Lock size={15} color="#9C8A6A" />
              <input
                type="password"
                value={form.confirmPassword}
                onChange={update("confirmPassword")}
                placeholder="••••••••"
              />
            </div>
          </div>
        </div>

        <div className="cr-field-row">
          <div className="cr-field-col">
            <label className="cr-field-label">Years of Experience</label>
            <div className="cr-field">
              <Briefcase size={15} color="#9C8A6A" />
              <input
                type="number"
                min="0"
                value={form.experience}
                onChange={update("experience")}
                placeholder="5"
              />
            </div>
          </div>
          <div className="cr-field-col">
            <label className="cr-field-label">Expertise</label>
            <div className="cr-field">
              <Sparkles size={15} color="#9C8A6A" />
              <input
                value={form.expertise}
                onChange={update("expertise")}
                placeholder="Vedic, Numerology"
              />
            </div>
          </div>
        </div>

        <label className="cr-field-label">Languages</label>
        <div className="cr-field">
          <Languages size={15} color="#9C8A6A" />
          <input
            value={form.languages}
            onChange={update("languages")}
            placeholder="Hindi, English"
          />
        </div>

        <label className="cr-field-label">Short Bio</label>
        <div className="cr-field cr-field-textarea">
          <FileText size={15} color="#9C8A6A" style={{ marginTop: 2 }} />
          <textarea
            value={form.bio}
            onChange={update("bio")}
            placeholder="A brief introduction for your profile…"
            rows={3}
          />
        </div>

        <button
          className="cr-login-btn"
          onClick={handleRegister}
          disabled={loading}
          style={{ marginTop: 4 }}
        >
          {loading ? "Submitting..." : "Create Account"}
        </button>

        <div className="cr-login-route">
          Already have an account?{" "}
          <b>
            <button
              type="button"
              className="cr-link-btn"
              onClick={onSwitchToLogin}
            >
              Sign in
            </button>
          </b>
        </div>
      </div>
    </div>
  );
};

export default RegisterView;
