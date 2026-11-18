
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Sidebar() {
  const { user, logout } = useAuth();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const getLinkClass = ({ isActive }) =>
    `sidebar-link${isActive ? " active" : ""}`;

  const userName = user?.name || "User";
  const userEmail = user?.email || "Account";

  const initials = userName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  const handleLogout = () => {
    setProfileMenuOpen(false);
    logout();
  };

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-logo">✓</div>
        <h2>Fixora</h2>
      </div>

      {/* Navigation */}
      <nav className="sidebar-navigation">
        <p className="sidebar-label">WORKSPACE</p>

        <NavLink to="/app" end className={getLinkClass}>
          <span className="sidebar-link-icon">⌂</span>
          <span className="sidebar-link-text">Dashboard</span>
        </NavLink>

        <NavLink to="/app/projects" className={getLinkClass}>
          <span className="sidebar-link-icon">▣</span>
          <span className="sidebar-link-text">Projects</span>
        </NavLink>

        <NavLink to="/app/tickets" className={getLinkClass}>
          <span className="sidebar-link-icon">▤</span>
          <span className="sidebar-link-text">Tickets</span>
        </NavLink>

        <NavLink to="/app/kanban" className={getLinkClass}>
          <span className="sidebar-link-icon">▥</span>
          <span className="sidebar-link-text">Kanban Board</span>
        </NavLink>
      </nav>

      {/* Profile Footer */}
      <div className="sidebar-footer">
        {profileMenuOpen && (
          <div className="sidebar-profile-menu">
            <div className="sidebar-menu-user">
              <strong title={userName}>{userName}</strong>
              <span title={userEmail}>{userEmail}</span>
            </div>

            <div className="sidebar-menu-divider" />

            <NavLink
              to="/app/profile"
              className="sidebar-menu-item"
              onClick={() => setProfileMenuOpen(false)}
            >
              <span>♙</span>
              My Profile
            </NavLink>

            <button
              type="button"
              className="sidebar-menu-item sidebar-logout-item"
              onClick={handleLogout}
            >
              <span>↪</span>
              Logout
            </button>
          </div>
        )}

        <button
          type="button"
          className={`sidebar-profile-trigger ${
            profileMenuOpen ? "profile-open" : ""
          }`}
          onClick={() =>
            setProfileMenuOpen((previous) => !previous)
          }
          aria-expanded={profileMenuOpen}
          aria-label="Open profile menu"
        >
          <div className="sidebar-profile-avatar">
            {initials || "U"}
          </div>

          <div className="sidebar-profile-info">
            <strong title={userName}>{userName}</strong>
            <span title={userEmail}>{userEmail}</span>
          </div>

          <span className="sidebar-profile-chevron">
            {profileMenuOpen ? "⌄" : "⌃"}
          </span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
