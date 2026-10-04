import {
  useCallback,
  useMemo,
  useState,
} from "react";

import TaskContext from "./taskContext.js";

import {
  generateTaskId,
  getTasks,
  saveTasks,
} from "../services/taskService.js";

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState(() =>
    getTasks(),
  );

  const createTask = useCallback((payload) => {
    const currentTasks = getTasks();

    const now = new Date().toISOString();

    const createdTask = {
      id: generateTaskId(currentTasks),

      projectId: payload.projectId,

      title: payload.title.trim(),

      description:
        payload.description?.trim() ?? "",

      assignedVolunteerId:
        payload.assignedVolunteerId || null,

      status: payload.status ?? "Not Started",

      priority: payload.priority ?? "Medium",

      dueDate: payload.dueDate || "",

      createdAt: now,
      updatedAt: now,
    };

    const updatedTasks = [
      createdTask,
      ...currentTasks,
    ];

    saveTasks(updatedTasks);
    setTasks(updatedTasks);

    return createdTask;
  }, []);

  const updateTask = useCallback(
    (taskId, updates) => {
      const currentTasks = getTasks();

      const existingTask =
        currentTasks.find(
          (task) => task.id === taskId,
        );

      if (!existingTask) {
        return null;
      }

      const updatedAt =
        new Date().toISOString();

      const updatedTask = {
        ...existingTask,
        ...updates,

        title:
          updates.title !== undefined
            ? updates.title.trim()
            : existingTask.title,

        description:
          updates.description !== undefined
            ? updates.description.trim()
            : existingTask.description,

        updatedAt,
      };

      const updatedTasks =
        currentTasks.map((task) =>
          task.id === taskId
            ? updatedTask
            : task,
        );

      saveTasks(updatedTasks);
      setTasks(updatedTasks);

      return updatedTask;
    },
    [],
  );

  const assignVolunteer = useCallback(
    (taskId, volunteerId) =>
      updateTask(taskId, {
        assignedVolunteerId:
          volunteerId || null,
      }),
    [updateTask],
  );

  const updateTaskStatus = useCallback(
    (taskId, status) =>
      updateTask(taskId, { status }),
    [updateTask],
  );

  const getTaskById = useCallback(
    (taskId) =>
      tasks.find(
        (task) => task.id === taskId,
      ) ?? null,
    [tasks],
  );

  const getTasksByProject = useCallback(
    (projectId) =>
      tasks.filter(
        (task) => task.projectId === projectId,
      ),
    [tasks],
  );

  const getTasksByVolunteer = useCallback(
    (volunteerId) =>
      tasks.filter(
        (task) =>
          task.assignedVolunteerId === volunteerId,
      ),
    [tasks],
  );

  const value = useMemo(
    () => ({
      tasks,
      createTask,
      updateTask,
      assignVolunteer,
      updateTaskStatus,
      getTaskById,
      getTasksByProject,
      getTasksByVolunteer,
    }),
    [
      tasks,
      createTask,
      updateTask,
      assignVolunteer,
      updateTaskStatus,
      getTaskById,
      getTasksByProject,
      getTasksByVolunteer,
    ],
  );

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
}


