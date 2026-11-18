import { useCallback, useEffect, useState } from "react";

function TicketComments({ ticketId, token }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchComments = useCallback(async () => {
    try {
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/tickets/${ticketId}/comments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load comments");
      }

      setComments(data.comments || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [ticketId, token]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!text.trim() || submitting) return;

    try {
      setSubmitting(true);
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/tickets/${ticketId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            text: text.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to add comment");
      }

      setText("");
      await fetchComments();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="ticket-comments"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <h6 className="ticket-comments-heading">
        Comments ({comments.length})
      </h6>

      <form onSubmit={handleAddComment} className="comment-form">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment..."
          maxLength={1000}
          rows={2}
          disabled={submitting}
        />

        <div className="comment-form-footer">
          <span>{text.length}/1000</span>

          <button
            type="submit"
            disabled={!text.trim() || submitting}
          >
            {submitting ? "Adding..." : "Add Comment"}
          </button>
        </div>
      </form>

      {error && (
        <p className="comment-error" role="alert">
          {error}
        </p>
      )}

      <div className="comment-history">
        {loading ? (
          <p className="comment-muted">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="comment-muted">No comments yet.</p>
        ) : (
          comments.map((comment) => (
            <div className="comment-item" key={comment._id}>
              <div className="comment-item-header">
                <strong>
                  {comment.userId?.name || "Unknown User"}
                </strong>

                <span>
                  {comment.timestamp
                    ? new Date(comment.timestamp).toLocaleString()
                    : "Date unavailable"}
                </span>
              </div>

              <p>{comment.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TicketComments;