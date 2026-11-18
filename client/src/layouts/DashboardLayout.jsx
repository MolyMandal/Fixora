
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function DashboardLayout() {
  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <div className="dashboard-page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;
