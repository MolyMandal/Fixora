
import { useEffect, useState } from "react";
import { useAuth } from "./context/AuthContext";
import ProjectTickets from "./components/ProjectTickets";
import Sidebar from "./components/Sidebar";
import "./App.css";

const API_URL = "http://localhost:5000/api/projects";

function App() {
  const { login, register, user, token, logout, isAuthenticated } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("all");

  const [projectData, setProjectData] = useState({
    title: "",
    description: "",
  });

  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editData, setEditData] = useState({
    title: "",
    description: "",
  });

  const [memberEmails, setMemberEmails] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [projectLoading, setProjectLoading] = useState(false);

  const currentUserId = String(user?._id || user?.id || "");

  const getOwnerId = (project) => {
    const owner = project?.owner;

    if (owner && typeof owner === "object") {
      return String(owner._id || owner.id || "");
    }

    return String(owner || "");
  };

  const isProjectOwner = (project) => {
    return Boolean(
      currentUserId && getOwnerId(project) === currentUserId
    );
  };

  // Authentication form
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Register and login
  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await login({
          email: formData.email,
          password: formData.password,
        });

        setMessage("Login successful!");
      } else {
        await register({
          name: formData.name,
          email: formData.email,
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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch projects
  const fetchProjects = async () => {
    try {
      setError("");

      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to fetch projects");
      }

      setProjects(data.projects || []);
    } catch (err) {
      setError(err.message);
    }
  };

  // Load projects after login
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchProjects();
    }
  }, [isAuthenticated, token]);

  // Create project
  const handleCreateProject = async (e) => {
    e.preventDefault();

    setProjectLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(projectData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Project creation failed");
      }

      setMessage("Project created successfully!");

      setProjectData({
        title: "",
        description: "",
      });

      await fetchProjects();
    } catch (err) {
      setError(err.message);
    } finally {
      setProjectLoading(false);
    }
  };

  // Delete project
  const handleDeleteProject = async (projectId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      const response = await fetch(`${API_URL}/${projectId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Project deletion failed");
      }

      setMessage("Project deleted successfully!");
      await fetchProjects();
    } catch (err) {
      setError(err.message);
    }
  };

  // Start editing a project
  const handleStartEdit = (project) => {
    setEditingProjectId(project._id);

    setEditData({
      title: project.title || "",
      description: project.description || "",
    });

    setError("");
    setMessage("");
  };

  // Update project
  const handleUpdateProject = async (e, projectId) => {
    e.preventDefault();

    try {
      setError("");
      setMessage("");

      const response = await fetch(`${API_URL}/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Project update failed");
      }

      setMessage("Project updated successfully!");
      setEditingProjectId(null);

      await fetchProjects();
    } catch (err) {
      setError(err.message);
    }
  };

  // Add team member
  const handleAddMember = async (e, projectId) => {
    e.preventDefault();

    const email = (memberEmails[projectId] || "").trim();

    if (!email) {
      setError("Please enter a team member's email.");
      return;
    }

    try {
      setError("");
      setMessage("");

      const response = await fetch(`${API_URL}/${projectId}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to add team member");
      }

      setMessage("Team member added successfully!");

      setMemberEmails((previous) => ({
        ...previous,
        [projectId]: "",
      }));

      await fetchProjects();
    } catch (err) {
      setError(err.message);
    }
  };

  // Remove team member
  const handleRemoveMember = async (projectId, email) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove ${email} from this project?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      const response = await fetch(`${API_URL}/${projectId}/members`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to remove team member");
      }

      setMessage("Team member removed successfully!");

      await fetchProjects();
    } catch (err) {
      setError(err.message);
    }
  };

  // Authentication screen
  if (!isAuthenticated) {
    return (
      <main>
        <h1>Fixora</h1>
        <p>Work smarter. Fix faster.</p>

        <h2>{isLogin ? "Login to your account" : "Create an account"}</h2>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div>
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="password-field">
            <label htmlFor="password">Password</label>

            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && <p role="alert">{error}</p>}
          {message && <p role="status">{message}</p>}

          <button type="submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : isLogin
                ? "Login"
                : "Register"}
          </button>
        </form>

        <p>
          {isLogin
            ? "Don't have an account?"
            : "Already have an account?"}

          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setShowPassword(false);
              setError("");
              setMessage("");

              setFormData({
                name: "",
                email: "",
                password: "",
              });
            }}
          >
            {isLogin ? "Register" : "Login"}
          </button>
        </p>
      </main>
    );
  }

  // Project dashboard
  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1>Fixora</h1>
            <p>Work smarter. Fix faster.</p>
          </div>

          <button onClick={logout}>Logout</button>
        </header>

        <nav className="breadcrumbs" aria-label="Breadcrumb">
        <span>Dashboard</span>
        <span className="breadcrumb-separator">/</span>
        <span>Projects</span>
        <span className="breadcrumb-separator">/</span>
        <strong>My Projects</strong>
      </nav>

      <section className="welcome-section">
        <h2>Welcome back, {user?.name}!</h2>
        <p>Manage your projects and collaborate with your team.</p>
      </section>

        {error && <p role="alert">{error}</p>}
        {message && <p role="status">{message}</p>}

        <section className="project-summary">
          <div>
            <h3>{projects.length}</h3>
            <p>Total Projects</p>
          </div>
        </section>

        <section className="create-project-section">
          <h2>Create New Project</h2>

          <form onSubmit={handleCreateProject}>
            <div>
              <label htmlFor="title">Project Title</label>
              <input
                id="title"
                type="text"
                placeholder="Enter project title"
                value={projectData.title}
                onChange={(e) =>
                  setProjectData({
                    ...projectData,
                    title: e.target.value,
                  })
                }
                minLength={2}
                maxLength={100}
                required
              />
            </div>

            <div>
              <label htmlFor="description">Project Description</label>
              <textarea
                id="description"
                placeholder="Describe your project"
                value={projectData.description}
                onChange={(e) =>
                  setProjectData({
                    ...projectData,
                    description: e.target.value,
                  })
                }
                maxLength={1000}
                rows={4}
              />
            </div>

            <button type="submit" disabled={projectLoading}>
              {projectLoading ? "Creating..." : "+ Create Project"}
            </button>
          </form>
        </section>

        <section className="projects-section" id="projects">
            <div className="projects-section-header">
              <h2>My Projects</h2>

              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="project-selector"
              >
                <option value="all">All Projects</option>

                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </div>

          {projects.length === 0 ? (
            <p>No projects found. Create your first project!</p>
                    ) : (
                      <div className="projects-grid">
                        {projects
            .filter(
              (project) =>
                selectedProjectId === "all" ||
                project._id === selectedProjectId
            )
            .map((project) => {
                const isOwner = isProjectOwner(project);
                const isEditing = editingProjectId === project._id;
                const teamMembers = project.teamMembers || [];

                return (
                  <article className="project-card" key={project._id}>
                    {isEditing ? (
                      <>
                        <h3>Edit Project</h3>

                        <form
                          onSubmit={(e) =>
                            handleUpdateProject(e, project._id)
                          }
                        >
                          <div>
                            <label htmlFor={`edit-title-${project._id}`}>
                              Project Title
                            </label>

                            <input
                              id={`edit-title-${project._id}`}
                              type="text"
                              value={editData.title}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  title: e.target.value,
                                })
                              }
                              minLength={2}
                              maxLength={100}
                              required
                            />
                          </div>

                          <div>
                            <label htmlFor={`edit-description-${project._id}`}>
                              Description
                            </label>

                            <textarea
                              id={`edit-description-${project._id}`}
                              value={editData.description}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  description: e.target.value,
                                })
                              }
                              maxLength={1000}
                              rows={4}
                            />
                          </div>

                          <div className="project-action-buttons">
                            <button
                              type="submit"
                              className="save-project-button"
                            >
                              Save Changes
                            </button>

                            <button
                              type="button"
                              className="cancel-project-button"
                              onClick={() => setEditingProjectId(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </>
                    ) : (
                      <>
                        <h3>{project.title}</h3>

                        <p>
                          {project.description || "No description provided."}
                        </p>

                        <div className="project-details">
                          <span>
                            Owner: {project.owner?.name || "Unknown"}
                          </span>

                          <span>
                            Team Members: {teamMembers.length}
                          </span>
                        </div>

                        {isOwner && (
                          <div className="project-action-buttons">
                            <button
                              type="button"
                              className="edit-project-button"
                              onClick={() => handleStartEdit(project)}
                            >
                              Edit Project
                            </button>

                            <button
                              type="button"
                              className="delete-project-button"
                              onClick={() => handleDeleteProject(project._id)}
                            >
                              Delete Project
                            </button>
                          </div>
                        )}

                        {isOwner && (
                          <div className="team-management">
                            <h4>Team Members</h4>

                            {teamMembers.length === 0 ? (
                              <p className="empty-team-message">
                                No team members added yet.
                              </p>
                            ) : (
                              <ul className="team-member-list">
                                {teamMembers.map((member) => (
                                  <li
                                    key={
                                      member._id ||
                                      member.id ||
                                      member.email
                                    }
                                  >
                                    <div>
                                      <strong>{member.name}</strong>
                                      <span>{member.email}</span>
                                    </div>

                                    <button
                                      type="button"
                                      className="remove-member-button"
                                      onClick={() =>
                                        handleRemoveMember(
                                          project._id,
                                          member.email
                                        )
                                      }
                                    >
                                      Remove
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            )}

                            <form
                              className="add-member-form"
                              onSubmit={(e) =>
                                handleAddMember(e, project._id)
                              }
                            >
                              <label htmlFor={`member-${project._id}`}>
                                Add Team Member
                              </label>

                              <input
                                id={`member-${project._id}`}
                                type="email"
                                placeholder="Enter registered user's email"
                                value={memberEmails[project._id] || ""}
                                onChange={(e) =>
                                  setMemberEmails({
                                    ...memberEmails,
                                    [project._id]: e.target.value,
                                  })
                                }
                                required
                              />

                              <button type="submit">
                                + Add Member
                              </button>
                            </form>
                          </div>
                        )}

                        {/* Day 5: Project ticket management */}
                        <ProjectTickets
                          project={project}
                          token={token}
                        />
                      </>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
