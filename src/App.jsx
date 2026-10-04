import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import RoleGuard from "./components/auth/RoleGuard.jsx";

import CoordinatorLayout from "./layouts/CoordinatorLayout.jsx";

import Login from "./pages/auth/Login.jsx";
import Signup from "./pages/auth/Signup.jsx";

import CoordinatorDashboard from "./pages/coordinator/CoordinatorDashboard.jsx";
import Projects from "./pages/coordinator/Projects.jsx";
import CreateProject from "./pages/coordinator/CreateProject.jsx";
import ProjectDetails from "./pages/coordinator/ProjectDetails.jsx";
import EditProject from "./pages/coordinator/EditProject.jsx";
import Volunteers from "./pages/coordinator/Volunteers.jsx";
import Tasks from "./pages/coordinator/Tasks.jsx";
import CreateTask from "./pages/coordinator/CreateTask.jsx";
import TaskDetails from "./pages/coordinator/TaskDetails.jsx";
import Attendance from "./pages/coordinator/Attendance.jsx";
import Reports from "./pages/coordinator/Reports.jsx";
import Settings from "./pages/coordinator/Settings.jsx";
import VolunteerProfile from "./pages/coordinator/VolunteerProfile.jsx";
import VolunteerDashboard from "./pages/volunteer/VolunteerDashboard.jsx";
import NgoDashboard from "./pages/ngo/NgoDashboard.jsx";

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route element={<ProtectedRoute />}>
        {/* Coordinator */}
        <Route
          element={
            <RoleGuard
              allowedRoles={["coordinator"]}
            />
          }
        >
          <Route
            path="/coordinator"
            element={<CoordinatorLayout />}
          >
            <Route
              index
              element={
                <Navigate
                  to="dashboard"
                  replace
                />
              }
            />

            <Route
              path="dashboard"
              element={<CoordinatorDashboard />}
            />

            <Route
              path="projects"
              element={<Projects />}
            />

            <Route
              path="projects/new"
              element={<CreateProject />}
            />

            <Route
              path="projects/:projectId/edit"
              element={<EditProject />}
            />

            <Route
              path="projects/:projectId"
              element={<ProjectDetails />}
            />

            <Route
              path="volunteers"
              element={<Volunteers />}
            />

            <Route
              path="volunteers/:volunteerId"
              element={<VolunteerProfile />}
            />

            <Route
              path="tasks"
              element={<Tasks />}
            />

            <Route
              path="tasks/new"
              element={<CreateTask />}
            />

            <Route
              path="tasks/:taskId"
              element={<TaskDetails />}
            />

            <Route
              path="attendance"
              element={<Attendance />}
            />

            <Route
              path="reports"
              element={<Reports />}
            />

            <Route
              path="settings"
              element={<Settings />}
            />

          </Route>
        </Route>

        {/* Volunteer */}
        <Route
          element={
            <RoleGuard
              allowedRoles={["volunteer"]}
            />
          }
        >
          <Route
            path="/volunteer/dashboard"
            element={<VolunteerDashboard />}
          />
        </Route>

        {/* NGO */}
        <Route
          element={
            <RoleGuard
              allowedRoles={["ngo"]}
            />
          }
        >
          <Route
            path="/ngo/dashboard"
            element={<NgoDashboard />}
          />
        </Route>
      </Route>

      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />
    </Routes>
  );
}


