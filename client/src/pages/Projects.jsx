
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://localhost:5000/api/projects";

function Projects() {
  const { token } = useAuth();
  const createSectionRef = useRef(null);

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const [editingProjectId, setEditingProjectId] = useState(null);
  const [memberEmails, setMemberEmails] = useState({});
  const [editingMemberProjectId, setEditingMemberProjectId] =
    useState(null);
  const [saving, setSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // FETCH PROJECTS
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL, {
        headers: authHeaders,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load projects.");
      }

      setProjects(data.projects || []);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchProjects();
  }, [token, fetchProjects]);

  // PROJECT STATISTICS
  const totalMembers = projects.reduce(
    (total, project) => total + (project.teamMembers?.length || 0),
    0
  );

  const recentlyCreated = projects.filter((project) => {
    if (!project.createdAt) return false;

    const daysOld =
      (Date.now() - new Date(project.createdAt).getTime()) /
      (1000 * 60 * 60 * 24);

    return daysOld >= 0 && daysOld <= 7;
  }).length;

  // SEARCH AND SORT
  const filteredProjects = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();

    const filtered = projects.filter(
      (project) =>
        project.title?.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query)
    );

    return filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();

      if (sortOrder === "oldest") return dateA - dateB;

      if (sortOrder === "alphabetical") {
        return (a.title || "").localeCompare(b.title || "");
      }

      return dateB - dateA;
    });
  }, [projects, searchTerm, sortOrder]);

  // FORM HANDLERS
  const handleInputChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
    });
    setEditingProjectId(null);
    setError("");
  };

  const scrollToCreate = () => {
    createSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  // CREATE / UPDATE PROJECT
  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedTitle = formData.title.trim();

    if (trimmedTitle.length < 2) {
      setError("Project title must contain at least 2 characters.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const isEditing = Boolean(editingProjectId);

      const response = await fetch(
        isEditing ? `${API_URL}/${editingProjectId}` : API_URL,
        {
          method: isEditing ? "PUT" : "POST",
          headers: authHeaders,
          body: JSON.stringify({
            title: trimmedTitle,
            description: formData.description.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save project.");
      }

      setSuccess(
        isEditing
          ? "Project updated successfully."
          : "Project created successfully."
      );

      resetForm();
      await fetchProjects();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  // EDIT PROJECT
  const handleEdit = (project) => {
    setEditingProjectId(project._id);

    setFormData({
      title: project.title || "",
      description: project.description || "",
    });

    setError("");
    setSuccess("");

    scrollToCreate();
  };

  // DELETE PROJECT
  const handleDelete = async (projectId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      const response = await fetch(`${API_URL}/${projectId}`, {
        method: "DELETE",
        headers: authHeaders,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete project.");
      }

      setSuccess("Project deleted successfully.");
      await fetchProjects();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
  };

  // TEAM MEMBER HANDLERS
  const handleMemberEmailChange = (projectId, value) => {
    setMemberEmails((previous) => ({
      ...previous,
      [projectId]: value,
    }));
  };

  const handleAddMember = async (projectId) => {
    const email = memberEmails[projectId]?.trim();

    if (!email) {
      setError("Please enter a team member's email.");
      return;
    }

    try {
      setError("");
      setSuccess("");

      const response = await fetch(`${API_URL}/${projectId}/members`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to add team member.");
      }

      setSuccess("Team member added successfully.");

      setMemberEmails((previous) => ({
        ...previous,
        [projectId]: "",
      }));

      await fetchProjects();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
  };

  const handleRemoveMember = async (projectId, email) => {
    const confirmed = window.confirm(
      `Remove ${email} from this project?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      const response = await fetch(`${API_URL}/${projectId}/members`, {
        method: "DELETE",
        headers: authHeaders,
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to remove team member.");
      }

      setSuccess("Team member removed successfully.");
      await fetchProjects();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
  };

  const formatDate = (date) => {
    if (!date) return "Recently";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="projects-page projects-redesign">

      {/* PAGE HEADER */}
      <div className="projects-hero-heading">
        <div>
          <span className="page-eyebrow">WORKSPACE MANAGEMENT</span>
          <h2>Projects</h2>
          <p>
            Plan, organize and manage all your projects in one place.
          </p>
        </div>

        <button
          type="button"
          className="projects-top-create-button"
          onClick={scrollToCreate}
        >
          <span>＋</span> Create Project
        </button>
      </div>

      {/* ALERTS */}
      {error && (
        <div className="projects-alert projects-alert-error" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div
          className="projects-alert projects-alert-success"
          role="status"
        >
          {success}
        </div>
      )}

      {/* STATISTICS */}
      <section className="projects-overview-grid">

        <article className="projects-overview-card">
          <div className="projects-stat-top">
            <span className="projects-stat-icon purple">▱</span>
            <span className="projects-stat-caption">WORKSPACE</span>
          </div>
          <h3>{loading ? "—" : projects.length}</h3>
          <p>Total Projects</p>
        </article>

        <article className="projects-overview-card">
          <div className="projects-stat-top">
            <span className="projects-stat-icon blue">♙</span>
            <span className="projects-stat-caption">COLLABORATION</span>
          </div>
          <h3>{loading ? "—" : totalMembers}</h3>
          <p>Team Members</p>
        </article>

        <article className="projects-overview-card">
          <div className="projects-stat-top">
            <span className="projects-stat-icon green">✓</span>
            <span className="projects-stat-caption">WORKSPACE STATUS</span>
          </div>
          <h3>{loading ? "—" : "Active"}</h3>
          <p>Workspace Availability</p>
        </article>

        <article className="projects-overview-card">
          <div className="projects-stat-top">
            <span className="projects-stat-icon orange">✦</span>
            <span className="projects-stat-caption">RECENT ACTIVITY</span>
          </div>
          <h3>{loading ? "—" : recentlyCreated}</h3>
          <p>Created This Week</p>
        </article>

      </section>

      {/* CREATE PROJECT + GUIDELINES */}
      <section className="projects-create-layout">

        <div
          className="projects-create-card"
          ref={createSectionRef}
        >
          <div className="projects-section-title">
            <div className="projects-create-heading-content">
              <div className="projects-create-icon">▱</div>
              <div>
                <span className="projects-section-eyebrow">
                  PROJECT SETUP
                </span>
                <h3>
                  {editingProjectId
                    ? "Edit Project"
                    : "Create New Project"}
                </h3>
                <p>
                  {editingProjectId
                    ? "Update your project information."
                    : "Start something great. Add your project details below."}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="projects-form">

            <div className="projects-form-field">
              <label htmlFor="project-title">
                Project Title <span className="projects-required">*</span>
              </label>

              <input
                id="project-title"
                type="text"
                name="title"
                placeholder="e.g. Website Redesign"
                value={formData.title}
                onChange={handleInputChange}
                minLength={2}
                maxLength={100}
                required
                disabled={saving}
              />

              <span>Give your project a clear, recognizable name.</span>
            </div>

            <div className="projects-form-field">
              <label htmlFor="project-description">
                Project Description
                <span className="projects-optional-label">Optional</span>
              </label>

              <textarea
                id="project-description"
                name="description"
                placeholder="What is this project about? Add a short description..."
                value={formData.description}
                onChange={handleInputChange}
                maxLength={1000}
                rows={4}
                disabled={saving}
              />
            </div>

            <div className="projects-form-actions">
              <button
                type="button"
                className="projects-clear-button"
                onClick={resetForm}
                disabled={saving}
              >
                Clear
              </button>

              {editingProjectId && (
                <button
                  type="button"
                  className="projects-cancel-button"
                  onClick={resetForm}
                  disabled={saving}
                >
                  Cancel Edit
                </button>
              )}

              <button type="submit" disabled={saving}>
                {saving
                  ? "Saving..."
                  : editingProjectId
                    ? "Save Changes"
                    : "＋ Create Project"}
              </button>
            </div>

          </form>
        </div>

        {/* PROJECT GUIDELINES */}
        <aside className="projects-guidelines-card">

          <div className="projects-guidelines-icon">✦</div>

          <span className="projects-section-eyebrow">QUICK GUIDE</span>
          <h3>Build with clarity.</h3>

          <p>
            Keep your workspace organized with a few simple project
            management practices.
          </p>

          <div className="projects-guideline-item">
            <span>01</span>
            <div>
              <strong>Use clear titles</strong>
              <p>Make projects easy to identify.</p>
            </div>
          </div>

          <div className="projects-guideline-item">
            <span>02</span>
            <div>
              <strong>Add descriptions</strong>
              <p>Give your team useful context.</p>
            </div>
          </div>

          <div className="projects-guideline-item">
            <span>03</span>
            <div>
              <strong>Invite collaborators</strong>
              <p>Bring the right people together.</p>
            </div>
          </div>

          {/* DECORATIVE FOLDER ILLUSTRATION */}
          <div className="projects-folder-art" aria-hidden="true">
            <div className="folder-back" />
            <div className="folder-paper folder-paper-one" />
            <div className="folder-paper folder-paper-two" />
            <div className="folder-front">
              <span />
            </div>
            <div className="folder-sparkle sparkle-one">✦</div>
            <div className="folder-sparkle sparkle-two">✧</div>
            <div className="folder-sparkle sparkle-three">✦</div>
          </div>

        </aside>
      </section>

      {/* ALL PROJECTS */}
      <section className="projects-list-section projects-redesign-list">

        <div className="projects-list-heading">
          <div className="projects-list-title-content">
            <div className="projects-list-icon">▱</div>
            <div>
              <span className="projects-section-eyebrow">
                YOUR WORKSPACE
              </span>
              <h3>All Projects</h3>
              <p>Manage your projects and collaborate with your team.</p>
            </div>
          </div>

          <span className="projects-list-count">
            {filteredProjects.length}{" "}
            {filteredProjects.length === 1 ? "Project" : "Projects"}
          </span>
        </div>

        {/* SEARCH AND SORT */}
        <div className="projects-toolbar">

          <div className="projects-search-box">
            <span>⌕</span>
            <input
              type="search"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              aria-label="Search projects"
            />
          </div>

          <select
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
            aria-label="Sort projects"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="alphabetical">Alphabetical</option>
          </select>

        </div>

        {/* PROJECT LIST */}
        {loading ? (
          <div className="projects-empty-state">
            <p>Loading your projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="projects-empty-state">
            <span className="projects-empty-icon">▱</span>
            <h3>
              {projects.length === 0
                ? "No projects yet"
                : "No matching projects"}
            </h3>
            <p>
              {projects.length === 0
                ? "Create your first project and start organizing your work."
                : "Try another search term to find your project."}
            </p>
          </div>
        ) : (
          <div className="projects-horizontal-list">

            {filteredProjects.map((project) => (
              <article
                className="project-horizontal-card"
                key={project._id}
              >

                {/* PROJECT IDENTITY */}
                <div className="project-horizontal-main">

                  <div className="project-horizontal-icon">
                    {project.title?.charAt(0)?.toUpperCase() || "P"}
                  </div>

                  <div className="project-horizontal-info">
                    <div className="project-horizontal-title-row">
                      <h3>{project.title}</h3>

                      <span className="project-status-label">
                        <span />
                        Active
                      </span>
                    </div>

                    <p>
                      {project.description ||
                        "No description provided."}
                    </p>

                    {/* PROJECT METADATA */}
                    <div className="project-horizontal-meta">

                      <span>
                        <span className="project-meta-icon">▦</span>
                        Created {formatDate(project.createdAt)}
                      </span>

                      <span>
                        <span className="project-meta-icon">♙</span>
                        {project.teamMembers?.length || 0} Members
                      </span>

                    </div>
                  </div>

                </div>

                {/* PROJECT ACTIONS */}
                <div className="project-horizontal-actions">

                  <button
                    type="button"
                    className="project-action-edit"
                    onClick={() => handleEdit(project)}
                  >
                    <span>✎</span>
                    Edit
                  </button>

                  <button
                    type="button"
                    className="project-action-team"
                    onClick={() =>
                      setEditingMemberProjectId(
                        editingMemberProjectId === project._id
                          ? null
                          : project._id
                      )
                    }
                    aria-expanded={
                      editingMemberProjectId === project._id
                    }
                  >
                    <span>♙</span>
                    Manage Team
                  </button>

                  <button
                    type="button"
                    className="project-action-delete"
                    onClick={() => handleDelete(project._id)}
                    aria-label={`Delete ${project.title}`}
                    title="Delete project"
                  >
                    <span>▤</span>
                  </button>

                </div>

                {/* TEAM MANAGEMENT */}
                {editingMemberProjectId === project._id && (
                  <div className="project-horizontal-team">

                    <div className="project-team-panel-heading">
                      <div>
                        <h4>Team Management</h4>
                        <p>Invite and manage your project members.</p>
                      </div>
                      <span>
                        {project.teamMembers?.length || 0} Members
                      </span>
                    </div>

                    <form
                      onSubmit={(event) => {
                        event.preventDefault();
                        handleAddMember(project._id);
                      }}
                    >
                      <label htmlFor={`member-${project._id}`}>
                        Invite team member
                      </label>

                      <div className="project-member-input">
                        <input
                          id={`member-${project._id}`}
                          type="email"
                          placeholder="Enter email address"
                          value={memberEmails[project._id] || ""}
                          onChange={(event) =>
                            handleMemberEmailChange(
                              project._id,
                              event.target.value
                            )
                          }
                          required
                        />

                        <button type="submit">＋ Add Member</button>
                      </div>
                    </form>

                    <div className="project-member-list">
                      {project.teamMembers?.length ? (
                        project.teamMembers.map((member) => (
                          <div
                            className="project-member-row"
                            key={member._id}
                          >
                            <div className="project-member-avatar">
                              {member.name?.charAt(0)?.toUpperCase() || "U"}
                            </div>

                            <div>
                              <strong>{member.name}</strong>
                              <span>{member.email}</span>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveMember(
                                  project._id,
                                  member.email
                                )
                              }
                            >
                              Remove
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="projects-no-members">
                          No team members added yet.
                        </p>
                      )}
                    </div>

                  </div>
                )}

              </article>
            ))}

          </div>
        )}

      </section>
    </div>
  );
}

export default Projects;
