
import { useState } from "react";
import { createPortal } from "react-dom";
import TicketComments from "./TicketComments";

function TicketCardActions({
  ticket,
  token,
  teamMembers = [],
  onRefresh,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState(ticket.title || "");
  const [description, setDescription] = useState(
    ticket.description || ""
  );
  const [priority, setPriority] = useState(ticket.priority || "Medium");
  const [status, setStatus] = useState(ticket.status || "To Do");
  const [assignee, setAssignee] = useState(ticket.assignee?._id || "");

  const openModal = (modal) => {
    setMenuOpen(false);
    setError("");
    setActiveModal(modal);
  };

  const closeModal = () => {
    if (saving) return;
    setActiveModal("");
    setError("");
  };

  const handleUpdate = async (event) => {
    event.preventDefault();

    if (title.trim().length < 2) {
      setError("Ticket title must be at least 2 characters.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/tickets/${ticket._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            priority,
            status,
            assignee: assignee || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update ticket.");
      }

      setActiveModal("");
      await onRefresh?.();
    } catch (err) {
      setError(err.message || "Unable to update ticket.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/tickets/${ticket._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete ticket.");
      }

      setActiveModal("");
      await onRefresh?.();
    } catch (err) {
      setError(err.message || "Unable to delete ticket.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="kanban-card-actions">
        <button
          type="button"
          className="kanban-menu-trigger"
          aria-label="Ticket actions"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((previous) => !previous)}
        >
          ⋯
        </button>

        {menuOpen && (
          <div className="kanban-action-menu">
            <button type="button" onClick={() => openModal("view")}>
              View Details
            </button>

            <button type="button" onClick={() => openModal("edit")}>
              Edit Ticket
            </button>

            <button
              type="button"
              className="kanban-menu-delete"
              onClick={() => openModal("delete")}
            >
              Delete Ticket
            </button>
          </div>
        )}
      </div>

      {activeModal &&
        createPortal(
          <div
            className="ticket-modal-overlay"
            onClick={closeModal}
          >
            <div
              className={
                activeModal === "delete"
                  ? "ticket-delete-modal"
                  : activeModal === "edit"
                    ? "ticket-edit-modal"
                    : "ticket-details-modal"
              }
              role={activeModal === "delete" ? "alertdialog" : "dialog"}
              aria-modal="true"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="ticket-modal-header">
                <h3>
                  {activeModal === "view"
                    ? ticket.title
                    : activeModal === "edit"
                      ? "Edit Ticket"
                      : "Delete Ticket?"}
                </h3>

                <button
                  type="button"
                  className="ticket-modal-close"
                  onClick={closeModal}
                  disabled={saving}
                  aria-label="Close modal"
                >
                  &times;
                </button>
              </div>

              {activeModal === "view" && (
                <>
                  <p className="ticket-details-description">
                    {ticket.description || "No description provided."}
                  </p>

                  <div className="ticket-details-metadata">
                    <div>
                      <span>Priority</span>
                      <strong>{ticket.priority}</strong>
                    </div>
                    <div>
                      <span>Status</span>
                      <strong>{ticket.status}</strong>
                    </div>
                    <div>
                      <span>Assignee</span>
                      <strong>
                        {ticket.assignee?.name || "Unassigned"}
                      </strong>
                    </div>
                    <div>
                      <span>Created</span>
                      <strong>
                        {ticket.createdAt
                          ? new Date(ticket.createdAt).toLocaleDateString()
                          : "Unavailable"}
                      </strong>
                    </div>
                  </div>

                  <div className="ticket-details-comments">
                    <TicketComments
                      ticketId={ticket._id}
                      token={token}
                    />
                  </div>

                  <div className="ticket-modal-actions">
                    <button
                      type="button"
                      className="cancel-ticket-edit"
                      onClick={closeModal}
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      className="save-ticket-edit"
                      onClick={() => openModal("edit")}
                    >
                      Edit Ticket
                    </button>
                  </div>
                </>
              )}

              {activeModal === "edit" && (
                <form onSubmit={handleUpdate}>
                  <div className="ticket-modal-field">
                    <label htmlFor={`kanban-title-${ticket._id}`}>
                      Ticket Title
                    </label>
                    <input
                      id={`kanban-title-${ticket._id}`}
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      minLength={2}
                      maxLength={100}
                      required
                    />
                  </div>

                  <div className="ticket-modal-field">
                    <label htmlFor={`kanban-description-${ticket._id}`}>
                      Description
                    </label>
                    <textarea
                      id={`kanban-description-${ticket._id}`}
                      value={description}
                      onChange={(event) =>
                        setDescription(event.target.value)
                      }
                      rows={4}
                      maxLength={1000}
                    />
                  </div>

                  <div className="ticket-modal-field">
                    <label htmlFor={`kanban-priority-${ticket._id}`}>
                      Priority
                    </label>
                    <select
                      id={`kanban-priority-${ticket._id}`}
                      value={priority}
                      onChange={(event) => setPriority(event.target.value)}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>

                  <div className="ticket-modal-field">
                    <label htmlFor={`kanban-status-${ticket._id}`}>
                      Status
                    </label>
                    <select
                      id={`kanban-status-${ticket._id}`}
                      value={status}
                      onChange={(event) => setStatus(event.target.value)}
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>

                  <div className="ticket-modal-field">
                    <label htmlFor={`kanban-assignee-${ticket._id}`}>
                      Assign To
                    </label>
                    <select
                      id={`kanban-assignee-${ticket._id}`}
                      value={assignee}
                      onChange={(event) => setAssignee(event.target.value)}
                    >
                      <option value="">Unassigned</option>
                      {teamMembers.map((member) => (
                        <option key={member._id} value={member._id}>
                          {member.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {error && (
                    <p className="ticket-error" role="alert">
                      {error}
                    </p>
                  )}

                  <div className="ticket-modal-actions">
                    <button
                      type="button"
                      className="cancel-ticket-edit"
                      onClick={closeModal}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="save-ticket-edit"
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              )}

              {activeModal === "delete" && (
                <>
                  <p>
                    Are you sure you want to delete{" "}
                    <strong>{ticket.title}</strong>? This action cannot
                    be undone.
                  </p>

                  {error && (
                    <p className="ticket-error" role="alert">
                      {error}
                    </p>
                  )}

                  <div className="ticket-delete-actions">
                    <button
                      type="button"
                      className="cancel-ticket-delete"
                      onClick={closeModal}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="confirm-ticket-delete"
                      onClick={handleDelete}
                      disabled={saving}
                    >
                      {saving ? "Deleting..." : "Confirm Delete"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

export default TicketCardActions;
