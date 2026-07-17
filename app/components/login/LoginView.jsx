import { Lock, Mail } from "lucide-react";
import { LotusWatermark } from "../common/LotusWatermark";

const LoginView = ({ onLogin }) => (
  <div className="cr-login-wrap">
    <LotusWatermark className="cr-login-mandala" size={780} opacity={0.14} />
    <div className="cr-login-card">
      <img src="/image.webp" alt="Cosmic Remedies" className="cr-login-mark" />
      <div className="cr-login-title cr-shimmer-text">Cosmic Remedies</div>
      <div className="cr-login-sub">Sign in to the Astrologer Desk</div>

      <label className="cr-field-label">Email</label>
      <div className="cr-field">
        <Mail size={15} color="#9C8A6A" />
        <input placeholder="you@cosmicremedies.com" />
      </div>

      <label className="cr-field-label">Password</label>
      <div className="cr-field">
        <Lock size={15} color="#9C8A6A" />
        <input type="password" placeholder="••••••••" />
      </div>

      <button className="cr-login-btn" onClick={onLogin}>
        Sign in
      </button>
      <div className="cr-login-foot">
        Astrologer accounts only — created by an admin.
      </div>
    </div>
  </div>
);

export default LoginView;
