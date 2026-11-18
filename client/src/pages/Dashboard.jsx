
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const PROJECTS_API = "http://localhost:5000/api/projects";
const TICKETS_API = "http://localhost:5000/api/tickets";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getWeekDates() {
  const today = new Date();
  const monday = new Date(today);
  const day = monday.getDay();

  monday.setDate(monday.getDate() - (day === 0 ? 6 : day - 1));
  monday.setHours(0, 0, 0, 0);

  return WEEKDAYS.map((_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return date;
  });
}

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatTime(dateString) {
  return new Date(dateString).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Dashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return;

      try {
        setLoading(true);
        setError("");

        const projectResponse = await fetch(PROJECTS_API, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const projectData = await projectResponse.json();

        if (!projectResponse.ok) {
          throw new Error(
            projectData.message || "Unable to load projects."
          );
        }

        const projectList = projectData.projects || [];
        setProjects(projectList);

        const ticketResponses = await Promise.all(
          projectList.map(async (project) => {
            const response = await fetch(
              `${TICKETS_API}/project/${project._id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            const data = await response.json();

            if (!response.ok) {
              throw new Error(
                data.message ||
                  `Unable to load tickets for ${project.title}.`
              );
            }

            return data.tickets || [];
          })
        );

        setTickets(ticketResponses.flat());
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  const statistics = useMemo(() => {
    const total = tickets.length;

    const todo = tickets.filter(
      (ticket) => ticket.status === "To Do"
    ).length;

    const inProgress = tickets.filter(
      (ticket) => ticket.status === "In Progress"
    ).length;

    const completed = tickets.filter(
      (ticket) => ticket.status === "Done"
    ).length;

    return {
      total,
      todo,
      inProgress,
      completed,
      completion: total
        ? Math.round((completed / total) * 100)
        : 0,
    };
  }, [tickets]);

  const weekDates = useMemo(() => getWeekDates(), []);

  const today = new Date();

  const weeklyTickets = useMemo(() => {
    const grouped = {};

    weekDates.forEach((date) => {
      grouped[dateKey(date)] = [];
    });

    tickets.forEach((ticket) => {
      if (!ticket.createdAt) return;

      const key = dateKey(new Date(ticket.createdAt));

      if (grouped[key]) {
        grouped[key].push(ticket);
      }
    });

    return grouped;
  }, [tickets, weekDates]);

  const recentTickets = useMemo(
    () =>
      [...tickets]
        .sort(
          (a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
        )
        .slice(0, 5),
    [tickets]
  );

  const recentProjects = useMemo(
    () =>
      [...projects]
        .sort(
          (a, b) =>
            new Date(b.updatedAt || b.createdAt) -
            new Date(a.updatedAt || a.createdAt)
        )
        .slice(0, 4),
    [projects]
  );

  const priorityCounts = useMemo(
    () => ({
      high: tickets.filter(
        (ticket) => ticket.priority === "High"
      ).length,
      medium: tickets.filter(
        (ticket) => ticket.priority === "Medium"
      ).length,
      low: tickets.filter(
        (ticket) => ticket.priority === "Low"
      ).length,
    }),
    [tickets]
  );

  const greeting =
    today.getHours() < 12
      ? "Good morning"
      : today.getHours() < 17
        ? "Good afternoon"
        : "Good evening";

  const monthLabel = new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(today);

  const initials = (name) =>
    (name || "U")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("");

  const getTicketStatusClass = (status) => {
    if (status === "Done") return "done";
    if (status === "In Progress") return "progress";
    return "todo";
  };

  return (
    <div className="overview-page dashboard-redesign">
      {/* Welcome header */}
      <section className="dashboard-welcome">
        <div>
          <span className="dashboard-eyebrow">
            FIXORA WORKSPACE
          </span>

          <h2>
            {greeting}, {user?.name?.split(" ")[0] || "there"}!
            <span className="dashboard-wave"> 👋</span>
          </h2>

          <p>
            Here's what's happening with your projects today.
          </p>
        </div>

        <div className="dashboard-welcome-actions">
          <span className="dashboard-date">
            {today.toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </span>

          <button
            type="button"
            className="dashboard-primary-button"
            onClick={() => navigate("/app/projects")}
          >
            + Create Project
          </button>
        </div>
      </section>

      {error && (
        <div className="dashboard-error" role="alert">
          {error}
        </div>
      )}

      {/* Statistics */}
      <section className="dashboard-stat-grid">
        <article className="dashboard-stat-card stat-projects">
          <div className="dashboard-stat-top">
            <span>PROJECTS</span>
            <span className="dashboard-stat-icon">▣</span>
          </div>
          <h3>{loading ? "—" : projects.length}</h3>
          <p>Workspace projects</p>
        </article>

        <article className="dashboard-stat-card stat-tickets">
          <div className="dashboard-stat-top">
            <span>TOTAL TICKETS</span>
            <span className="dashboard-stat-icon">▤</span>
          </div>
          <h3>{loading ? "—" : statistics.total}</h3>
          <p>Across all projects</p>
        </article>

        <article className="dashboard-stat-card stat-progress">
          <div className="dashboard-stat-top">
            <span>IN PROGRESS</span>
            <span className="dashboard-stat-icon">◷</span>
          </div>
          <h3>{loading ? "—" : statistics.inProgress}</h3>
          <p>Currently being worked on</p>
        </article>

        <article className="dashboard-stat-card stat-completed">
          <div className="dashboard-stat-top">
            <span>COMPLETED</span>
            <span className="dashboard-stat-icon">✓</span>
          </div>
          <h3>{loading ? "—" : statistics.completed}</h3>
          <p>Successfully completed</p>
        </article>
      </section>

      {/* Analytics */}
      <section className="dashboard-analytics-grid">
        <article className="dashboard-panel dashboard-project-analytics">
          <div className="dashboard-panel-heading">
            <div>
              <span className="dashboard-panel-eyebrow">
                WORKSPACE PERFORMANCE
              </span>
              <h3>Project Analytics</h3>
              <p>Overview of your current workspace.</p>
            </div>
            <span className="dashboard-panel-icon">↗</span>
          </div>

          <div className="dashboard-analytics-content">
            <div className="dashboard-completion">
              <div className="dashboard-completion-number">
                {loading ? "—" : `${statistics.completion}%`}
              </div>
              <span>Ticket completion rate</span>
            </div>

            <div className="dashboard-progress-track">
              <div
                className="dashboard-progress-fill"
                style={{
                  width: `${loading ? 0 : statistics.completion}%`,
                }}
              />
            </div>

            <div className="dashboard-progress-legend">
              <span>
                <i className="legend-dot legend-done" />
                Completed ({statistics.completed})
              </span>
              <span>
                <i className="legend-dot legend-progress" />
                In Progress ({statistics.inProgress})
              </span>
              <span>
                <i className="legend-dot legend-todo" />
                To Do ({statistics.todo})
              </span>
            </div>
          </div>
        </article>

        <article className="dashboard-panel dashboard-priority-panel">
          <div className="dashboard-panel-heading">
            <div>
              <span className="dashboard-panel-eyebrow">
                TASK OVERVIEW
              </span>
              <h3>Task Distribution</h3>
              <p>Tickets by priority.</p>
            </div>
          </div>

          <div className="dashboard-priority-content">
            <div
              className="dashboard-priority-donut"
              style={{
                background: statistics.total
                  ? `conic-gradient(
                      #a78bfa 0% ${(priorityCounts.high / statistics.total) * 100}%,
                      #65a9e8 ${(priorityCounts.high / statistics.total) * 100}% ${((priorityCounts.high + priorityCounts.medium) / statistics.total) * 100}%,
                      #53c6a1 ${((priorityCounts.high + priorityCounts.medium) / statistics.total) * 100}% 100%
                    )`
                  : "#575272",
              }}
            >
              <div>
                <strong>{loading ? "—" : statistics.total}</strong>
                <span>Total tickets</span>
              </div>
            </div>

            <div className="dashboard-priority-legend">
              <span>
                <i className="legend-dot legend-high" />
                High <strong>{priorityCounts.high}</strong>
              </span>
              <span>
                <i className="legend-dot legend-medium" />
                Medium <strong>{priorityCounts.medium}</strong>
              </span>
              <span>
                <i className="legend-dot legend-low" />
                Low <strong>{priorityCounts.low}</strong>
              </span>
            </div>
          </div>
        </article>
      </section>

      {/* Calendar and activity */}
      <section className="dashboard-bottom-grid">
        <article className="dashboard-panel dashboard-calendar-panel">
          <div className="dashboard-panel-heading">
            <div>
              <span className="dashboard-panel-eyebrow">
                WEEKLY OVERVIEW
              </span>
              <h3>Ticket Activity</h3>
              <p>Tickets created during this week.</p>
            </div>

            <span className="dashboard-calendar-month">
              {monthLabel}
            </span>
          </div>

          {/* Three-period weekly calendar */}
          <div className="dashboard-calendar-scroll">
            <div className="dashboard-calendar">
              <div className="dashboard-calendar-time-heading">
                TIME
              </div>

              {weekDates.map((date, index) => (
                <div
                  className={`dashboard-calendar-day-heading ${
                    dateKey(date) === dateKey(today)
                      ? "calendar-today"
                      : ""
                  }`}
                  key={dateKey(date)}
                >
                  <span>{WEEKDAYS[index]}</span>
                  <strong>{date.getDate()}</strong>
                </div>
              ))}

              {[
                { label: "Morning", start: 0, end: 12 },
                { label: "Afternoon", start: 12, end: 18 },
                { label: "Evening", start: 18, end: 24 },
              ].map((period) => (
                <div className="dashboard-calendar-row" key={period.label}>
                  <div className="dashboard-calendar-time">
                    {period.label}
                  </div>

                  {weekDates.map((date) => {
                    const dayTickets =
                      weeklyTickets[dateKey(date)] || [];

                    const periodTickets = dayTickets.filter((ticket) => {
                      const hour = new Date(ticket.createdAt).getHours();
                      return hour >= period.start && hour < period.end;
                    });

                    return (
                      <div
                        className="dashboard-calendar-cell"
                        key={`${dateKey(date)}-${period.label}`}
                      >
                        {periodTickets.slice(0, 2).map((ticket) => (
                          <div
                            className={`dashboard-calendar-event event-${getTicketStatusClass(
                              ticket.status
                            )}`}
                            key={ticket._id}
                            title={ticket.title}
                          >
                            <strong>{ticket.title}</strong>
                            <span>{formatTime(ticket.createdAt)}</span>
                          </div>
                        ))}

                        {periodTickets.length > 2 && (
                          <span className="dashboard-calendar-more">
                            +{periodTickets.length - 2} more
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {!loading && tickets.length === 0 && (
            <p className="dashboard-calendar-empty">
              No ticket activity to display yet.
            </p>
          )}

          <div className="dashboard-calendar-footer">
            <span>
              <i className="legend-dot legend-todo" /> To Do
            </span>
            <span>
              <i className="legend-dot legend-progress" /> In Progress
            </span>
            <span>
              <i className="legend-dot legend-done" /> Done
            </span>
          </div>
        </article>

        {/* Recent activity */}
        <article className="dashboard-panel dashboard-activity-panel">
          <div className="dashboard-panel-heading">
            <div>
              <span className="dashboard-panel-eyebrow">
                LATEST UPDATES
              </span>
              <h3>Recent Activity</h3>
              <p>Recently created tickets.</p>
            </div>
          </div>

          {loading ? (
            <p className="dashboard-empty">Loading activity...</p>
          ) : recentTickets.length === 0 ? (
            <p className="dashboard-empty">
              No recent ticket activity.
            </p>
          ) : (
            <div className="dashboard-activity-list">
              {recentTickets.map((ticket) => (
                <div
                  className="dashboard-activity-item"
                  key={ticket._id}
                >
                  <div className="dashboard-activity-avatar">
                    {initials(ticket.assignee?.name || "U")}
                  </div>

                  <div className="dashboard-activity-info">
                    <strong>{ticket.title}</strong>
                    <span>
                      {ticket.projectId?.title || "Project"}
                    </span>
                    <small>
                      {new Date(ticket.createdAt).toLocaleString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </small>
                  </div>

                  <span
                    className={`dashboard-activity-status ${
                      ticket.status === "Done"
                        ? "status-done"
                        : ticket.status === "In Progress"
                          ? "status-progress"
                          : "status-todo"
                    }`}
                  >
                    {ticket.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            className="dashboard-view-all"
            onClick={() => navigate("/app/tickets")}
          >
            View all tickets <span>→</span>
          </button>
        </article>
      </section>

      {/* Recent projects */}
      <section className="dashboard-panel dashboard-recent-projects">
        <div className="dashboard-panel-heading">
          <div>
            <span className="dashboard-panel-eyebrow">
              YOUR WORKSPACE
            </span>
            <h3>Recent Projects</h3>
            <p>Your latest projects and team information.</p>
          </div>

          <button
            type="button"
            className="dashboard-view-all"
            onClick={() => navigate("/app/projects")}
          >
            View all projects <span>→</span>
          </button>
        </div>

        {loading ? (
          <p className="dashboard-empty">Loading projects...</p>
        ) : recentProjects.length === 0 ? (
          <p className="dashboard-empty">
            No projects yet. Create your first project.
          </p>
        ) : (
          <div className="dashboard-project-list">
            {recentProjects.map((project) => (
              <article
                className="dashboard-project-item"
                key={project._id}
              >
                <div className="dashboard-project-avatar">
                  {project.title?.charAt(0)?.toUpperCase() || "P"}
                </div>

                <div className="dashboard-project-info">
                  <strong>{project.title}</strong>
                  <span>
                    {project.description ||
                      "No project description provided."}
                  </span>
                </div>

                <div className="dashboard-project-meta">
                  <span>
                    {project.teamMembers?.length || 0} members
                  </span>
                  <span>
                    {
                      tickets.filter(
                        (ticket) =>
                          String(
                            ticket.projectId?._id || ticket.projectId
                          ) === String(project._id)
                      ).length
                    }{" "}
                    tickets
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
