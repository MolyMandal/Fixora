
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import KanbanBoard from "../components/KanbanBoard";

const PROJECTS_API = "http://localhost:5000/api/projects";
const TICKETS_API = "http://localhost:5000/api/tickets";

function Kanban() {
  const { token } = useAuth();

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [tickets, setTickets] = useState([]);

  const [projectsLoading, setProjectsLoading] = useState(true);
  const [ticketsLoading, setTicketsLoading] = useState(false);

  const [error, setError] = useState("");

  const selectedProject = projects.find(
    (project) => project._id === selectedProjectId
  );

  // Fetch all projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setProjectsLoading(true);
        setError("");

        const response = await fetch(PROJECTS_API, {
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
        setError(err.message || "Unable to load projects.");
      } finally {
        setProjectsLoading(false);
      }
    };

    if (token) {
      fetchProjects();
    } else {
      setProjectsLoading(false);
    }
  }, [token]);

  // Fetch tickets for the selected project
  const fetchTickets = useCallback(async () => {
    if (!selectedProjectId || !token) {
      setTickets([]);
      setTicketsLoading(false);
      return;
    }

    try {
      setTicketsLoading(true);
      setError("");

      const response = await fetch(
        `${TICKETS_API}/project/${selectedProjectId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load tickets.");
      }

      setTickets(data.tickets || []);
    } catch (err) {
      setError(err.message || "Unable to load tickets.");
    } finally {
      setTicketsLoading(false);
    }
  }, [selectedProjectId, token]);

  useEffect(() => {
    if (selectedProjectId) {
      fetchTickets();
    }
  }, [selectedProjectId, fetchTickets]);

  // Update ticket status
  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      setError("");

      const response = await fetch(`${TICKETS_API}/${ticketId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update ticket.");
      }

      await fetchTickets();
    } catch (err) {
      setError(err.message || "Unable to update ticket.");
    }
  };

  // Prepare project owner and team members
  const owner =
    selectedProject?.owner &&
    typeof selectedProject.owner === "object"
      ? selectedProject.owner
      : null;

  const assignableMembers = selectedProject
    ? [
        ...(owner?._id ? [owner] : []),
        ...(selectedProject.teamMembers || []),
      ]
    : [];

  return (
    <div className="kanban-page">

      {/* Page Header and Project Selector */}
      <div className="kanban-page-header">
        <div className="kanban-page-heading">
          <span className="page-eyebrow">WORKSPACE MANAGEMENT</span>
          <h2>Kanban Board</h2>
          <p>Track and manage project tickets with a visual workflow.</p>
        </div>

        <div className="kanban-project-selector">
          <div className="kanban-project-icon">▤</div>

          <div className="kanban-project-select-content">
            <label htmlFor="kanban-project">Select Project</label>

            {projectsLoading ? (
              <p>Loading projects...</p>
            ) : projects.length === 0 ? (
              <p>No projects available.</p>
            ) : (
              <select
                id="kanban-project"
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
        </div>
      </div>

      {error && (
        <p className="ticket-error" role="alert">
          {error}
        </p>
      )}

      {!projectsLoading && projects.length === 0 && (
        <div className="tickets-empty-workspace">
          <h3>No projects available</h3>
          <p>Create a project first to manage its tickets.</p>
        </div>
      )}

      {selectedProject && (
        <KanbanBoard
          tickets={tickets}
          loading={ticketsLoading}
          onStatusChange={handleStatusChange}
          token={token}
          teamMembers={assignableMembers}
          onRefresh={fetchTickets}
        />
      )}
    </div>
  );
}

export default Kanban;
