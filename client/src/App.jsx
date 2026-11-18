
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { useAuth } from "./context/AuthContext";

import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Tickets from "./pages/Tickets";
import Kanban from "./pages/Kanban";
import Profile from "./pages/Profile";

import DashboardLayout from "./layouts/DashboardLayout";

import "./App.css";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/app" replace />
            ) : (
              <AuthPage />
            )
          }
        />

        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="tickets" element={<Tickets />} />
          <Route path="kanban" element={<Kanban />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route
          path="*"
          element={
            <Navigate
              to={isAuthenticated ? "/app" : "/"}
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
