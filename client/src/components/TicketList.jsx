
import { useState } from "react";
import { createPortal } from "react-dom";
import TicketComments from "./TicketComments";

function TicketList({
  tickets,
  loading,
  token,
  onRefresh,
  teamMembers = [],
}) {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [detailsTicket, setDetailsTicket] = useState(null);
  const [ticketToDelete, setTicketToDelete] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [status, setStatus] = useState("To Do");
  const [assignee, setAssignee] = useState("");

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const openEditModal = (ticket) => {
    setSelectedTicket(ticket);
    setTitle(ticket.title || "");
    setDescription(ticket.description || "");
    setPriority(ticket.priority || "Medium");
    setStatus(ticket.status || "To Do");
    setAssignee(ticket.assignee?._id || "");
    setError("");
  };

  const closeEditModal = () => {
    if (saving) return;
    setSelectedTicket(null);
    setError("");
  };

  const handleUpdateTicket = async (event) => {
    event.preventDefault();

    if (!title.trim() || title.trim().length < 2) {
      setError("Ticket title must be at least 2 characters.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/tickets/${selectedTicket._id}`,
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

      setSelectedTicket(null);
      await onRefresh?.();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const openDeleteConfirmation = (ticket) => {
    setTicketToDelete(ticket);
    setDeleteError("");
  };

  const closeDeleteConfirmation = () => {
    if (deleting) return;
    setTicketToDelete(null);
    setDeleteError("");
  };

  const handleDeleteTicket = async () => {
    if (!ticketToDelete || deleting) return;

    try {
      setDeleting(true);
      setDeleteError("");

      const response = await fetch(
        `http://localhost:5000/api/tickets/${ticketToDelete._id}`,
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

      setTicketToDelete(null);
      setDetailsTicket(null);
      await onRefresh?.();
    } catch (err) {
      setDeleteError(err.message || "Something went wrong.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <p className="ticket-loading">Loading tickets...</p>;
  }

  if (!tickets || tickets.length === 0) {
    return (
      <div className="empty-tickets">
        <div className="empty-tickets-icon">◇</div>
        <h3>No tickets found</h3>
        <p>Create a ticket or adjust your search filters.</p>
      </div>
    );
  }

  return (
    <>
      <div className="ticket-table-wrapper">
        <table className="professional-ticket-table">
          <thead>
            <tr>
              <th>Ticket</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Assignee</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket._id}>
                <td>
                  <div className="table-ticket-title">
                    <strong>{ticket.title}</strong>
                    <span>
                      {ticket.description || "No description provided."}
                    </span>
                  </div>
                </td>

                <td>
                  <span
                    className={`ticket-priority priority-${ticket.priority?.toLowerCase()}`}
                  >
                    {ticket.priority}
                  </span>
                </td>

                <td>
                  <span
                    className={`ticket-status status-${ticket.status
                      ?.toLowerCase()
                      .replace(/\s+/g, "-")}`}
                  >
                    {ticket.status}
                  </span>
                </td>

                <td>
                  <span className="table-assignee">
                    {ticket.assignee?.name || "Unassigned"}
                  </span>
                </td>

                <td>
                  <span className="table-date">
                    {ticket.createdAt
                      ? new Date(ticket.createdAt).toLocaleDateString()
                      : "Unavailable"}
                  </span>
                </td>

                <td>
                  <div className="table-ticket-actions">
                    <button
                      type="button"
                      className="ticket-view-button"
                      onClick={() => setDetailsTicket(ticket)}
                    >
                      View
                    </button>

                    <button
                      type="button"
                      className="ticket-edit-action"
                      onClick={() => openEditModal(ticket)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="ticket-delete-action"
                      onClick={() => openDeleteConfirmation(ticket)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Ticket details and comments */}
      {detailsTicket &&
        createPortal(
          <div
            className="ticket-modal-overlay"
            onClick={() => setDetailsTicket(null)}
          >
            <div
              className="ticket-details-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="ticket-details-heading"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="ticket-modal-header">
                <div>
                  <span className="page-eyebrow">TICKET DETAILS</span>
                  <h3 id="ticket-details-heading">
                    {detailsTicket.title}
                  </h3>
                </div>

                <button
                  type="button"
                  className="ticket-modal-close"
                  onClick={() => setDetailsTicket(null)}
                  aria-label="Close ticket details"
                >
                  &times;
                </button>
              </div>

              <p className="ticket-details-description">
                {detailsTicket.description || "No description provided."}
              </p>

              <div className="ticket-details-metadata">
                <div>
                  <span>Priority</span>
                  <strong>{detailsTicket.priority}</strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong>{detailsTicket.status}</strong>
                </div>

                <div>
                  <span>Assignee</span>
                  <strong>
                    {detailsTicket.assignee?.name || "Unassigned"}
                  </strong>
                </div>

                <div>
                  <span>Created</span>
                  <strong>
                    {detailsTicket.createdAt
                      ? new Date(detailsTicket.createdAt).toLocaleDateString()
                      : "Unavailable"}
                  </strong>
                </div>
              </div>

              <div className="ticket-details-comments">
                <TicketComments
                  ticketId={detailsTicket._id}
                  token={token}
                />
              </div>

              <div className="ticket-modal-actions">
                <button
                  type="button"
                  className="cancel-ticket-edit"
                  onClick={() => setDetailsTicket(null)}
                >
                  Close
                </button>

                <button
                  type="button"
                  className="save-ticket-edit"
                  onClick={() => {
                    const ticket = detailsTicket;
                    setDetailsTicket(null);
                    openEditModal(ticket);
                  }}
                >
                  Edit Ticket
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Edit ticket modal */}
      {selectedTicket &&
        createPortal(
          <div
            className="ticket-modal-overlay"
            onClick={closeEditModal}
          >
            <div
              className="ticket-edit-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-ticket-heading"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="ticket-modal-header">
                <h3 id="edit-ticket-heading">Edit Ticket</h3>

                <button
                  type="button"
                  className="ticket-modal-close"
                  onClick={closeEditModal}
                  disabled={saving}
                  aria-label="Close edit modal"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleUpdateTicket}>
                <div className="ticket-modal-field">
                  <label htmlFor="edit-ticket-title">Ticket Title</label>
                  <input
                    id="edit-ticket-title"
                    type="text"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    minLength={2}
                    maxLength={100}
                    required
                  />
                </div>

                <div className="ticket-modal-field">
                  <label htmlFor="edit-ticket-description">
                    Description
                  </label>
                  <textarea
                    id="edit-ticket-description"
                    value={description}
                    onChange={(event) =>
                      setDescription(event.target.value)
                    }
                    maxLength={1000}
                    rows={4}
                  />
                </div>

                <div className="ticket-modal-field">
                  <label htmlFor="edit-ticket-priority">Priority</label>
                  <select
                    id="edit-ticket-priority"
                    value={priority}
                    onChange={(event) => setPriority(event.target.value)}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div className="ticket-modal-field">
                  <label htmlFor="edit-ticket-status">Status</label>
                  <select
                    id="edit-ticket-status"
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>

                <div className="ticket-modal-field">
                  <label htmlFor="edit-ticket-assignee">Assign To</label>
                  <select
                    id="edit-ticket-assignee"
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
                    onClick={closeEditModal}
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
            </div>
          </div>,
          document.body
        )}

      {/* Delete confirmation modal */}
      {ticketToDelete &&
        createPortal(
          <div
            className="ticket-modal-overlay"
            onClick={closeDeleteConfirmation}
          >
            <div
              className="ticket-delete-modal"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="delete-ticket-heading"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="delete-modal-icon">!</div>

              <h3 id="delete-ticket-heading">Delete Ticket?</h3>

              <p>
                Are you sure you want to delete{" "}
                <strong>{ticketToDelete.title}</strong>?
                This action cannot be undone.
              </p>

              {deleteError && (
                <p className="ticket-error" role="alert">
                  {deleteError}
                </p>
              )}

              <div className="ticket-delete-actions">
                <button
                  type="button"
                  className="cancel-ticket-delete"
                  onClick={closeDeleteConfirmation}
                  disabled={deleting}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="confirm-ticket-delete"
                  onClick={handleDeleteTicket}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Confirm Delete"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

export default TicketList;
