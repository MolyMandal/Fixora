
import { useState } from "react";

function TicketForm({
  projectId,
  teamMembers = [],
  onTicketCreated,
  token,
}) {
  const initialForm = {
    title: "",
    description: "",
    priority: "Medium",
    assignee: "",
  };

  const [ticketData, setTicketData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setTicketData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleClear = () => {
    setTicketData(initialForm);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedTitle = ticketData.title.trim();

    if (trimmedTitle.length < 2) {
      setError("Ticket title must contain at least 2 characters.");
      setSuccess("");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await fetch("http://localhost:5000/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...ticketData,
          title: trimmedTitle,
          description: ticketData.description.trim(),
          assignee: ticketData.assignee || null,
          projectId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to create ticket.");
      }

      setTicketData(initialForm);
      setSuccess("Ticket created successfully!");

      if (onTicketCreated) {
        await onTicketCreated();
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="ticket-form-section">
      <form className="ticket-create-form" onSubmit={handleSubmit}>
        {/* Left Column */}
        <div className="ticket-form-main-fields">
          <div className="ticket-form-field">
            <label htmlFor={`ticket-title-${projectId}`}>
              Ticket Title <span>*</span>
            </label>

            <input
              id={`ticket-title-${projectId}`}
              type="text"
              name="title"
              placeholder="e.g. Fix login authentication"
              value={ticketData.title}
              onChange={handleChange}
              minLength={2}
              maxLength={100}
              required
              disabled={loading}
            />

            <small>Give your task a clear and meaningful title.</small>
          </div>

          <div className="ticket-form-field">
            <label htmlFor={`ticket-description-${projectId}`}>
              Description
              <span className="ticket-optional-label">Optional</span>
            </label>

            <textarea
              id={`ticket-description-${projectId}`}
              name="description"
              placeholder="Describe what needs to be done..."
              value={ticketData.description}
              onChange={handleChange}
              maxLength={1000}
              rows={4}
              disabled={loading}
            />

            <small>
              {ticketData.description.length}/1000 characters
            </small>
          </div>
        </div>

        {/* Right Column */}
        <div className="ticket-form-side-fields">
          <div className="ticket-form-field">
            <label htmlFor={`ticket-priority-${projectId}`}>
              Priority <span>*</span>
            </label>

            <select
              id={`ticket-priority-${projectId}`}
              name="priority"
              value={ticketData.priority}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>

            <small>Choose the urgency of this task.</small>
          </div>

          <div className="ticket-form-field">
            <label htmlFor={`ticket-assignee-${projectId}`}>
              Assign To
            </label>

            <select
              id={`ticket-assignee-${projectId}`}
              name="assignee"
              value={ticketData.assignee}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="">Unassigned</option>

              {teamMembers.map((member) => (
                <option
                  key={member._id || member.id}
                  value={member._id || member.id}
                >
                  {member.name}
                </option>
              ))}
            </select>

            <small>Select a project member responsible for this task.</small>
          </div>

          <div className="ticket-form-info">
            <span className="ticket-form-info-icon">✦</span>
            <div>
              <strong>Task management tip</strong>
              <p>
                Set a suitable priority and assign responsibility to keep
                your project organized.
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div
            className="ticket-form-message ticket-form-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            className="ticket-form-message ticket-form-success"
            role="status"
          >
            {success}
          </div>
        )}

        {/* Actions */}
        <div className="ticket-form-actions">
          <button
            type="button"
            className="ticket-form-clear"
            onClick={handleClear}
            disabled={loading}
          >
            Clear
          </button>

          <button
            type="submit"
            className="ticket-form-submit"
            disabled={loading}
          >
            {loading ? "Creating..." : "+ Create Ticket"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default TicketForm;
