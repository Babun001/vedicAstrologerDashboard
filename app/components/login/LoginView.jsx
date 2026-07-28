"use client";

import { useState } from "react";
import { Lock, Mail } from "lucide-react";
import { LotusWatermark } from "../common/LotusWatermark";
import axiosInstanceClient from "../services/client.services";

const LoginView = ({ onLogin, onSwitchToRegister }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);

      if(!email & !password){
        return;
      }
console.table(email, password);
      const response = await axiosInstanceClient.post("/astrologer/login", {
        email,
        password,
      });
      
      // console.log("Astrologer login response:", response.data);

      // send data to parent component
      localStorage.setItem("astrologerToken", response.data.data.accessToken); // ADD THIS

      onLogin(response.data);
    } catch (error) {
      console.error(
        "Astrologer login failed:",
        error.response?.data || error.message,
      );

      alert(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cr-login-wrap">
      <LotusWatermark className="cr-login-mandala" size={780} opacity={0.14} />
      <div className="cr-login-card">
        <img
          src="/image.webp"
          alt="Cosmic Remedies"
          className="cr-login-mark"
        />
        <div className="cr-login-title cr-shimmer-text">Cosmic Remedies</div>
        <div className="cr-login-sub">Sign in to the Astrologer Desk</div>
        <label className="cr-field-label">Email</label>
        <div className="cr-field">
          <Mail size={15} color="#9C8A6A" />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@cosmicremedies.com"
          />
        </div>

        <label className="cr-field-label">Password</label>
        <div className="cr-field">
          <Lock size={15} color="#9C8A6A" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <button
          className="cr-login-btn"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
        <div className="cr-login-route">
          New astrologer?{" "}
          <b>
            <button
              type="button"
              className="cr-link-btn"
              onClick={onSwitchToRegister}
            >
              Create an account
            </button>
          </b>
        </div>
        <div className="cr-login-foot">
          Your account will be reviewed by an admin before you can sign in.
        </div>
      </div>
    </div>
  );
};

export default LoginView;
