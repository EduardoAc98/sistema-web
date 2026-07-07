import { Project, Task, User, Log } from "./types";

// Base API URI
const API_BASE = "/api";

// JWT and User persistence
export function getSavedToken(): string | null {
  return localStorage.getItem("gmp_jwt_token");
}

export function saveToken(token: string) {
  localStorage.setItem("gmp_jwt_token", token);
}

export function getSavedUser(): User | null {
  const saved = localStorage.getItem("gmp_logged_user");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  }
  return null;
}

export function saveUser(user: User | null) {
  if (user) {
    localStorage.setItem("gmp_logged_user", JSON.stringify(user));
  } else {
    localStorage.removeItem("gmp_logged_user");
    localStorage.removeItem("gmp_jwt_token");
  }
}

// Global HTTP Call utilities
async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errText = await response.text();
    let parsedErr = errText;
    try {
      parsedErr = JSON.parse(errText).error || errText;
    } catch { /* ignore */ }
    throw new Error(parsedErr || `Call failed with status ${response.status}`);
  }

  return response.json();
}

// API Methods
export const api = {
  // Auth
  login: async (username: string, password: string): Promise<{ token: string; user: User }> => {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password })
    });
    saveToken(data.token);
    saveUser(data.user);
    return data;
  },

  logout: () => {
    saveUser(null);
  },

  // Users Management
  getUsers: async (): Promise<User[]> => {
    return apiFetch("/users");
  },

  createUser: async (user: Omit<User, "id" | "status" | "lastConnection" | "avatarInitials" | "avatarBg">): Promise<User> => {
    return apiFetch("/users", {
      method: "POST",
      body: JSON.stringify(user)
    });
  },

  updateUser: async (id: string, fields: Partial<User>): Promise<User> => {
    return apiFetch(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(fields)
    });
  },

  deleteUser: async (id: string): Promise<{ message: string }> => {
    return apiFetch(`/users/${id}`, {
      method: "DELETE"
    });
  },

  getDisciplines: async (): Promise<string[]> => {
    return apiFetch("/disciplines");
  },

  // Projects Management
  getProjects: async (): Promise<Project[]> => {
    return apiFetch("/projects");
  },

  getProject: async (id: string): Promise<Project> => {
    return apiFetch(`/projects/${id}`);
  },

  createProject: async (project: Omit<Project, "id" | "progress">): Promise<Project> => {
    return apiFetch("/projects", {
      method: "POST",
      body: JSON.stringify(project)
    });
  },

  updateProject: async (id: string, fields: Partial<Project>): Promise<Project> => {
    return apiFetch(`/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(fields)
    });
  },

  deleteProject: async (id: string): Promise<{ message: string }> => {
    return apiFetch(`/projects/${id}`, {
      method: "DELETE"
    });
  },

  // Task Management
  getTasks: async (projectId: string): Promise<Task[]> => {
    return apiFetch(`/projects/${projectId}/tasks`);
  },

  createTask: async (projectId: string, task: Omit<Task, "id" | "status" | "projectId">): Promise<Task> => {
    return apiFetch(`/projects/${projectId}/tasks`, {
      method: "POST",
      body: JSON.stringify(task)
    });
  },

  updateTaskStatus: async (taskId: string, status: Task["status"]): Promise<Task> => {
    return apiFetch(`/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify({ status })
    });
  },

  updateTask: async (taskId: string, fields: Partial<Task>): Promise<Task> => {
    return apiFetch(`/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(fields)
    });
  },

  deleteTask: async (taskId: string): Promise<{ message: string }> => {
    return apiFetch(`/tasks/${taskId}`, {
      method: "DELETE"
    });
  },

  // Deliverables Management
  getDeliverables: async (projectId: string): Promise<any[]> => {
    return apiFetch(`/projects/${projectId}/deliverables`);
  },

  createDeliverable: async (projectId: string, payload: { name: string; uploadedBy: string; lod: string }): Promise<any> => {
    return apiFetch(`/projects/${projectId}/deliverables`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  reviewDeliverable: async (id: string, status: "APROBADO" | "RECHAZADO"): Promise<any> => {
    return apiFetch(`/deliverables/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status })
    });
  },

  // Files Management (BIM Document Management)
  getFiles: async (projectId: string): Promise<any[]> => {
    return apiFetch(`/projects/${projectId}/files`);
  },

  uploadFile: async (projectId: string, name: string, size: string, base64Data?: string, uploadedBy?: string, uploadedByUserId?: string): Promise<any> => {
    return apiFetch(`/projects/${projectId}/files`, {
      method: "POST",
      body: JSON.stringify({ name, size, data: base64Data, uploadedBy, uploadedByUserId })
    });
  },

  // Comments Management
  getComments: async (targetId: string): Promise<any[]> => {
    return apiFetch(`/comments?targetId=${targetId}`);
  },

  createComment: async (targetId: string, author: string, text: string): Promise<any> => {
    return apiFetch("/comments", {
      method: "POST",
      body: JSON.stringify({ targetId, author, text })
    });
  },

  updateComment: async (id: string, text: string): Promise<any> => {
    return apiFetch(`/comments/${id}`, {
      method: "PUT",
      body: JSON.stringify({ text })
    });
  },

  deleteComment: async (id: string): Promise<any> => {
    return apiFetch(`/comments/${id}`, {
      method: "DELETE"
    });
  },

  deleteFile: async (id: string): Promise<any> => {
    return apiFetch(`/files/${id}`, {
      method: "DELETE"
    });
  },

  deleteDeliverable: async (id: string): Promise<any> => {
    return apiFetch(`/deliverables/${id}`, {
      method: "DELETE"
    });
  },

  updateDeliverable: async (id: string, fields: any): Promise<any> => {
    return apiFetch(`/deliverables/${id}`, {
      method: "PUT",
      body: JSON.stringify(fields)
    });
  },

  createLog: async (user: string, action: string, detail?: string, type?: string): Promise<any> => {
    return apiFetch("/logs", {
      method: "POST",
      body: JSON.stringify({ user, action, detail, type })
    });
  },

  // Logs & Audits
  getLogs: async (): Promise<Log[]> => {
    return apiFetch("/logs");
  },

  // Alerts List
  getAlerts: async (): Promise<any[]> => {
    return apiFetch("/alerts");
  },

  // Reports statistics
  getGeneralReportStats: async (): Promise<any> => {
    return apiFetch("/reports/general-stats");
  },

  getProjectReportStats: async (projectId: string): Promise<any> => {
    return apiFetch(`/reports/project-stats/${projectId}`);
  },

  // SMTP Email Sender (RF-11)
  sendEmailAlert: async (to: string, subject: string, body: string): Promise<{ success: boolean; message: string }> => {
    return apiFetch("/alerts/send-email", {
      method: "POST",
      body: JSON.stringify({ to, subject, body })
    });
  }
};
