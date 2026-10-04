import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.jsx";

import VolunteerIdentityBridge from "./components/auth/VolunteerIdentityBridge.jsx";

import { AuthProvider } from "./context/AuthContext.jsx";
import { ProjectProvider } from "./context/ProjectContext.jsx";
import { VolunteerProvider } from "./context/VolunteerContext.jsx";
import { TaskProvider } from "./context/TaskContext.jsx";
import { AttendanceProvider } from "./context/AttendanceContext.jsx";

import "./styles/global.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ProjectProvider>
          <VolunteerProvider>
            <VolunteerIdentityBridge />

            <TaskProvider>
              <AttendanceProvider>
                <App />
              </AttendanceProvider>
            </TaskProvider>
          </VolunteerProvider>
        </ProjectProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
