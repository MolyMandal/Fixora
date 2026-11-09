
import { useState } from "react";

function TicketForm({ projectId, teamMembers, onTicketCreated, token }) {
  const [ticketData, setTicketData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    assignee: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setTicketData({
      ...ticketData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("http://localhost:5000/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...ticketData,
          assignee: ticketData.assignee || null,
          projectId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to create ticket");
      }

      setSuccess("Ticket created successfully!");

      setTicketData({
        title: "",
        description: "",
        priority: "Medium",
        assignee: "",
      });

      if (onTicketCreated) {
        onTicketCreated();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="ticket-form-section">
      <h3>Create New Ticket</h3>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor={`ticket-title-${projectId}`}>Ticket Title</label>
          <input
            id={`ticket-title-${projectId}`}
            type="text"
            name="title"
            placeholder="Enter ticket title"
            value={ticketData.title}
            onChange={handleChange}
            minLength={2}
            maxLength={100}
            required
          />
        </div>

        <div>
          <label htmlFor={`ticket-description-${projectId}`}>
            Description
          </label>
          <textarea
            id={`ticket-description-${projectId}`}
            name="description"
            placeholder="Describe the ticket"
            value={ticketData.description}
            onChange={handleChange}
            maxLength={1000}
            rows={3}
          />
        </div>

        <div>
          <label htmlFor={`ticket-priority-${projectId}`}>Priority</label>
          <select
            id={`ticket-priority-${projectId}`}
            name="priority"
            value={ticketData.priority}
            onChange={handleChange}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        <div>
          <label htmlFor={`ticket-assignee-${projectId}`}>Assignee</label>
          <select
            id={`ticket-assignee-${projectId}`}
            name="assignee"
            value={ticketData.assignee}
            onChange={handleChange}
          >
            <option value="">Unassigned</option>

            {teamMembers.map((member) => (
              <option
                key={member._id || member.id}
                value={member._id || member.id}
              >
                {member.name} ({member.email})
              </option>
            ))}
          </select>
        </div>

        {error && <p role="alert">{error}</p>}
        {success && <p role="status">{success}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "+ Create Ticket"}
        </button>
      </form>
    </section>
  );
}

export default TicketForm;
