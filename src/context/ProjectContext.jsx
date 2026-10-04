import {
  useCallback,
  useMemo,
  useState,
} from "react";

import ProjectContext from "./projectContext.js";

import {
  generateProjectId,
  getProjects,
  saveProjects,
} from "../services/projectService.js";

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState(() =>
    getProjects(),
  );

  const createProject = useCallback((payload) => {
    let createdProject = null;

    setProjects((currentProjects) => {
      createdProject = {
        id: generateProjectId(currentProjects),

        name: payload.name.trim(),
        description: payload.description.trim(),
        location: payload.location.trim(),

        status: payload.status,

        progress: 0,
        volunteers: 0,
        tasks: 0,
        completedTasks: 0,

        startDate: payload.startDate,
        endDate: payload.endDate,

        coordinator: payload.coordinator,

        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedProjects = [
        createdProject,
        ...currentProjects,
      ];

      saveProjects(updatedProjects);

      return updatedProjects;
    });

    return createdProject;
  }, []);

  const updateProject = useCallback(
    (projectId, updates) => {
      let updatedProject = null;

      setProjects((currentProjects) => {
        const projectExists = currentProjects.some(
          (project) => project.id === projectId,
        );

        if (!projectExists) {
          return currentProjects;
        }

        const updatedProjects = currentProjects.map(
          (project) => {
            if (project.id !== projectId) {
              return project;
            }

            updatedProject = {
              ...project,
              ...updates,

              name:
                updates.name !== undefined
                  ? updates.name.trim()
                  : project.name,

              description:
                updates.description !== undefined
                  ? updates.description.trim()
                  : project.description,

              location:
                updates.location !== undefined
                  ? updates.location.trim()
                  : project.location,

              updatedAt: new Date().toISOString(),
            };

            return updatedProject;
          },
        );

        saveProjects(updatedProjects);

        return updatedProjects;
      });

      return updatedProject;
    },
    [],
  );

  const updateProjectStatus = useCallback(
    (projectId, status) => {
      let updatedProject = null;

      setProjects((currentProjects) => {
        const updatedProjects = currentProjects.map(
          (project) => {
            if (project.id !== projectId) {
              return project;
            }

            updatedProject = {
              ...project,
              status,
              updatedAt: new Date().toISOString(),
            };

            return updatedProject;
          },
        );

        saveProjects(updatedProjects);

        return updatedProjects;
      });

      return updatedProject;
    },
    [],
  );

  const getProjectById = useCallback(
    (projectId) =>
      projects.find(
        (project) => project.id === projectId,
      ) ?? null,
    [projects],
  );

  const value = useMemo(
    () => ({
      projects,
      createProject,
      updateProject,
      updateProjectStatus,
      getProjectById,
    }),
    [
      projects,
      createProject,
      updateProject,
      updateProjectStatus,
      getProjectById,
    ],
  );

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}
