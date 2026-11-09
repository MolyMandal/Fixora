
import { useCallback, useEffect, useState } from "react";
import TicketForm from "./TicketForm";
import TicketList from "./TicketList";

function ProjectTickets({ project, token }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/tickets/project/${project._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to fetch tickets");
      }

      setTickets(data.tickets || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [project._id, token]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const owner =
    project.owner && typeof project.owner === "object"
      ? project.owner
      : null;

  const assignableMembers = [
    ...(owner?._id ? [owner] : []),
    ...(project.teamMembers || []),
  ];

  return (
    <section className="project-tickets-section">
      <h4>Project Tickets</h4>

      <TicketForm
        projectId={project._id}
        teamMembers={assignableMembers}
        token={token}
        onTicketCreated={fetchTickets}
      />

      <h4 className="ticket-list-heading">All Tickets</h4>

      {error && <p role="alert">{error}</p>}

      <TicketList
        tickets={tickets}
        loading={loading}
        onRefresh={fetchTickets}
      />
    </section>
  );
}

export default ProjectTickets;
