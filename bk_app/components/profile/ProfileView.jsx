"use client";

import { useState } from "react";
import {
  User,
  Phone,
  Briefcase,
  Sparkles,
  Languages,
  FileText,
  Star,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";
import axiosInstanceClient from "../services/client.services";
import { useToast } from "../context/ToastContext";

export default function ProfileView({ astrologer, onUpdate }) {
  const toast = useToast();

  const [form, setForm] = useState({
    name: astrologer?.name || "",
    phone: astrologer?.phone || "",
    experience: astrologer?.experience ?? "",
    expertise: (astrologer?.expertise || []).join(", "),
    languages: (astrologer?.languages || []).join(", "),
    bio: astrologer?.bio || "",
  });
  const [saving, setSaving] = useState(false);

  const update = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
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
      };

      const res = await axiosInstanceClient.patch(
        "/astrologer/profile",
        payload,
      );
      const updated = res.data?.data?.astrologer;

      if (updated) onUpdate?.(updated);
      toast.success("Profile updated successfully.");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to update profile. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (!astrologer) return null;

  return (
    <>
      <div className="cr-card" style={{ padding: 20, marginBottom: 18 }}>
        <div
          style={{
            display: "flex",
            gap: 16,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "var(--gold, #c9a227)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {(astrologer.name || "?")
              .split(" ")
              .map((w) => w[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)}
          </div>

          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 16, fontWeight: 700 }}>
              {astrologer.name}
            </div>
            <div style={{ fontSize: 12.5, color: "var(--text-dim)" }}>
              {astrologer.email}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(224,172,70,0.12)",
                border: "1px solid rgba(224,172,70,0.3)",
                borderRadius: 8,
                padding: "6px 12px",
                fontSize: 12.5,
              }}
            >
              <Star size={13} color="var(--gold, #c9a227)" />
              {astrologer.totalRatings > 0
                ? `${astrologer.avgRating?.toFixed(1)} (${astrologer.totalRatings})`
                : "No ratings yet"}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: astrologer.isActive
                  ? "rgba(46,125,50,0.1)"
                  : "rgba(176,58,46,0.1)",
                border: `1px solid ${astrologer.isActive ? "rgba(46,125,50,0.3)" : "rgba(176,58,46,0.3)"}`,
                borderRadius: 8,
                padding: "6px 12px",
                fontSize: 12.5,
              }}
            >
              {astrologer.isActive ? (
                <ShieldCheck size={13} color="var(--success)" />
              ) : (
                <ShieldOff size={13} color="var(--danger)" />
              )}
              {astrologer.isActive ? "Active" : "Inactive"} ·{" "}
              {astrologer.approvalStatus}
            </div>
          </div>
        </div>
      </div>

      <div className="cr-card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>
          Edit Profile
        </h3>

        <div className="cr-field-row">
          <div className="cr-field-col">
            <label className="cr-field-label">Full Name</label>
            <div className="cr-field">
              <User size={15} color="#9C8A6A" />
              <input
                value={form.name}
                onChange={update("name")}
                placeholder="Your name"
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
            rows={4}
          />
        </div>

        <button
          className="cr-login-btn"
          onClick={handleSave}
          disabled={saving}
          style={{ marginTop: 8, width: "auto", padding: "10px 28px" }}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </>
  );
}
