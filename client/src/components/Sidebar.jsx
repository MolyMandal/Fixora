
function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h2>Fixora<span>.</span></h2>
        <p>Work smarter. Fix faster.</p>
      </div>

      <nav className="sidebar-navigation">
        <p className="sidebar-label">WORKSPACE</p>

        <a href="#dashboard" className="sidebar-link active">
          <span>▦</span>
          Dashboard
        </a>

        <a href="#projects" className="sidebar-link">
          <span>▣</span>
          Projects
        </a>

        <a href="#tickets" className="sidebar-link">
          <span>◷</span>
          Tickets
        </a>
      </nav>

      <div className="sidebar-footer">
        <p>Fixora Project Management</p>
        <span>Manage work. Together.</span>
      </div>
    </aside>
  );
}

export default Sidebar;
