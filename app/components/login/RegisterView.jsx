"use client";

import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Sparkles,
  Languages,
  FileText,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { LotusWatermark } from "../common/LotusWatermark";
import axiosInstanceClient from "../services/client.services";
import {
  PasswordField,
  MultiSelectDropdown,
  AuthCardSkeleton,
} from "./Registerformhelpers";
import { useToast } from "../context/ToastContext";
import "./Registerform.css";

const EXPERTISE_OPTIONS = [
  "Vedic",
  "Numerology",
  "Tarot",
  "Vastu",
  "Palmistry",
  "Face Reading",
  "KP",
  "Nadi",
];

const LANGUAGE_OPTIONS = [
  "Hindi",
  "English",
  "Bengali",
  "Marathi",
  "Gujarati",
  "Tamil",
  "Telugu",
];

const RegisterForm = ({ onSwitchToLogin }) => {
  const toast = useToast();
  const [pageLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    experience: "",
    expertise: [],
    languages: [],
    bio: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // "form" -> "otp" -> "submitted"
  const [stage, setStage] = useState("form");
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [resending, setResending] = useState(false);

  const update = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const updateList = (field) => (values) =>
    setForm((prev) => ({ ...prev, [field]: values }));

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

  const sendOtp = async () => {
    await axiosInstanceClient.post("/astrologer/register/send-otp", {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      password: form.password,
      experience: Number(form.experience) || 0,
      expertise: form.expertise,
      languages: form.languages,
      bio: form.bio.trim(),
    });
  };

  const handleRegister = async () => {
    const validationError = validate();
    if (validationError) {
      setErrorMsg(validationError);
      toast.error(validationError);
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");

      await sendOtp();

      toast.success(`Verification code sent to ${form.email.trim()}`);
      setStage("otp");
    } catch (error) {
      console.error(
        "Astrologer registration failed:",
        error.response?.data || error.message,
      );
      const msg =
        error.response?.data?.message ||
        "Registration failed. Please try again.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setOtpError("Enter the code we sent you.");
      return;
    }

    try {
      setOtpLoading(true);
      setOtpError("");

      await axiosInstanceClient.post("/astrologer/register/verify-otp", {
        email: form.email.trim(),
        otp: otp.trim(),
      });

      toast.success("Email verified! Application submitted.");
      setStage("submitted");
    } catch (error) {
      console.error(
        "OTP verification failed:",
        error.response?.data || error.message,
      );
      const msg =
        error.response?.data?.message ||
        "Verification failed. Please check the code and try again.";
      setOtpError(msg);
      toast.error(msg);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setResending(true);
      setOtpError("");
      await sendOtp();
      toast.success("A new code has been sent.");
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to resend the code.";
      setOtpError(msg);
      toast.error(msg);
    } finally {
      setResending(false);
    }
  };

  if (pageLoading) return <AuthCardSkeleton />;

  if (stage === "submitted") {
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
            Your email is verified and your registration is pending review. An
            admin will approve your account before you can sign in.
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

  if (stage === "otp") {
    return (
      <div className="cr-login-wrap">
        <LotusWatermark
          className="cr-login-mandala"
          size={780}
          opacity={0.14}
        />
        <div className="cr-login-card">
          <div className="cr-register-success-icon">
            <ShieldCheck size={26} color="var(--gold, #c9a227)" />
          </div>
          <div
            className="cr-login-title cr-shimmer-text"
            style={{ marginTop: 14 }}
          >
            Verify your email
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
            We sent a 6-digit code to <strong>{form.email.trim()}</strong>
          </div>

          {otpError && (
            <div
              className="cr-error-box"
              style={{ marginTop: 16, marginBottom: 4 }}
            >
              <div className="cr-error-row">
                <AlertCircle
                  size={16}
                  color="var(--danger)"
                  style={{ marginTop: 2, flexShrink: 0 }}
                />
                <p className="cr-error-msg">{otpError}</p>
              </div>
            </div>
          )}

          <label className="cr-field-label" style={{ marginTop: 18 }}>
            Verification Code
          </label>
          <div className="cr-field">
            <ShieldCheck size={15} color="#9C8A6A" />
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
              inputMode="numeric"
              maxLength={6}
              autoFocus
            />
          </div>

          <button
            className="cr-login-btn"
            onClick={handleVerifyOtp}
            disabled={otpLoading}
            style={{ marginTop: 16 }}
          >
            {otpLoading ? "Verifying..." : "Verify & Create Account"}
          </button>

          <div className="cr-login-route">
            Didn't get the code?{" "}
            <b>
              <button
                type="button"
                className="cr-link-btn"
                onClick={handleResendOtp}
                disabled={resending}
              >
                {resending ? "Sending..." : "Resend code"}
              </button>
            </b>
          </div>

          <div className="cr-login-route">
            <button
              type="button"
              className="cr-link-btn"
              onClick={() => setStage("form")}
            >
              ← Back to edit details
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cr-login-wrap">
      <LotusWatermark className="cr-login-mandala" size={780} opacity={0.14} />
      <div className="cr-login-card cr-login-card--wide new">
        <img
          src="/final_logo_170826.png"
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

        <div className="cr-row-2col">
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

        <div className="cr-row-2col">
          <div className="cr-field-col">
            <label className="cr-field-label">Password</label>
            <PasswordField
              name="password"
              value={form.password}
              onChange={update("password")}
              placeholder="••••••••"
            />
          </div>
          <div className="cr-field-col">
            <label className="cr-field-label">Confirm Password</label>
            <PasswordField
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={update("confirmPassword")}
              placeholder="••••••••"
            />
          </div>
        </div>

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

        <div className="cr-row-2col">
          <div className="cr-field-col">
            <label className="cr-field-label">Expertise</label>
            <MultiSelectDropdown
              icon={<Sparkles size={15} color="#9C8A6A" />}
              options={EXPERTISE_OPTIONS}
              selected={form.expertise}
              onChange={updateList("expertise")}
              placeholder="Select expertise"
            />
          </div>
          <div className="cr-field-col">
            <label className="cr-field-label">Languages</label>
            <MultiSelectDropdown
              icon={<Languages size={15} color="#9C8A6A" />}
              options={LANGUAGE_OPTIONS}
              selected={form.languages}
              onChange={updateList("languages")}
              placeholder="Select languages"
            />
          </div>
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
          {loading ? "Sending code..." : "Continue"}
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

export default RegisterForm;
