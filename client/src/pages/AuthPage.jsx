
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AuthPage() {
  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  // Validate full name and reject obvious random combinations.
  const validateName = (name) => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      return "Please enter your full name.";
    }

    // Require at least two name parts.
    const nameRegex = /^[A-Za-z]+(?:[ '-][A-Za-z]+)*\s+[A-Za-z]+(?:[ '-][A-Za-z]+)*$/;

    if (!nameRegex.test(trimmedName)) {
      return "Please enter your first name and surname using letters only.";
    }

    const nameParts = trimmedName.split(/\s+/);

    for (const part of nameParts) {
      const normalizedPart = part.toLowerCase();

      // Each name part must contain at least one vowel.
      if (!/[aeiou]/.test(normalizedPart)) {
        return "Please enter a proper name, not random letters.";
      }

      // Reject unusually long consonant sequences.
      if (/[bcdfghjklmnpqrstvwxyz]{3,}/i.test(normalizedPart)) {
        return "Your name appears invalid. Please enter your proper name.";
      }

      // Reject excessively repeated characters.
      if (/(.)\1{2,}/i.test(normalizedPart)) {
        return "Please enter a valid name.";
      }
    }

    return "";
  };

  const validateEmail = (email) => {
    const trimmedEmail = email.trim();

    const emailRegex =
      /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/;

    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      return "Please enter a valid email address, such as name@gmail.com.";
    }

    return "";
  };

  const validatePassword = (password) => {
    if (password.length < 8) {
      return "Password must contain at least 8 characters.";
    }

    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter.";
    }

    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter.";
    }

    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number.";
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      return "Password must contain at least one special character.";
    }

    return "";
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!isLogin) {
      const nameError = validateName(formData.name);

      if (nameError) {
        setError(nameError);
        return;
      }
    }

    const emailError = validateEmail(formData.email);

    if (emailError) {
      setError(emailError);
      return;
    }

    if (!formData.password) {
      setError("Please enter your password.");
      return;
    }

    if (!isLogin) {
      const passwordError = validatePassword(formData.password);

      if (passwordError) {
        setError(passwordError);
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        await login({
          email: formData.email.trim(),
          password: formData.password,
        });

        navigate("/app", { replace: true });
      } else {
        await register({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        });

        setMessage("Registration successful! Please log in.");
        setIsLogin(true);
        setShowPassword(false);

        setFormData({
          name: "",
          email: "",
          password: "",
        });
      }
    } catch (err) {
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const switchAuthMode = () => {
    setIsLogin(!isLogin);
    setShowPassword(false);
    setError("");
    setMessage("");

    setFormData({
      name: "",
      email: "",
      password: "",
    });
  };

  return (
    <main className="auth-page auth-split-page">

      {/* LEFT BRAND PANEL */}
      <section className="auth-brand-panel">
        <div className="auth-brand-content">

          <div className="auth-brand-logo">
            <span className="auth-logo-icon">✓</span>
            <span>Fixora</span>
          </div>

          <div className="auth-brand-message">
            <span className="auth-brand-eyebrow">
              YOUR WORKSPACE, SIMPLIFIED
            </span>

            <h1>
              Your All-in-One Hub for Managing Tasks and Boosting Team
              Productivity.
            </h1>

            <p>
              Organize your workspace, manage projects, assign tickets,
              and keep your team moving forward with Fixora.
            </p>
          </div>

          {/* Workspace Preview */}
          <div className="auth-workspace-preview">

            <div className="auth-preview-sidebar">
              <div className="auth-preview-brand">
                <span>✓</span> Fixora
              </div>

              <div className="auth-preview-nav active">
                <span>▦</span> Dashboard
              </div>

              <div className="auth-preview-nav">
                <span>▣</span> Projects
              </div>

              <div className="auth-preview-nav">
                <span>▤</span> Tickets
              </div>

              <div className="auth-preview-nav">
                <span>▥</span> Kanban Board
              </div>
            </div>

            <div className="auth-preview-main">
              <div className="auth-preview-topbar">
                <span>Workspace Overview</span>
                <span className="auth-preview-avatar">MM</span>
              </div>

              <h3>Welcome back!</h3>
              <p>Here's what's happening in your workspace.</p>

              <div className="auth-preview-stats">
                <div>
                  <span>Total Projects</span>
                  <strong>08</strong>
                </div>

                <div>
                  <span>Total Tickets</span>
                  <strong>24</strong>
                </div>

                <div>
                  <span>Completed</span>
                  <strong>16</strong>
                </div>
              </div>

              <div className="auth-preview-board">
                <div className="auth-preview-board-column">
                  <span className="preview-dot todo-dot" />
                  <strong>To Do</strong>
                  <div />
                  <div />
                </div>

                <div className="auth-preview-board-column">
                  <span className="preview-dot progress-dot" />
                  <strong>In Progress</strong>
                  <div />
                </div>

                <div className="auth-preview-board-column">
                  <span className="preview-dot done-dot" />
                  <strong>Done</strong>
                  <div />
                </div>
              </div>
            </div>
          </div>

          <div className="auth-brand-footer">
            <span>Plan better. Collaborate better. Deliver faster.</span>
            <span>© {new Date().getFullYear()} Fixora</span>
          </div>
        </div>
      </section>

      {/* RIGHT AUTH PANEL */}
      <section className="auth-form-panel">
        <div className="auth-form-card">

          <div className="auth-mobile-logo">
            <span className="auth-logo-icon">✓</span>
            <span>Fixora</span>
          </div>

          <div className="auth-form-heading">
            <div className="auth-form-icon">✓</div>

            <h2>
              {isLogin ? "Welcome back!" : "Create your account"}
            </h2>

            <p>
              {isLogin
                ? "Let's log in to your account."
                : "Get started with your Fixora workspace."}
            </p>
          </div>

          <form className="auth-modern-form" onSubmit={handleSubmit}>

            {!isLogin && (
              <div className="auth-modern-field">
                <label htmlFor="name">Full Name</label>

                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                />
              </div>
            )}

            <div className="auth-modern-field">
              <label htmlFor="email">Email Address</label>

              <input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>

            <div className="auth-modern-field">
              <label htmlFor="password">Password</label>

              <div className="auth-modern-password">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete={
                    isLogin ? "current-password" : "new-password"
                  }
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((previous) => !previous)}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {!isLogin && (
                <p className="auth-password-hint">
                  Use 8+ characters with uppercase, lowercase, a number
                  and a special character.
                </p>
              )}
            </div>

            {isLogin && (
              <div className="auth-forgot-row">
                <span>Secure login to your workspace</span>
                <span className="auth-security-label">● Protected</span>
              </div>
            )}

            {error && (
              <div className="auth-modern-error" role="alert">
                {error}
              </div>
            )}

            {message && (
              <div className="auth-modern-success" role="status">
                {message}
              </div>
            )}

            <button
              type="submit"
              className="auth-modern-submit"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : isLogin
                  ? "Sign In"
                  : "Create Account"}
            </button>
          </form>

          <div className="auth-form-divider">
            <span>SECURE WORKSPACE ACCESS</span>
          </div>

          <p className="auth-switch-text">
            {isLogin
              ? "Don't have an account?"
              : "Already have an account?"}

            <button type="button" onClick={switchAuthMode}>
              {isLogin ? "Register" : "Login"}
            </button>
          </p>

          <p className="auth-form-footer">
            Your workspace. Your team. Your progress.
          </p>
        </div>
      </section>
    </main>
  );
}

export default AuthPage;
