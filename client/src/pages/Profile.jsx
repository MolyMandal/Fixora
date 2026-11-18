
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function Profile() {
  const { user, updateProfile, changePassword } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Change password states
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const userName = user?.name || "User";
  const email = user?.email || "Not available";

  const initials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  const handleEdit = () => {
    setName(user?.name || "");
    setError("");
    setSuccess("");
    setIsEditing(true);
  };

  const handleCancel = () => {
    setName(user?.name || "");
    setError("");
    setIsEditing(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedName = name.trim();

    if (trimmedName.length < 2) {
      setError("Name must contain at least 2 characters.");
      return;
    }

    if (trimmedName.length > 50) {
      setError("Name cannot exceed 50 characters.");
      return;
    }

    if (trimmedName === user?.name) {
      setIsEditing(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const data = await updateProfile({ name: trimmedName });

      setName(data.user.name);
      setSuccess("Your profile has been updated successfully!");
      setIsEditing(false);
    } catch (err) {
      setError(err.message || "Unable to update your profile.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordInput = (event) => {
    const { name, value } = event.target;

    setPasswordForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setPasswordError("");
    setPasswordSuccess("");
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((previous) => ({
      ...previous,
      [field]: !previous[field],
    }));
  };

  const resetPasswordForm = () => {
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setPasswordError("");
    setPasswordSuccess("");

    setShowPasswords({
      current: false,
      new: false,
      confirm: false,
    });
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    const { currentPassword, newPassword, confirmPassword } =
      passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError(
        "New password must be at least 8 characters long."
      );
      return;
    }

    if (newPassword.length > 128) {
      setPasswordError("New password cannot exceed 128 characters.");
      return;
    }

    if (newPassword === currentPassword) {
      setPasswordError(
        "Your new password must be different from your current password."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    try {
      setPasswordLoading(true);
      setPasswordError("");
      setPasswordSuccess("");

      const data = await changePassword({
        currentPassword,
        newPassword,
      });

      setPasswordSuccess(
        data.message || "Your password has been changed successfully!"
      );

      resetPasswordForm();
    } catch (err) {
      setPasswordError(
        err.message || "Unable to change your password."
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="page-heading">
        <div>
          <span className="page-eyebrow">ACCOUNT MANAGEMENT</span>
          <h2>My Profile</h2>
          <p>View and manage your personal account information.</p>
        </div>
      </div>

      {error && (
        <div className="profile-alert profile-alert-error" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="profile-alert profile-alert-success" role="status">
          {success}
        </div>
      )}

      <section className="profile-overview-card">
        <div className="profile-avatar-large">
          {initials || "U"}
        </div>

        <div className="profile-overview-info">
          <h3>{userName}</h3>
          <p>{email}</p>

          <span className="profile-status">
            <span className="profile-status-dot" />
            Active Account
          </span>
        </div>

        {!isEditing && (
          <button
            type="button"
            className="profile-edit-button"
            onClick={handleEdit}
          >
            <span>✎</span>
            Edit Profile
          </button>
        )}
      </section>

      <section className="profile-details-card">
        <div className="profile-section-heading">
          <div>
            <h3>Personal Information</h3>
            <p>Your registered account information.</p>
          </div>
        </div>

        {isEditing ? (
          <form className="profile-edit-form" onSubmit={handleSubmit}>
            <div className="profile-edit-field">
              <label htmlFor="profile-name">Full Name</label>

              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter your full name"
                minLength={2}
                maxLength={50}
                required
                disabled={loading}
              />
            </div>

            <div className="profile-edit-field">
              <label htmlFor="profile-email">Email Address</label>

              <input
                id="profile-email"
                type="email"
                value={email}
                readOnly
                disabled
              />

              <span>Email address cannot be changed here.</span>
            </div>

            <div className="profile-edit-actions">
              <button
                type="button"
                className="profile-cancel-button"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="profile-save-button"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-details-grid">
            <div className="profile-detail-item">
              <span>Full Name</span>
              <strong>{userName}</strong>
            </div>

            <div className="profile-detail-item">
              <span>Email Address</span>
              <strong>{email}</strong>
            </div>

            <div className="profile-detail-item">
              <span>Account Status</span>
              <strong className="profile-active-text">Active</strong>
            </div>

            <div className="profile-detail-item">
              <span>Workspace</span>
              <strong>Fixora</strong>
            </div>
          </div>
        )}
      </section>

      {/* Change Password */}
      <section className="profile-details-card password-section">
        <div className="profile-section-heading">
          <div>
            <h3>Change Password</h3>
            <p>
              Update your password regularly to keep your account secure.
            </p>
          </div>
        </div>

        {passwordError && (
          <div
            className="profile-alert profile-alert-error"
            role="alert"
          >
            {passwordError}
          </div>
        )}

        {passwordSuccess && (
          <div
            className="profile-alert profile-alert-success"
            role="status"
          >
            {passwordSuccess}
          </div>
        )}

        <form
          className="profile-edit-form"
          onSubmit={handlePasswordSubmit}
        >
          <div className="profile-edit-field">
            <label htmlFor="current-password">Current Password</label>

            <div className="password-input-wrapper">
              <input
                id="current-password"
                type={showPasswords.current ? "text" : "password"}
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordInput}
                placeholder="Enter your current password"
                autoComplete="current-password"
                required
                disabled={passwordLoading}
              />

              <button
                type="button"
                className="password-visibility-button"
                onClick={() => togglePasswordVisibility("current")}
                aria-label={
                  showPasswords.current
                    ? "Hide current password"
                    : "Show current password"
                }
              >
                {showPasswords.current ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="profile-edit-field">
            <label htmlFor="new-password">New Password</label>

            <div className="password-input-wrapper">
              <input
                id="new-password"
                type={showPasswords.new ? "text" : "password"}
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordInput}
                placeholder="Enter your new password"
                autoComplete="new-password"
                minLength={8}
                maxLength={128}
                required
                disabled={passwordLoading}
              />

              <button
                type="button"
                className="password-visibility-button"
                onClick={() => togglePasswordVisibility("new")}
                aria-label={
                  showPasswords.new
                    ? "Hide new password"
                    : "Show new password"
                }
              >
                {showPasswords.new ? "Hide" : "Show"}
              </button>
            </div>

            <span>Use at least 8 characters.</span>
          </div>

          <div className="profile-edit-field">
            <label htmlFor="confirm-password">
              Confirm New Password
            </label>

            <div className="password-input-wrapper">
              <input
                id="confirm-password"
                type={showPasswords.confirm ? "text" : "password"}
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordInput}
                placeholder="Confirm your new password"
                autoComplete="new-password"
                minLength={8}
                maxLength={128}
                required
                disabled={passwordLoading}
              />

              <button
                type="button"
                className="password-visibility-button"
                onClick={() => togglePasswordVisibility("confirm")}
                aria-label={
                  showPasswords.confirm
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
              >
                {showPasswords.confirm ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="profile-edit-actions">
            <button
              type="button"
              className="profile-cancel-button"
              onClick={resetPasswordForm}
              disabled={passwordLoading}
            >
              Clear
            </button>

            <button
              type="submit"
              className="profile-save-button"
              disabled={passwordLoading}
            >
              {passwordLoading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default Profile;
