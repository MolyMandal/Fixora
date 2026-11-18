
import TicketCardActions from "./TicketCardActions";

const columns = [
  {
    id: "To Do",
    title: "To Do",
    icon: "○",
    theme: "todo",
    emptyTitle: "No pending tickets",
    emptyDescription: "New tasks will appear here.",
  },
  {
    id: "In Progress",
    title: "In Progress",
    icon: "▶",
    theme: "progress",
    emptyTitle: "No active tickets",
    emptyDescription: "Tickets will appear here when marked In Progress.",
  },
  {
    id: "Done",
    title: "Done",
    icon: "✓",
    theme: "done",
    emptyTitle: "No completed tickets",
    emptyDescription: "Completed tasks will appear here.",
  },
];

function getInitials(name) {
  if (!name || typeof name !== "string") return "?";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function formatCount(value) {
  return String(value).padStart(2, "0");
}

function KanbanBoard({
  tickets = [],
  onStatusChange,
  loading,
  token,
  teamMembers = [],
  onRefresh,
}) {
  const totalTickets = tickets.length;

  const todoCount = tickets.filter(
    (ticket) => ticket.status === "To Do"
  ).length;

  const inProgress = tickets.filter(
    (ticket) => ticket.status === "In Progress"
  ).length;

  const completed = tickets.filter(
    (ticket) => ticket.status === "Done"
  ).length;

  const progressPercentage =
    totalTickets === 0
      ? 0
      : Math.round(
          ((completed + inProgress * 0.5) / totalTickets) * 100
        );

  const summaryCards = [
    { label: "Total Tickets", value: totalTickets, icon: "▤", theme: "purple" },
    { label: "To Do", value: todoCount, icon: "◷", theme: "blue" },
    { label: "In Progress", value: inProgress, icon: "⟳", theme: "violet" },
    { label: "Completed", value: completed, icon: "✓", theme: "green" },
  ];

  if (loading) {
    return <p className="ticket-loading">Loading Kanban board...</p>;
  }

  return (
    <section className="fixora-kanban">
      {/* Summary */}
      <div className="kanban-summary">
        {summaryCards.map((card) => (
          <article
            className={`kanban-summary-card kanban-stat-${card.theme}`}
            key={card.label}
          >
            <div className={`kanban-summary-icon ${card.theme}`}>
              {card.icon}
            </div>

            <div className="kanban-summary-info">
              <span>{card.label}</span>
              <h3>{formatCount(card.value)}</h3>
            </div>
          </article>
        ))}

        <article className="kanban-progress-card">
          <div className="kanban-progress-heading">
            <span>Project Progress</span>
            <strong>{progressPercentage}%</strong>
          </div>

          <div
            className="kanban-progress-track"
            role="progressbar"
            aria-valuenow={progressPercentage}
            aria-valuemin="0"
            aria-valuemax="100"
            aria-label="Project completion"
          >
            <div
              className="kanban-progress-fill"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          <span className="kanban-progress-caption">
            Based on ticket completion
          </span>
        </article>
      </div>

      {/* Board */}
      <div className="kanban-board-wrapper">
        <div className="kanban-board">
          {columns.map((column) => {
            const columnTickets = tickets.filter(
              (ticket) => ticket.status === column.id
            );

            return (
              <section
                className={`kanban-column kanban-${column.theme}`}
                key={column.id}
              >
                {/* Improved column heading */}
                <div className="kanban-column-header">
                  <div className="kanban-column-heading">
                    <span className="kanban-column-icon">
                      {column.icon}
                    </span>

                    <div className="kanban-column-heading-text">
                      <h4>{column.title}</h4>
                      <span className="kanban-column-subtitle">
                        {column.theme === "todo"
                          ? "Tasks waiting to start"
                          : column.theme === "progress"
                          ? "Currently being worked on"
                          : "Successfully completed"}
                      </span>
                    </div>

                    <span className="kanban-count">
                      {formatCount(columnTickets.length)}
                    </span>
                  </div>
                </div>

                {/* Tickets */}
                <div className="kanban-column-content">
                  {columnTickets.map((ticket) => {
                    const assignee =
                      ticket.assignee?.name ||
                      ticket.assigneeName ||
                      "Unassigned";

                    return (
                      <article
                        className="kanban-ticket-card"
                        key={ticket._id}
                      >
                        <div className="kanban-ticket-header">
                          <h5>{ticket.title}</h5>

                          <span
                            className={`ticket-priority priority-${(
                              ticket.priority || "medium"
                            ).toLowerCase()}`}
                          >
                            {ticket.priority || "Medium"}
                          </span>

                          <TicketCardActions
                            ticket={ticket}
                            token={token}
                            teamMembers={teamMembers}
                            onRefresh={onRefresh}
                          />
                        </div>

                        <p className="kanban-ticket-description">
                          {ticket.description ||
                            "No description provided."}
                        </p>

                        <div className="kanban-ticket-footer">
                          <div className="kanban-assignee">
                            <span className="kanban-avatar">
                              {getInitials(assignee)}
                            </span>
                            <span className="kanban-assignee-name">
                              {assignee}
                            </span>
                          </div>

                          <span className="kanban-created-date">
                            {ticket.createdAt
                              ? new Date(
                                  ticket.createdAt
                                ).toLocaleDateString()
                              : "Date unavailable"}
                          </span>
                        </div>

                        <div className="kanban-status-control">
                          <label htmlFor={`status-${ticket._id}`}>
                            Update Status
                          </label>

                          <select
                            id={`status-${ticket._id}`}
                            value={ticket.status}
                            onChange={(event) =>
                              onStatusChange(
                                ticket._id,
                                event.target.value
                              )
                            }
                          >
                            <option value="To Do">To Do</option>
                            <option value="In Progress">
                              In Progress
                            </option>
                            <option value="Done">Done</option>
                          </select>
                        </div>
                      </article>
                    );
                  })}

                  {/* Empty state */}
                  {columnTickets.length === 0 && (
                    <div className="kanban-empty">
                      <span className="kanban-empty-icon">
                        {column.icon}
                      </span>

                      <h5>{column.emptyTitle}</h5>
                      <p>{column.emptyDescription}</p>
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default KanbanBoard;
