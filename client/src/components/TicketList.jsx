
function TicketList({ tickets, loading, onRefresh }) {
  if (loading) {
    return <p className="ticket-loading">Loading tickets...</p>;
  }

  if (!tickets || tickets.length === 0) {
    return (
      <div className="empty-tickets">
        <p>No tickets created yet.</p>
      </div>
    );
  }

  return (
    <div className="ticket-list">
      {tickets.map((ticket) => (
        <article className="ticket-card" key={ticket._id}>
          <div className="ticket-card-header">
            <h4>{ticket.title}</h4>

            <span className={`ticket-priority priority-${ticket.priority?.toLowerCase()}`}>
              {ticket.priority}
            </span>
          </div>

          <p className="ticket-description">
            {ticket.description || "No description provided."}
          </p>

          <div className="ticket-metadata">
            <span>
              Status: <strong>{ticket.status}</strong>
            </span>

            <span>
              Assignee: <strong>{ticket.assignee?.name || "Unassigned"}</strong>
            </span>

            <span>
              Created:{" "}
              <strong>
                {ticket.createdAt
                  ? new Date(ticket.createdAt).toLocaleDateString()
                  : "Unavailable"}
              </strong>
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}

export default TicketList;
