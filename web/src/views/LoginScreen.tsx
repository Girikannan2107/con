import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { User } from '../types';

interface Props {
  onLogin: (employee_id: string, password?: string) => Promise<void>;
  availableUsers: User[];
}

export const LoginScreen: React.FC<Props> = ({ onLogin, availableUsers }) => {
  const [employeeId, setEmployeeId] = useState('HSE001');
  const [password, setPassword] = useState('sentra2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId.trim()) {
      setError('Please enter your username or registered email.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onLogin(employeeId.trim(), password);
    } catch (err: any) {
      setError(err.message || 'Invalid username/email or password.');
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
      {/* Left Dark Branded Panel */}
      <div className="login-hero-panel">
        <div className="hero-top-section">
          <div className="hero-brand-header">
            <div className="hero-logo-badge">S</div>
            <div>
              <div className="hero-brand-title">SENTRA</div>
              <div className="hero-brand-subtitle">SAFETY · INTELLIGENCE · COMPLIANCE</div>
            </div>
          </div>

          <div className="hero-statement-box">
            <p className="hero-statement-text">
              Reads each near-miss and UA/UC report as it arrives, finds the ones that could have killed someone, shows why, and asks a person to confirm.
            </p>
          </div>

          <div className="hero-workflow-stepper">
            <div className="step-item">
              <span className="step-circle">1</span>
              <span className="step-label">Report</span>
            </div>
            <ArrowRight size={14} className="step-arrow" />
            <div className="step-item">
              <span className="step-circle">2</span>
              <span className="step-label">Read</span>
            </div>
            <ArrowRight size={14} className="step-arrow" />
            <div className="step-item">
              <span className="step-circle">3</span>
              <span className="step-label">Flag</span>
            </div>
            <ArrowRight size={14} className="step-arrow" />
            <div className="step-item">
              <span className="step-circle">4</span>
              <span className="step-label">Explain</span>
            </div>
            <ArrowRight size={14} className="step-arrow" />
            <div className="step-item active">
              <span className="step-circle">5</span>
              <span className="step-label">Person confirms</span>
            </div>
          </div>
        </div>

        <div className="hero-bottom-context">
          <div className="hero-org-title">Oil India Limited</div>
          <div className="hero-org-subtitle">
            Enterprise Process Safety & Loss Prevention Platform
          </div>
        </div>
      </div>

      {/* Right Authentication Surface */}
      <div className="login-form-panel">
        <div className="login-form-inner">
          <div className="login-header-group">
            <h1 className="login-heading">Sign in</h1>
            <p className="login-subheading">
              Use your SENTRA account. Your role is managed by your administrator.
            </p>
          </div>

          {error && (
            <div className="login-error-alert">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form-fields">
            {/* Username or email */}
            <div className="login-field-group">
              <label className="login-label">Username or email</label>
              <input
                type="text"
                className="login-input"
                placeholder="e.g. HSE001 or name@oilindia.in"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                autoFocus
                required
              />
            </div>

            {/* Password */}
            <div className="login-field-group">
              <label className="login-label">Password</label>
              <div className="password-input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="login-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="btn-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  <span>{showPassword ? 'Hide' : 'Show'}</span>
                </button>
              </div>
            </div>

            {/* Remember me on this workstation */}
            <div className="login-remember-row">
              <label className="login-checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me on this workstation</span>
              </label>
            </div>

            {/* Primary Sign In Button */}
            <button
              type="submit"
              className="login-submit-btn"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

            {/* Security note below button */}
            <div className="login-security-notice">
              <ShieldCheck size={14} className="text-green" />
              <span>
                Protected by SHA-256 workstation authentication and audit chain logging.
              </span>
            </div>
          </form>

          {/* Demo Access Switcher */}
          <div className="login-demo-section">
            <div className="login-demo-header">AUTHORIZED DEMO PROFILES</div>
            <div className="login-demo-pills">
              <button
                type="button"
                className={`login-pill ${employeeId === 'HSE001' ? 'active' : ''}`}
                onClick={() => handleQuickFill('HSE001')}
              >
                HSE Lead (HSE001)
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
        </div>
      </div>
    </div>
  );
};
