import React, { useState } from 'react';
import { Shield, AlertCircle, ArrowLeft, Check, Lock, User as UserIcon } from 'lucide-react';
import { User } from '../types';

interface Props {
  onLogin: (employee_id: string, password?: string) => Promise<void>;
  availableUsers: User[];
}

export const LoginScreen: React.FC<Props> = ({ onLogin, availableUsers }) => {
  const [employeeId, setEmployeeId] = useState('HSE001');
  const [password, setPassword] = useState('sentra2026');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId.trim()) {
      setError('Please enter your Employee ID or registered email.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onLogin(employeeId.trim(), password);
    } catch (err: any) {
      setError(err.message || 'Invalid employee ID/email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (empId: string) => {
    setEmployeeId(empId);
    setPassword('sentra2026');
    setError(null);
  };

  return (
    <div className="login-split-container">
      {/* Left Brand / Industrial Hero Panel */}
      <div className="login-hero-panel">
        {/* Brand Header */}
        <div className="hero-brand-header">
          <div className="hero-logo-badge">S</div>
          <div>
            <div className="hero-brand-title">SENTRA</div>
            <div className="hero-brand-subtitle">SAFETY INTELLIGENCE PLATFORM</div>
          </div>
        </div>

        {/* Center Quote / Value Proposition */}
        <div className="hero-center-box">
          <div className="hero-tag">PROCESS SAFETY & HSE INTELLIGENCE</div>
          <div className="hero-quote">
            Turning safety evidence into actionable intelligence before a precursor becomes an event.
          </div>
        </div>

        {/* Bottom Organization Context */}
        <div className="hero-bottom-context">
          <div className="hero-org-title">Oil India Limited</div>
          <div className="hero-org-subtitle">
            Field Operations & Incident Risk Console · Problem Statement 26165
          </div>
        </div>
      </div>

      {/* Right Enterprise Authentication Form Panel */}
      <div className="login-form-panel">
        <div className="login-form-inner">
          {/* Top Bar Link */}
          <div className="login-top-link">
            <span>&lt;- Back to Home</span>
          </div>

          <div className="login-header-group">
            <h1 className="login-heading">Welcome back</h1>
            <p className="login-subheading">
              Sign in to your Oil India safety intelligence workspace.
            </p>
          </div>

          {error && (
            <div className="login-error-alert">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form-fields">
            {/* Employee ID / Email */}
            <div className="login-field-group">
              <label className="login-label">EMPLOYEE ID / EMAIL</label>
              <input
                type="text"
                className="login-input"
                placeholder="e.g. HSE001"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                autoFocus
                required
              />
            </div>

            {/* Password */}
            <div className="login-field-group">
              <div className="login-label-row">
                <label className="login-label">PASSWORD</label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    setError('Contact HSE System Administrator (admin@oilindia.in) for credentials reset.');
                  }}
                  className="login-forgot-link"
                >
                  Forgot Password?
                </a>
              </div>
              <input
                type="password"
                className="login-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Remember Workstation Checkbox */}
            <div className="login-remember-row">
              <label className="login-checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember this workstation</span>
              </label>
            </div>

            {/* Sign In Primary Button */}
            <button
              type="submit"
              className="login-submit-btn"
              disabled={loading}
            >
              {loading ? 'SIGNING IN...' : 'SIGN IN'}
            </button>

            {/* SSO Enterprise Button */}
            <button
              type="button"
              className="login-sso-btn"
              onClick={() => handleQuickFill('HSE001')}
            >
              SIGN IN WITH OIL INDIA SSO
            </button>
          </form>

          {/* Quick Demo Access Pills */}
          <div className="login-demo-section">
            <div className="login-demo-header">DEMO ROLE QUICK ACCESS</div>
            <div className="login-demo-pills">
              <button
                type="button"
                className={`login-pill ${employeeId === 'HSE001' ? 'active' : ''}`}
                onClick={() => handleQuickFill('HSE001')}
              >
                HSE Analyst (HSE001)
              </button>
              <button
                type="button"
                className={`login-pill ${employeeId === 'SAFE001' ? 'active' : ''}`}
                onClick={() => handleQuickFill('SAFE001')}
              >
                Safety Officer (SAFE001)
              </button>
            </div>
          </div>

          {/* Footer Action Links */}
          <div className="login-footer-row">
            <a
              href="#report"
              className="login-footer-link highlight"
              onClick={(e) => {
                e.preventDefault();
                handleQuickFill('HSE001');
              }}
            >
              REPORT AN INCIDENT
            </a>
            <span className="login-footer-link muted">
              Need Help? Contact Admin
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
