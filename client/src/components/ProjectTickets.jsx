
import { useCallback, useEffect, useState } from "react";
import TicketForm from "./TicketForm";
import TicketList from "./TicketList";

function ProjectTickets({ project, token }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [assignee, setAssignee] = useState("");

  const fetchTickets = useCallback(
    async (filters = {}) => {
      try {
        setLoading(true);
        setError("");

        const queryParams = new URLSearchParams();

        if (filters.status) queryParams.append("status", filters.status);
        if (filters.priority) queryParams.append("priority", filters.priority);
        if (filters.assignee) queryParams.append("assignee", filters.assignee);

        if (filters.search?.trim()) {
          queryParams.append("search", filters.search.trim());
        }

        const queryString = queryParams.toString();

        const url = `http://localhost:5000/api/tickets/project/${project._id}${
          queryString ? `?${queryString}` : ""
        }`;

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to fetch tickets.");
        }

        setTickets(data.tickets || []);
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    },
    [project._id, token]
  );

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const activeFilters = { search, status, priority, assignee };

  const handleFilterSubmit = (event) => {
    event.preventDefault();
    fetchTickets(activeFilters);
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatus("");
    setPriority("");
    setAssignee("");
    fetchTickets({});
  };

  const owner =
    project.owner && typeof project.owner === "object"
      ? project.owner
      : null;

  const assignableMembers = [
    ...(owner?._id ? [owner] : []),
    ...(project.teamMembers || []),
  ];

  const todoCount = tickets.filter(
    (ticket) => ticket.status === "To Do"
  ).length;

  const inProgressCount = tickets.filter(
    (ticket) => ticket.status === "In Progress"
  ).length;

  const completedCount = tickets.filter(
    (ticket) => ticket.status === "Done"
  ).length;

  const summaryCards = [
    {
      label: "Total Tickets",
      value: tickets.length,
      icon: "▤",
      color: "purple",
    },
    {
      label: "To Do",
      value: todoCount,
      icon: "◷",
      color: "blue",
    },
    {
      label: "In Progress",
      value: inProgressCount,
      icon: "⟳",
      color: "violet",
    },
    {
      label: "Completed",
      value: completedCount,
      icon: "✓",
      color: "green",
    },
  ];

  return (
    <section className="project-tickets-section">

      {/* Ticket Page Heading */}
      <div className="ticket-page-heading">
        <div>
          <span className="page-eyebrow">WORKSPACE MANAGEMENT</span>
          <h3>Ticket Management</h3>
          <p>Organize, track and manage your project tasks from one place.</p>
        </div>

        <button
          type="button"
          className="ticket-create-shortcut"
          onClick={() =>
            document.getElementById("ticket-create-form")?.scrollIntoView({
              behavior: "smooth",
              block: "center",
            })
          }
        >
          + Create Ticket
        </button>
      </div>

      {/* Ticket Summary Cards */}
      <div className="ticket-summary-grid">
        {summaryCards.map((card) => (
          <article
            className={`ticket-summary-card ${card.color}`}
            key={card.label}
          >
            <div className="ticket-summary-icon">{card.icon}</div>
            <div className="ticket-summary-info">
              <span>{card.label}</span>
              <h3>{loading ? "—" : card.value}</h3>
            </div>
          </article>
        ))}
      </div>

      {/* Create Ticket and Guidelines */}
      <div className="ticket-create-layout">
        <div className="ticket-create-main" id="ticket-create-form">
          <div className="ticket-section-title">
            <div className="ticket-section-icon">＋</div>
            <div>
              <h4>Create New Ticket</h4>
              <p>Add a new task or issue to your project.</p>
            </div>
          </div>

          <TicketForm
            projectId={project._id}
            teamMembers={assignableMembers}
            token={token}
            onTicketCreated={() => fetchTickets(activeFilters)}
          />
        </div>

        <aside className="ticket-guidelines">
          <div className="ticket-guideline-icon">♧</div>
          <span className="page-eyebrow">QUICK GUIDE</span>
          <h4>Keep work moving.</h4>
          <p>
            Create clear, actionable tickets to keep your project organized.
          </p>

          <div className="ticket-guideline-item">
            <span>✓</span>
            <div>
              <strong>Write clear titles</strong>
              <p>Make every task easy to understand.</p>
            </div>
          </div>

          <div className="ticket-guideline-item">
            <span>✓</span>
            <div>
              <strong>Add a detailed description</strong>
              <p>Give your team useful context.</p>
            </div>
          </div>

          <div className="ticket-guideline-item">
            <span>✓</span>
            <div>
              <strong>Set the right priority</strong>
              <p>Focus on important work first.</p>
            </div>
          </div>

          <div className="ticket-guideline-item">
            <span>✓</span>
            <div>
              <strong>Assign responsibility</strong>
              <p>Make sure everyone knows their tasks.</p>
            </div>
          </div>
        </aside>
      </div>

      {/* Search and Filters */}
      <div className="ticket-filter-section ticket-filter-redesign">

        <div className="ticket-filter-heading">
          <div className="ticket-section-icon">⌕</div>
          <div>
            <h4>Search &amp; Filter</h4>
            <p>Find tickets quickly using search and filters.</p>
          </div>
        </div>

        <form
          className="ticket-filter-form ticket-filter-form-redesign"
          onSubmit={handleFilterSubmit}
        >
          <div className="ticket-search-field">
            <label htmlFor={`ticket-search-${project._id}`}>
              Search tickets
            </label>
            <input
              id={`ticket-search-${project._id}`}
              type="search"
              placeholder="Search by title or description..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="ticket-filter-field">
            <label htmlFor={`ticket-status-${project._id}`}>Status</label>
            <select
              id={`ticket-status-${project._id}`}
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>

          <div className="ticket-filter-field">
            <label htmlFor={`ticket-priority-${project._id}`}>Priority</label>
            <select
              id={`ticket-priority-${project._id}`}
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div className="ticket-filter-field">
            <label htmlFor={`ticket-assignee-${project._id}`}>Assignee</label>
            <select
              id={`ticket-assignee-${project._id}`}
              value={assignee}
              onChange={(event) => setAssignee(event.target.value)}
            >
              <option value="">All Assignees</option>
              <option value="unassigned">Unassigned</option>

              {assignableMembers.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          <div className="ticket-filter-actions">
            <button type="submit" disabled={loading}>
              {loading ? "Searching..." : "⌕ Apply Filters"}
            </button>

            <button
              type="button"
              className="clear-ticket-filters"
              onClick={handleClearFilters}
            >
              ↻ Clear
            </button>
          </div>
        </form>
      </div>

      {error && (
        <p className="ticket-error" role="alert">
          {error}
        </p>
      )}

      {/* Ticket List */}
      <div className="ticket-list-section">
        <div className="ticket-list-heading">
          <div className="ticket-section-title">
            <div className="ticket-section-icon">▱</div>
            <div>
              <h4>Project Tickets</h4>
              <p>View and manage all tickets in this project.</p>
            </div>
          </div>

          <span className="ticket-result-count">
            {tickets.length} {tickets.length === 1 ? "Ticket" : "Tickets"}
          </span>
        </div>

        <div className="ticket-table-container">
          <TicketList
            tickets={tickets}
            loading={loading}
            onRefresh={() => fetchTickets(activeFilters)}
            token={token}
            teamMembers={assignableMembers}
          />
        </div>
      </div>
    </section>
  );
}

export default ProjectTickets;
