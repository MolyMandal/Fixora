
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import ProjectTickets from "../components/ProjectTickets";

const API_URL = "http://localhost:5000/api/projects";

function Tickets() {
  const { token } = useAuth();

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load projects.");
        }

        const projectList = data.projects || [];
        setProjects(projectList);

        if (projectList.length > 0) {
          setSelectedProjectId(projectList[0]._id);
        }
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchProjects();
    }
  }, [token]);

  const selectedProject = projects.find(
    (project) => project._id === selectedProjectId
  );

  const handleCreateTicketClick = () => {
    document
      .querySelector(".ticket-form-section")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="tickets-page professional-tickets-page">
      {/* Page Header */}
      <header className="tickets-main-header">
        <div>
          <span className="page-eyebrow">WORKSPACE MANAGEMENT</span>
          <h2>Tickets</h2>
          <p>Track, organize, and manage your project tasks.</p>
        </div>

        <button
          type="button"
          className="tickets-header-create"
          onClick={handleCreateTicketClick}
          disabled={!selectedProject}
        >
          <span>＋</span> Create Ticket
        </button>
      </header>

      {/* Project Selector */}
      <section className="tickets-project-selector professional-project-selector">
        <div className="tickets-selector-icon">▣</div>

        <div className="tickets-selector-content">
          <label htmlFor="tickets-project">Select Project</label>

          {loading ? (
            <p>Loading projects...</p>
          ) : projects.length === 0 ? (
            <p>No projects available. Create a project first.</p>
          ) : (
            <select
              id="tickets-project"
              value={selectedProjectId}
              onChange={(event) =>
                setSelectedProjectId(event.target.value)
              }
            >
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.title}
                </option>
              ))}
            </select>
          )}
        </div>
      </section>

      {error && (
        <p className="ticket-error" role="alert">
          {error}
        </p>
      )}

      {selectedProject && (
        <ProjectTickets
          project={selectedProject}
          token={token}
        />
      )}

      {!loading && projects.length === 0 && !error && (
        <div className="tickets-empty-workspace">
          <h3>No projects yet</h3>
          <p>Create a project before managing tickets.</p>
        </div>
      )}
    </div>
  );
}

export default Tickets;
