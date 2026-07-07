import React, { useState, useEffect, useRef } from "react";
import { AppScreen, Project, Task, User, Log } from "../types";
import { api, getSavedUser } from "../api";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ProjectForm from "../components/ProjectForm";
import { toast } from "../components/Toast";

// Helper functions to handle dates correctly
function toInputDateFormat(dateStr?: string): string {
  if (!dateStr) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    const day = parts[0].padStart(2, "0");
    const month = parts[1].padStart(2, "0");
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  return "";
}

function toDisplayDateFormat(dateStr?: string): string {
  if (!dateStr) return "N/A";
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];
    return `${day}/${month}/${year}`;
  }
  return dateStr;
}

interface ProjectDetailScreenProps {
  onNavigate: (screen: AppScreen) => void;
  project: Project;
  onRefresh?: () => void;
  onSelectProject?: (p: Project) => void;
}

export default function ProjectDetailScreen({
  onNavigate,
  project,
  onRefresh,
  onSelectProject
}: ProjectDetailScreenProps) {
  const loggedUser = getSavedUser();
  const userRole = loggedUser?.role || "Colaborador";

  // Tabs management
  const [activeTab, setActiveTab] = useState<"tareas" | "entregables" | "archivos" | "fases">(() => {
    const saved = localStorage.getItem("gmp_bim_active_tab");
    return (saved as any) || "tareas";
  });

  useEffect(() => {
    localStorage.setItem("gmp_bim_active_tab", activeTab);
  }, [activeTab]);

  // Project Phases States
  const [projectPhases, setProjectPhases] = useState<any[]>(project.phases || []);
  const [expandedPhaseId, setExpandedPhaseId] = useState<number | null>(null);
  const [editingPhaseId, setEditingPhaseId] = useState<number | null>(null);
  const [editPhaseName, setEditPhaseName] = useState("");
  const [editPhaseDueDate, setEditPhaseDueDate] = useState("");

  useEffect(() => {
    setProjectPhases(project.phases || []);
  }, [project]);
  
  // Dynamic API states
  const [tasks, setTasks] = useState<Task[]>([]);
  const [deliverables, setDeliverables] = useState<any[]>([]);
  const [sharedFiles, setSharedFiles] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [systemUsers, setSystemUsers] = useState<User[]>([]);
  const [allLogs, setAllLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  // Comments state
  const [projectCommentInput, setProjectCommentInput] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");

  // Sub-items comments (Task specific)
  const [selectedTaskForComments, setSelectedTaskForComments] = useState<Task | null>(null);
  const [taskComments, setTaskComments] = useState<any[]>([]);
  const [taskCommentInput, setTaskCommentInput] = useState("");

  // General Project Edit Modal
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [projNameInput, setProjNameInput] = useState("");
  const [projDescInput, setProjDescInput] = useState("");
  const [projStatusInput, setProjStatusInput] = useState<any>("En Curso");
  const [projStartDateInput, setProjStartDateInput] = useState("");
  const [projDueDateInput, setProjDueDateInput] = useState("");
  const [projResponsibleInput, setProjResponsibleInput] = useState("");

  // Team Modal states
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedUserIdForMember, setSelectedUserIdForMember] = useState("");
  const [memberRoleInput, setMemberRoleInput] = useState<"Responsable" | "Líder BIM" | "Colaborador">("Colaborador");
  const [editingMemberIndex, setEditingMemberIndex] = useState<number | null>(null);
  const [editMemberRoleInput, setEditMemberRoleInput] = useState<string>("Colaborador");

  // Task creation/edit states
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState("Modelado BIM");
  const [newTaskPhaseId, setNewTaskPhaseId] = useState<number>(1);
  const [newTaskAssignedTo, setNewTaskAssignedTo] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<any>("Media");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [showEditTaskModal, setShowEditTaskModal] = useState<Task | null>(null);
  const [editTaskName, setEditTaskName] = useState("");
  const [editTaskCategory, setEditTaskCategory] = useState("");
  const [editTaskAssignedTo, setEditTaskAssignedTo] = useState("");
  const [editTaskStatus, setEditTaskStatus] = useState<any>("Pending");
  const [editTaskPriority, setEditTaskPriority] = useState<any>("Media");
  const [editTaskDueDate, setEditTaskDueDate] = useState("");
  const [editTaskPhaseId, setEditTaskPhaseId] = useState<number>(1);

  // Deliverables add/edit states
  const [showNewDelivModal, setShowNewDelivModal] = useState(false);
  const [delivName, setDelivName] = useState("");
  const [delivDesc, setDelivDesc] = useState("");
  const [delivDueDate, setDelivDueDate] = useState("");
  const [delivLod, setDelivLod] = useState("LOD 400");
  const [delivFileText, setDelivFileText] = useState("");
  const [delivTaskId, setDelivTaskId] = useState("");
  
  const [showEditDelivModal, setShowEditDelivModal] = useState<any | null>(null);
  const [editDelivName, setEditDelivName] = useState("");
  const [editDelivDesc, setEditDelivDesc] = useState("");
  const [editDelivDueDate, setEditDelivDueDate] = useState("");
  const [editDelivLod, setEditDelivLod] = useState("LOD 400");
  const [editDelivFileText, setEditDelivFileText] = useState("");
  const [editDelivTaskId, setEditDelivTaskId] = useState("");

  const [showDelivDetailModal, setShowDelivDetailModal] = useState<any | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskStatus, setNewTaskStatus] = useState("Pending");

  // New modal and confirmation states
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [phaseToDelete, setPhaseToDelete] = useState<any | null>(null);
  const [correctionDeliverable, setCorrectionDeliverable] = useState<any | null>(null);
  const [correctionComment, setCorrectionComment] = useState("");
  const [showDeleteTaskConfirm, setShowDeleteTaskConfirm] = useState<any | null>(null);
  const [showDeleteDeliverableConfirm, setShowDeleteDeliverableConfirm] = useState<any | null>(null);
  const [showDeleteFileConfirm, setShowDeleteFileConfirm] = useState<any | null>(null);
  const [showDeleteCommentConfirm, setShowDeleteCommentConfirm] = useState<any | null>(null);
  const [showDeleteMemberConfirm, setShowDeleteMemberConfirm] = useState<any | null>(null);

  // Hidden file input refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load everything on startup & project change
  useEffect(() => {
    loadProjectData();
  }, [project.id]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      const [allTasks, allDelivs, allFiles, allComments, usersList, logsList] = await Promise.all([
        api.getTasks(project.id).catch(() => []),
        api.getDeliverables(project.id).catch(() => []),
        api.getFiles(project.id).catch(() => []),
        api.getComments(project.id).catch(() => []),
        api.getUsers().catch(() => []),
        api.getLogs().catch(() => [])
      ]);
      setTasks(allTasks);
      setDeliverables(allDelivs);
      setSharedFiles(allFiles);
      setComments(allComments);
      setSystemUsers(usersList);
      setAllLogs(logsList);
      setLoading(false);
    } catch (err) {
      console.error("Error loading project deep detail datasets:", err);
      setLoading(false);
    }
  };

  // Open Project Edit Modal
  const handleOpenEditProject = () => {
    setProjNameInput(project.name);
    setProjDescInput(project.description || "");
    setProjStatusInput(project.status);
    setProjStartDateInput(project.startDate || "01/01/2024");
    setProjDueDateInput(project.dueDate);
    setProjResponsibleInput(project.responsible);
    setShowEditProjectModal(true);
  };

  // Save Project General changes
  const handleSaveProjectChanges = async (projectData: any) => {
    try {
      const selectedUser = systemUsers.find(u => u.name === projectData.responsible);
      const responsibleAvatar = selectedUser?.avatarInitials 
        ? `https://lh3.googleusercontent.com/v1/placeholder-user-1.jpg` 
        : project.responsibleAvatar;

      const updatedFields = {
        ...projectData,
        responsibleAvatar
      };

      const updated = await api.updateProject(project.id, updatedFields as any);
      
      // Post activity log
      await api.createLog(
        loggedUser?.name || "Usuario",
        `Modificó proyecto: "${projectData.name}"`,
        `Fijó responsable a: ${projectData.responsible} | Estado: ${projectData.status}`,
        "info"
      );

      setShowEditProjectModal(false);
      
      // Update global stage if functions available
      if (onSelectProject) onSelectProject(updated);
      if (onRefresh) onRefresh();
      
      // Reload details
      loadProjectData();
      toast.success("Información del proyecto actualizada correctamente.");
    } catch (e) {
      toast.error("Error al actualizar la información general del proyecto.");
    }
  };

  // TEAM MEMBERS LOGIC
  const handleAddTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedUser = systemUsers.find(u => u.id === selectedUserIdForMember);
    if (!selectedUser) {
      toast.warning("Seleccione un usuario disponible.");
      return;
    }

    const currentTeam = project.team || [];
    if (currentTeam.some(m => m.userId === selectedUser.id)) {
      toast.warning("El usuario seleccionado ya forma parte del equipo del proyecto.");
      return;
    }

    const updatedTeam = [
      ...currentTeam,
      {
        userId: selectedUser.id,
        name: selectedUser.name,
        role: memberRoleInput,
        email: selectedUser.email
      }
    ];

    try {
      const updated = await api.updateProject(project.id, { team: updatedTeam } as any);
      
      await api.createLog(
        loggedUser?.name || "Usuario",
        `Agregó a ${selectedUser.name} al equipo de coordinación`,
        `Rol asignado: ${memberRoleInput}`,
        "success"
      );

      setShowAddMemberModal(false);
      setSelectedUserIdForMember("");
      
      toast.success("Integrante del equipo agregado exitosamente.");
      if (onSelectProject) onSelectProject(updated);
      if (onRefresh) onRefresh();
    } catch {
      toast.error("Fallo al guardar el integrante del equipo.");
    }
  };

  const handleUpdateMemberRole = async (index: number) => {
    const currentTeam = [...(project.team || [])];
    if (index < 0 || index >= currentTeam.length) return;
    
    currentTeam[index] = {
      ...currentTeam[index],
      role: editMemberRoleInput
    };

    try {
      const updated = await api.updateProject(project.id, { team: currentTeam } as any);
      
      await api.createLog(
        loggedUser?.name || "Usuario",
        `Cambió el rol de ${currentTeam[index].name} en el proyecto`,
        `Nuevo rol: ${editMemberRoleInput}`,
        "info"
      );

      setEditingMemberIndex(null);
      toast.success("Rol del integrante actualizado.");
      if (onSelectProject) onSelectProject(updated);
      if (onRefresh) onRefresh();
    } catch {
      toast.error("No se pudo actualizar el rol del integrante.");
    }
  };

  const handleDeleteTeamMember = (userId: string, memberName: string) => {
    setShowDeleteMemberConfirm({ id: userId, name: memberName });
  };

  const confirmDeleteTeamMember = async () => {
    if (!showDeleteMemberConfirm) return;
    const currentTeam = (project.team || []).filter(m => m.userId !== showDeleteMemberConfirm.id);
    
    try {
      setIsSaving(true);
      const updated = await api.updateProject(project.id, { team: currentTeam } as any);
      
      await api.createLog(
        loggedUser?.name || "Usuario",
        `Retiró a ${showDeleteMemberConfirm.name} del equipo coordinado`,
        `Proyecto: ${project.name}`,
        "info"
      );

      toast.success("Miembro retirado del equipo.");
      if (onSelectProject) onSelectProject(updated);
      if (onRefresh) onRefresh();
    } catch {
      toast.error("Error al intentar retirar el miembro del equipo.");
    } finally {
      setIsSaving(false);
      setShowDeleteMemberConfirm(null);
    }
  };

  // PHASE MANAGEMENT ACTIONS
  const savePhasesToBackend = async (updatedPhases: any[]) => {
    try {
      const updated = await api.updateProject(project.id, { phases: updatedPhases } as any);
      setProjectPhases(updatedPhases);
      if (onSelectProject) onSelectProject(updated);
      if (onRefresh) onRefresh();
    } catch (e) {
      toast.error("Error al actualizar las fases constructivas.");
    }
  };

  const handleAddPhase = async () => {
    const nextId = projectPhases.length > 0 
      ? Math.max(...projectPhases.map((p: any) => Number(p.id) || 0)) + 1 
      : 1;
    const newPhase = {
      id: nextId,
      name: `Fase ${nextId}: Nueva Fase`,
      dueDate: "15/12/2026",
      status: "PENDIENTE"
    };
    const updated = [...projectPhases, newPhase];
    await savePhasesToBackend(updated);
    setExpandedPhaseId(nextId);
  };

  const handleDeletePhase = (phaseId: number) => {
    const phase = projectPhases.find((p: any) => p.id === phaseId);
    if (phase) {
      setPhaseToDelete(phase);
    }
  };

  const handleOpenFile = async (url: string) => {
    if (!url) {
      toast.warning("La ruta del archivo no es válida.");
      return;
    }
    try {
      if (url.startsWith("/")) {
        const response = await fetch(url, { method: "HEAD" });
        if (!response.ok) {
          toast.error("El archivo solicitado no está disponible físicamente en el servidor.");
          return;
        }
      }
      window.open(url, "_blank");
    } catch (e) {
      window.open(url, "_blank");
    }
  };

  const confirmDeletePhase = async (phaseId: number) => {
    try {
      // 1. Filter out the deleted phase
      const filteredPhases = projectPhases.filter((p: any) => p.id !== phaseId);
      
      // 2. Renumber the remaining phases sequentially: 1, 2, 3...
      // Map old ID to new ID
      const idMap: Record<number, number> = {};
      const renumberedPhases = filteredPhases.map((phase: any, index: number) => {
        const oldId = phase.id;
        const newId = index + 1;
        idMap[oldId] = newId;
        return {
          ...phase,
          id: newId
        };
      });

      // 3. Update the phases in the backend project
      const updatedProject = await api.updateProject(project.id, { phases: renumberedPhases } as any);
      setProjectPhases(renumberedPhases);
      
      // 4. Update the tasks and deliverables in the backend
      // - Delete tasks belonging to the deleted phase
      // - Remap other tasks' phaseIds to their new sequential phase ID
      for (const t of tasks) {
        if (Number(t.phaseId) === Number(phaseId)) {
          await api.deleteTask(t.id).catch(() => {});
        } else if (idMap[Number(t.phaseId)]) {
          await api.updateTask(t.id, { phaseId: idMap[Number(t.phaseId)] }).catch(() => {});
        }
      }

      // Remap deliverables' phaseIds
      for (const d of deliverables) {
        if (Number(d.phaseId) === Number(phaseId)) {
          await api.updateDeliverable(d.id, { phaseId: undefined }).catch(() => {});
        } else if (idMap[Number(d.phaseId)]) {
          await api.updateDeliverable(d.id, { phaseId: idMap[Number(d.phaseId)] }).catch(() => {});
        }
      }

      toast.success(`Fase eliminada y numeración recalculada exitosamente.`);
      
      if (onSelectProject) onSelectProject(updatedProject);
      if (onRefresh) onRefresh();
      
      // Re-load the data to update the UI
      loadProjectData();
    } catch (err) {
      toast.error("Error al eliminar la fase constructiva.");
    } finally {
      setPhaseToDelete(null);
    }
  };

  const handleMovePhase = async (index: number, direction: "up" | "down") => {
    const updated = [...projectPhases];
    if (direction === "up" && index > 0) {
      const temp = updated[index];
      updated[index] = updated[index - 1];
      updated[index - 1] = temp;
    } else if (direction === "down" && index < updated.length - 1) {
      const temp = updated[index];
      updated[index] = updated[index + 1];
      updated[index + 1] = temp;
    }
    await savePhasesToBackend(updated);
  };

  const handleStartEditPhase = (phase: any) => {
    setEditingPhaseId(phase.id);
    setEditPhaseName(phase.name);
    setEditPhaseDueDate(phase.dueDate || "");
  };

  const handleSavePhaseDetails = async (phaseId: number) => {
    if (!editPhaseName.trim()) return;
    const updated = projectPhases.map((p: any) => {
      if (p.id === phaseId) {
        return {
          ...p,
          name: editPhaseName.trim(),
          dueDate: editPhaseDueDate.trim()
        };
      }
      return p;
    });
    await savePhasesToBackend(updated);
    setEditingPhaseId(null);
  };

  const getAutoPhaseStatus = (phaseId: number) => {
    const phaseTasks = tasks.filter(t => Number(t.phaseId) === Number(phaseId));
    if (phaseTasks.length === 0) return "PENDIENTE";
    
    const completedTasks = phaseTasks.filter(t => t.status === "Completed");
    
    if (completedTasks.length === phaseTasks.length) {
      return "COMPLETADA";
    }
    if (completedTasks.length > 0 || phaseTasks.some(t => t.status !== "Pending")) {
      return "EN PROGRESO";
    }
    return "PENDIENTE";
  };


  // TASKS MANAGEMENT
  const handleCreateTaskFromModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim()) {
      toast.warning("Por favor ingrese el nombre de la tarea.");
      return;
    }

    try {
      setIsSaving(true);
      const formattedDate = toDisplayDateFormat(newTaskDueDate) || "Sin fecha";

      const selectedUser = systemUsers.find(u => u.name === (newTaskAssignedTo || loggedUser?.name));
      const assignedUserId = selectedUser ? selectedUser.id : (loggedUser ? loggedUser.id : undefined);

      const created = await api.createTask(project.id, {
        name: newTaskName.trim(),
        category: newTaskCategory,
        assignedTo: newTaskAssignedTo || loggedUser?.name || "Desconocido",
        assignedUserId,
        phaseId: Number(newTaskPhaseId) || 1,
        dueDate: formattedDate,
        priority: (newTaskPriority || "Media") as any,
        status: (newTaskStatus || "Pending") as any,
        description: newTaskDesc
      } as any);

      await api.createLog(
        loggedUser?.name || "Usuario",
        `Creó nueva tarea: "${newTaskName.trim()}"`,
        `Fase ID: ${newTaskPhaseId} | Disciplina: ${newTaskCategory} | Responsable: ${newTaskAssignedTo || loggedUser?.name || "Desconocido"}`,
        "success"
      );

      toast.success("Tarea registrada correctamente.");
      setNewTaskName("");
      setNewTaskDueDate("");
      setNewTaskDesc("");
      setShowAddTaskModal(false);
      loadProjectData();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      toast.error("Error al registrar la tarea.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleTaskStatus = async (id: string, currentStatus: Task["status"]) => {
    const next: Task["status"] = currentStatus === "Completed" ? "Pending" : "Completed";
    try {
      await api.updateTaskStatus(id, next);
      
      // Log completion
      const taskObj = tasks.find(t => t.id === id);
      if (taskObj) {
        await api.createLog(
          loggedUser?.name || "Usuario",
          `${next === "Completed" ? "Completó" : "Reabrió"} la tarea: "${taskObj.name}"`,
          `Estado: ${next} | ID: ${id}`,
          next === "Completed" ? "success" : "info"
        );
      }

      loadProjectData();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenEditTask = (task: Task) => {
    setShowEditTaskModal(task);
    setEditTaskName(task.name);
    setEditTaskCategory(task.category);
    setEditTaskAssignedTo(task.assignedTo);
    setEditTaskStatus(task.status);
    setEditTaskPriority(task.priority || "Media");
    setEditTaskDueDate(task.dueDate);
    setEditTaskPhaseId(Number(task.phaseId) || 1);
  };

  const handleSaveTaskChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditTaskModal) return;
    try {
      const selectedUser = systemUsers.find(u => u.name === editTaskAssignedTo);
      const assignedUserId = selectedUser ? selectedUser.id : undefined;

      await api.updateTask(showEditTaskModal.id, {
        name: editTaskName,
        category: editTaskCategory,
        assignedTo: editTaskAssignedTo,
        assignedUserId,
        status: editTaskStatus,
        priority: editTaskPriority,
        dueDate: editTaskDueDate,
        phaseId: Number(editTaskPhaseId)
      } as any);

      await api.createLog(
        loggedUser?.name || "Usuario",
        `Editó parámetros de tarea: "${editTaskName}"`,
        `Asignado: ${editTaskAssignedTo} | Fase ID: ${editTaskPhaseId} | Prioridad: ${editTaskPriority}`,
        "info"
      );

      setShowEditTaskModal(null);
      loadProjectData();
      if (onRefresh) onRefresh();
      toast.success("Tarea de modelado actualizada correctamente.");
    } catch {
      toast.error("Error al actualizar la tarea de modelado.");
    }
  };

  const handleDeleteTask = (taskId: string, name: string) => {
    setShowDeleteTaskConfirm({ id: taskId, name });
  };

  const confirmDeleteTask = async () => {
    if (!showDeleteTaskConfirm) return;
    try {
      setIsSaving(true);
      await api.deleteTask(showDeleteTaskConfirm.id);
      
      await api.createLog(
        loggedUser?.name || "Usuario",
        `Eliminó la tarea del equipo: "${showDeleteTaskConfirm.name}"`,
        `ID: ${showDeleteTaskConfirm.id}`,
        "info"
      );

      toast.success("Tarea eliminada correctamente.");
      loadProjectData();
      if (onRefresh) onRefresh();
    } catch {
      toast.error("Fallo al eliminar la tarea.");
    } finally {
      setIsSaving(false);
      setShowDeleteTaskConfirm(null);
    }
  };


  // TASK COMMENTS INTERACTIVE DIALOGUE
  const handleOpenTaskComments = async (task: Task) => {
    setSelectedTaskForComments(task);
    try {
      const allTaskComments = await api.getComments(task.id);
      setTaskComments(allTaskComments);
    } catch (e) {
      setTaskComments([]);
    }
  };

  const handleAddTaskComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskForComments || !taskCommentInput.trim()) return;
    try {
      await api.createComment(selectedTaskForComments.id, loggedUser?.name || "Usuario", taskCommentInput.trim());
      
      await api.createLog(
        loggedUser?.name || "Usuario",
        `Comentó sobre la tarea: "${selectedTaskForComments.name}"`,
        `Mensaje: ${taskCommentInput.slice(0, 40)}...`,
        "info"
      );

      setTaskCommentInput("");
      const updated = await api.getComments(selectedTaskForComments.id);
      setTaskComments(updated);
      toast.success("Comentario publicado.");
    } catch {
      toast.error("Error al guardar el comentario de la tarea.");
    }
  };


  // PROJECT COMMENTS (BIM Canal)
  const handleAddProjectComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectCommentInput.trim()) return;
    try {
      await api.createComment(project.id, loggedUser?.name || "Usuario", projectCommentInput.trim());
      
      await api.createLog(
        loggedUser?.name || "Usuario",
        `Añadió comentario al foro de coordinación`,
        `"${projectCommentInput.slice(0, 45)}..."`,
        "info"
      );

      setProjectCommentInput("");
      const updated = await api.getComments(project.id);
      setComments(updated);
      toast.success("Comentario publicado en BIM Canal.");
    } catch {
      toast.error("Fallo al publicar el comentario.");
    }
  };

  const handleStartEditComment = (id: string, text: string) => {
    setEditingCommentId(id);
    setEditingCommentText(text);
  };

  const handleSaveCommentEdit = async (id: string) => {
    if (!editingCommentText.trim()) return;
    try {
      await api.updateComment(id, editingCommentText.trim());
      setEditingCommentId(null);
      const updated = await api.getComments(project.id);
      setComments(updated);
      toast.success("Comentario actualizado.");
    } catch {
      toast.error("Error al actualizar el comentario.");
    }
  };

  const handleDeleteComment = (id: string) => {
    setShowDeleteCommentConfirm(id);
  };

  const confirmDeleteComment = async () => {
    if (!showDeleteCommentConfirm) return;
    try {
      setIsSaving(true);
      await api.deleteComment(showDeleteCommentConfirm);
      const updated = await api.getComments(project.id);
      setComments(updated);
      toast.success("Comentario eliminado correctamente.");
    } catch {
      toast.error("Error al eliminar el comentario.");
    } finally {
      setIsSaving(false);
      setShowDeleteCommentConfirm(null);
    }
  };


  // DELIVERABLES ACTIONS
  const handleOpenNewDeliv = () => {
    setDelivName("");
    setDelivDesc("");
    setDelivDueDate("15/12/2026");
    setDelivLod("LOD 400");
    setDelivFileText("");
    setDelivTaskId("");
    setShowNewDelivModal(true);
  };

  const handleSaveNewDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!delivName.trim()) return;
    try {
      const associatedTask = tasks.find(t => t.id === delivTaskId);
      const phaseId = associatedTask ? associatedTask.phaseId : undefined;

      await api.createDeliverable(project.id, {
        name: delivName.trim(),
        description: delivDesc,
        dueDate: delivDueDate,
        uploadedBy: loggedUser?.name || "Desconocido",
        uploadedByUserId: loggedUser?.id || undefined,
        lod: delivLod,
        fileUrl: delivFileText || `/uploads/${delivName.replace(/\s+/g, "_")}`,
        status: "PENDIENTE",
        taskId: delivTaskId,
        phaseId: phaseId ? Number(phaseId) : undefined
      } as any);

      await api.createLog(
        loggedUser?.name || "Usuario",
        `Subió y registró entregable: "${delivName.trim()}"`,
        `Exigencia BIM: ${delivLod} | Fecha límite acordada: ${delivDueDate}`,
        "success"
      );

      setShowNewDelivModal(false);
      loadProjectData();
      toast.success("Entregable registrado correctamente.");
    } catch {
      toast.error("Error al guardar el entregable técnico.");
    }
  };

  const handleOpenEditDeliv = (d: any) => {
    setShowEditDelivModal(d);
    setEditDelivName(d.name);
    setEditDelivDesc(d.description || "");
    setEditDelivDueDate(d.dueDate || "");
    setEditDelivLod(d.lod || "LOD 400");
    setEditDelivFileText(d.fileUrl || "");
    setEditDelivTaskId(d.taskId || "");
  };

  const handleSaveEditDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditDelivModal) return;
    try {
      const associatedTask = tasks.find(t => t.id === editDelivTaskId);
      const phaseId = associatedTask ? associatedTask.phaseId : undefined;

      await api.updateDeliverable(showEditDelivModal.id, {
        name: editDelivName,
        description: editDelivDesc,
        dueDate: editDelivDueDate,
        lod: editDelivLod,
        fileUrl: editDelivFileText,
        taskId: editDelivTaskId,
        phaseId: phaseId ? Number(phaseId) : undefined
      } as any);

      await api.createLog(
        loggedUser?.name || "Usuario",
        `Modificó especificaciones del entregable: "${editDelivName}"`,
        `Prioridad establecida: ${editDelivLod}`,
        "info"
      );

      setShowEditDelivModal(null);
      loadProjectData();
      toast.success("Especificaciones del entregable actualizadas.");
    } catch {
      toast.error("No se pudo modificar el entregable.");
    }
  };

  const handleDeleteDeliverable = (id: string, name: string) => {
    setShowDeleteDeliverableConfirm({ id, name });
  };

  const confirmDeleteDeliverable = async () => {
    if (!showDeleteDeliverableConfirm) return;
    try {
      setIsSaving(true);
      await api.deleteDeliverable(showDeleteDeliverableConfirm.id);
      
      await api.createLog(
        loggedUser?.name || "Usuario",
        `Eliminó el entregable del proyecto: "${showDeleteDeliverableConfirm.name}"`,
        `Proyecto: ${project.name}`,
        "info"
      );

      toast.success("Entregable eliminado correctamente.");
      loadProjectData();
    } catch {
      toast.error("Error al eliminar entregable.");
    } finally {
      setIsSaving(false);
      setShowDeleteDeliverableConfirm(null);
    }
  };

  const handleReviewDeliverable = async (id: string, status: "APROBADO" | "RECHAZADO" | "EN REVISIÓN" | "PENDIENTE", reason?: string) => {
    if (userRole !== "Administrador" && userRole !== "Gestor") {
      toast.error("No cuenta con permisos para evaluar este documento (Solo administrador o gestor).");
      return;
    }
    try {
      setIsSaving(true);
      const currentDeliv = deliverables.find(d => d.id === id);
      const prevHistory = currentDeliv?.history || [];
      const newHistoryEntry = {
        status,
        reason: reason || "",
        date: new Date().toLocaleDateString("es-PE") + " " + new Date().toLocaleTimeString("es-PE"),
        user: loggedUser?.name || "Evaluador"
      };

      await api.updateDeliverable(id, {
        status,
        history: [...prevHistory, newHistoryEntry]
      } as any);
      
      await api.createLog(
        loggedUser?.name || "Usuario",
        `Cambió estado de entregable a: "${status}"`,
        currentDeliv ? `Entregable: "${currentDeliv.name}"` : `ID: ${id}`,
        status === "APROBADO" ? "success" : status === "RECHAZADO" ? "error" : "info"
      );

      toast.success(`Entregable cambiado a ${status} correctamente.`);
      loadProjectData();
    } catch {
      toast.error("Error en la calificación del entregable.");
    } finally {
      setIsSaving(false);
    }
  };


  // SUPPORTED FILES UPLOAD
  const triggerLocalFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedExtensions = [".rvt", ".ifc", ".nwd", ".pdf", ".xlsx", ".docx"];
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    
    if (!allowedExtensions.includes(ext)) {
      toast.error(`Extensión de archivo inválida. Extensiones permitidas: ${allowedExtensions.join(", ")}`);
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const sizeStr = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
        
        await api.uploadFile(project.id, file.name, sizeStr, base64, loggedUser?.name, loggedUser?.id);
        
        await api.createLog(
          loggedUser?.name || "Usuario",
          `Subió archivo de apoyo: "${file.name}"`,
          `Tamaño: ${sizeStr} | Redundancia Google Drive iniciada exitosamente`,
          "success"
        );

        loadProjectData();
        toast.success("Archivo subido y registrado exitosamente.");
      } catch (err) {
        toast.error("Fallo el almacenamiento local del archivo.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteFile = (fileId: string, fileName: string) => {
    if (userRole !== "Administrador" && userRole !== "Gestor") {
      toast.error("No posee los roles necesarios para eliminar este archivo del servidor.");
      return;
    }
    setShowDeleteFileConfirm({ id: fileId, name: fileName });
  };

  const confirmDeleteFile = async () => {
    if (!showDeleteFileConfirm) return;
    try {
      setIsSaving(true);
      await api.deleteFile(showDeleteFileConfirm.id);
      
      await api.createLog(
        loggedUser?.name || "Usuario",
        `Eliminó apoyo adjunto: "${showDeleteFileConfirm.name}"`,
        `Proyecto: ${project.name}`,
        "info"
      );

      toast.success("Archivo eliminado correctamente.");
      loadProjectData();
    } catch {
      toast.error("Fallo al eliminar archivo compartido.");
    } finally {
      setIsSaving(false);
      setShowDeleteFileConfirm(null);
    }
  };


  // Filter Recent Activities logs of THIS project or general ones
  const projectLogs = allLogs.slice(0, 5); // Take top 5 recent audit logs for Recent Activity module

  return (
    <div className="min-h-screen bg-[#f7fafc] text-[#181c1e] font-sans selection:bg-[#ffb800] selection:text-[#6d4c00]" id="project-detail-viewport">
      {/* Sidebar navigation */}
      <Sidebar currentScreen={AppScreen.PROJECTS_LIST} onNavigate={onNavigate} />

      {/* Header bar */}
      <Header 
        onNavigate={onNavigate}
        onSelectProject={onSelectProject}
      />

      {/* Main Content Stage */}
      <main className="ml-[240px] pt-24 px-8 pb-12 transition-all duration-300">
        
        {/* Breadcrumb path */}
        <div className="flex items-center gap-2 text-gray-400 mb-6 uppercase text-[10px] tracking-widest font-bold" id="detail-breadcrumb">
          <button onClick={() => onNavigate(AppScreen.DASHBOARD)} className="hover:text-[#7c5800] cursor-pointer bg-transparent border-0 font-bold transition-colors">
            Dashboard
          </button>
          <span className="material-symbols-outlined text-xs select-none">chevron_right</span>
          <button onClick={() => onNavigate(AppScreen.PROJECTS_LIST)} className="hover:text-[#7c5800] cursor-pointer bg-transparent border-0 font-bold transition-colors">
            Proyectos
          </button>
          <span className="material-symbols-outlined text-xs select-none">chevron_right</span>
          <span className="text-[#a18146] font-extrabold">{project.name}</span>
        </div>

        {/* Master Project Summary Panel with yellow ribbon */}
        <div className="bg-white border border-gray-200 p-8 rounded-xl shadow-sm mb-8 relative overflow-hidden" id="project-status-overview-panel">
          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-[#ffb800]"></div>

          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] font-black tracking-widest bg-gray-100 text-[#7c5800] px-2.5 py-1 rounded">
                  {project.code || "PRJ-CODE"}
                </span>
                <span className="bg-[#ffb800]/15 text-[#7c5800] px-3 py-0.5 rounded text-[10px] font-black uppercase tracking-wider font-bold">
                  Estado: {project.status}
                </span>
                <button
                  onClick={handleOpenEditProject}
                  className="px-3 py-1 bg-gray-150 hover:bg-[#ffb800]/15 text-gray-700 hover:text-[#7c5800] text-[10px] font-bold rounded-md transition-all flex items-center gap-1 cursor-pointer border border-gray-200"
                  id="btn-edit-general-project"
                >
                  <span className="material-symbols-outlined text-xs">edit</span>
                  <span>Editar Proyecto</span>
                </button>
              </div>
              
              <h3 className="text-3xl font-black tracking-tight text-gray-900">
                {project.name}
              </h3>
              
              <p className="text-gray-500 text-sm leading-relaxed max-w-3xl font-medium">
                {project.description || "N/A"}
              </p>
            </div>

            {/* Progress bar metrics */}
            <div className="flex items-center gap-4 border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 pl-0 lg:ml-4 lg:pl-6 lg:w-80 shrink-0">
              <div className="flex-grow space-y-2">
                <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <span>AVANCE DEL PROYECTO</span>
                  <span className="font-mono font-black text-gray-900">{project.progress || 0}%</span>
                </div>
                <div className="w-full bg-gray-150 h-2.5 rounded-full overflow-hidden flex">
                  <div className="h-full bg-[#ffb800]" style={{ width: `${project.progress || 0}%` }}></div>
                </div>
                
                <div className="flex justify-between text-[11px] font-mono font-extrabold text-gray-400 pt-1">
                  <span>Inicio: {project.startDate || "01/01/2024"}</span>
                  <span>Fin: {project.dueDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DETAILS WORK AREA */}
        <div className="grid grid-cols-12 gap-6" id="project-detail-workspace">
          
          {/* Main workspace section with tabs (8 columns) */}
          <div className="col-span-12 lg:col-span-8 bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden flex flex-col" id="detail-tabbed-pane">
            
            {/* Tab links */}
            <div className="flex border-b border-gray-200 bg-gray-50/50" id="detail-workspace-tabs">
              <button
                id="tab-control-fases"
                onClick={() => setActiveTab("fases")}
                className={`flex-1 py-4.5 px-6 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer bg-transparent ${
                  activeTab === "fases"
                    ? "border-[#ffb800] text-[#7c5800] bg-white font-black"
                    : "border-transparent text-gray-400 hover:text-gray-700 hover:bg-gray-50/30"
                }`}
              >
                <span className="material-symbols-outlined text-lg">account_tree</span>
                <span>Fases ({projectPhases.length})</span>
              </button>

              <button
                id="tab-control-tareas"
                onClick={() => setActiveTab("tareas")}
                className={`flex-1 py-4.5 px-6 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer bg-transparent ${
                  activeTab === "tareas"
                    ? "border-[#ffb800] text-[#7c5800] bg-white font-black"
                    : "border-transparent text-gray-400 hover:text-gray-700 hover:bg-gray-50/30"
                }`}
              >
                <span className="material-symbols-outlined text-lg">format_list_bulleted</span>
                <span>Tareas ({tasks.length})</span>
              </button>
              
              <button
                id="tab-control-entregables"
                onClick={() => setActiveTab("entregables")}
                className={`flex-1 py-4.5 px-6 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer bg-transparent ${
                  activeTab === "entregables"
                    ? "border-[#ffb800] text-[#7c5800] bg-white font-black"
                    : "border-transparent text-gray-400 hover:text-gray-700 hover:bg-gray-50/30"
                }`}
              >
                <span className="material-symbols-outlined text-lg">description</span>
                <span>Entregables ({deliverables.length})</span>
              </button>
              
              <button
                id="tab-control-archivos"
                onClick={() => setActiveTab("archivos")}
                className={`flex-1 py-4.5 px-6 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer bg-transparent ${
                  activeTab === "archivos"
                    ? "border-[#ffb800] text-[#7c5800] bg-white font-black"
                    : "border-transparent text-gray-400 hover:text-gray-700 hover:bg-gray-50/30"
                }`}
              >
                <span className="material-symbols-outlined text-lg">folder_shared</span>
                <span>Archivos Compartidos ({sharedFiles.length})</span>
              </button>
            </div>

            {/* TAB CONTAINER BODY */}
            <div className="flex-grow p-6">
              
              {/* TAB 0: FASES CONSTRUCTIVAS */}
              {activeTab === "fases" && (
                <div className="space-y-6" id="panel-phases-list">
                  <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-150">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">Estructura de Fases del Proyecto</h4>
                      <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider mt-0.5">Define, planifica y asocia metas de control por etapas constructivas.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddPhase}
                      className="bg-[#ffb800] text-[#181c1e] font-black font-sans px-4 py-2 rounded-lg text-xs hover:brightness-105 transition-all flex items-center justify-center gap-1 cursor-pointer uppercase tracking-wider"
                    >
                      <span className="material-symbols-outlined text-sm font-bold">add_circle</span>
                      <span>Agregar Fase</span>
                    </button>
                  </div>

                  {projectPhases.length === 0 ? (
                    <div className="text-center p-12 border border-dashed border-gray-300 rounded-2xl bg-gray-50/50">
                      <span className="material-symbols-outlined text-gray-400 text-4xl mb-2">account_tree</span>
                      <h4 className="text-sm font-bold text-gray-800">Este proyecto aún no cuenta con fases constructivas</h4>
                      <p className="text-gray-500 text-xs max-w-sm mx-auto mt-1 leading-relaxed">
                        Agregue fases de ciclo de vida del proyecto para poder organizar las tareas y entregables de manera jerárquica.
                      </p>
                      <button
                        type="button"
                        onClick={async () => {
                          const DEFAULT_PHASES = [
                            { id: 1, name: "Planificación y Programación", dueDate: "30/08/2026", status: "PENDIENTE" },
                            { id: 2, name: "Diseño Conceptual y Espacial", dueDate: "30/09/2026", status: "PENDIENTE" },
                            { id: 3, name: "Desarrollo de Especialidades", dueDate: "30/10/2026", status: "PENDIENTE" },
                            { id: 4, name: "Coordinación y Compatibilización", dueDate: "30/11/2026", status: "PENDIENTE" },
                            { id: 5, name: "Simulación 4D y Presupuesto 5D", dueDate: "30/12/2026", status: "PENDIENTE" },
                            { id: 6, name: "Supervisión de Obra (As-Built)", dueDate: "30/01/2027", status: "PENDIENTE" }
                          ];
                          await savePhasesToBackend(DEFAULT_PHASES);
                        }}
                        className="mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2 rounded-lg text-xs transition-all cursor-pointer"
                      >
                        Inicializar 6 Fases Estándar
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {projectPhases.map((phase: any, index: number) => {
                        const isExpanded = expandedPhaseId === phase.id;
                        
                        // Derived Metrics
                        const phaseTasks = tasks.filter(t => Number(t.phaseId) === Number(phase.id));
                        const phaseDeliverables = deliverables.filter(d => Number(d.phaseId) === Number(phase.id));
                        
                        const completedTasks = phaseTasks.filter(t => t.status === "Completed");
                        const progressPercent = phaseTasks.length > 0 
                          ? Math.round((completedTasks.length / phaseTasks.length) * 100) 
                          : 0;
                        
                        const autoStatus = getAutoPhaseStatus(phase.id);

                        return (
                          <div 
                            key={phase.id} 
                            className={`bg-white border ${isExpanded ? "border-[#ffb800] ring-1 ring-[#ffb800]/20" : "border-gray-200"} rounded-xl shadow-xs overflow-hidden transition-all duration-200`}
                          >
                            {/* Header Row */}
                            <div className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                              <div 
                                className="flex items-center gap-4 cursor-pointer flex-1 min-w-0"
                                onClick={() => setExpandedPhaseId(isExpanded ? null : phase.id)}
                              >
                                {/* Badge Index */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                  autoStatus === "COMPLETADA" ? "bg-green-100 text-green-700" :
                                  autoStatus === "EN PROGRESO" ? "bg-amber-100 text-amber-700" :
                                  "bg-gray-100 text-gray-400"
                                }`}>
                                  {index + 1}
                                </div>

                                <div className="flex-1 min-w-0">
                                  {editingPhaseId === phase.id ? (
                                    <div className="flex gap-2 items-center" onClick={(e) => e.stopPropagation()}>
                                      <input 
                                        type="text"
                                        value={editPhaseName}
                                        onChange={(e) => setEditPhaseName(e.target.value)}
                                        className="px-2 py-1 text-xs font-bold border rounded bg-white text-gray-800"
                                        placeholder="Nombre de la fase"
                                        required
                                      />
                                      <input 
                                        type="text"
                                        value={editPhaseDueDate}
                                        onChange={(e) => setEditPhaseDueDate(e.target.value)}
                                        className="px-2 py-1 text-xs font-mono font-bold border rounded bg-white text-gray-800 w-28"
                                        placeholder="Fecha límite"
                                        required
                                      />
                                      <button 
                                        type="button"
                                        onClick={() => handleSavePhaseDetails(phase.id)}
                                        className="px-2 py-1 bg-[#ffb800] text-gray-950 rounded font-bold text-[10px] cursor-pointer"
                                      >
                                        Guardar
                                      </button>
                                      <button 
                                        type="button"
                                        onClick={() => setEditingPhaseId(null)}
                                        className="px-2 py-1 bg-gray-200 text-gray-700 rounded font-bold text-[10px] cursor-pointer"
                                      >
                                        X
                                      </button>
                                    </div>
                                  ) : (
                                    <>
                                      <h4 className="font-bold text-sm text-[#181c1e] truncate">{phase.name}</h4>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-gray-400 text-[10px] font-bold font-mono uppercase">LÍMITE: {phase.dueDate || "N/A"}</span>
                                        <span className="text-gray-350 text-[10px] font-bold">&bull;</span>
                                        <span className={`text-[9px] font-mono font-extrabold px-1.5 py-0.2 rounded ${
                                          autoStatus === "COMPLETADA" ? "bg-green-100 text-green-700" :
                                          autoStatus === "EN PROGRESO" ? "bg-amber-100 text-amber-700" :
                                          "bg-gray-150 text-gray-500"
                                        }`}>{autoStatus}</span>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Controls */}
                              <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                                {/* Move buttons */}
                                <div className="flex gap-1">
                                  <button 
                                    onClick={() => handleMovePhase(index, "up")}
                                    disabled={index === 0}
                                    className="p-1 hover:bg-gray-100 text-gray-400 hover:text-gray-700 rounded disabled:opacity-25 cursor-pointer"
                                    title="Subir orden"
                                  >
                                    <span className="material-symbols-outlined text-base font-bold">arrow_upward</span>
                                  </button>
                                  <button 
                                    onClick={() => handleMovePhase(index, "down")}
                                    disabled={index === projectPhases.length - 1}
                                    className="p-1 hover:bg-gray-100 text-gray-400 hover:text-gray-700 rounded disabled:opacity-25 cursor-pointer"
                                    title="Bajar orden"
                                  >
                                    <span className="material-symbols-outlined text-base font-bold">arrow_downward</span>
                                  </button>
                                </div>

                                {/* Edit Button */}
                                {editingPhaseId !== phase.id && (
                                  <button 
                                    onClick={() => handleStartEditPhase(phase)}
                                    className="p-1.5 hover:bg-amber-50 text-amber-600 hover:text-amber-800 rounded transition-colors cursor-pointer"
                                    title="Editar nombre/fecha"
                                  >
                                    <span className="material-symbols-outlined text-base font-bold">edit</span>
                                  </button>
                                )}

                                {/* Delete Button */}
                                <button 
                                  onClick={() => handleDeletePhase(phase.id)}
                                  className="p-1.5 hover:bg-red-50 text-red-500 hover:text-red-700 rounded transition-colors cursor-pointer"
                                  title="Eliminar fase"
                                >
                                  <span className="material-symbols-outlined text-base font-bold">delete</span>
                                </button>

                                {/* Toggle Chevron */}
                                <button
                                  onClick={() => setExpandedPhaseId(isExpanded ? null : phase.id)}
                                  className="p-1.5 hover:bg-gray-100 text-gray-400 rounded transition-transform cursor-pointer"
                                >
                                  <span className={`material-symbols-outlined text-base font-bold transition-transform duration-200 block ${isExpanded ? "rotate-180" : ""}`}>
                                    expand_more
                                  </span>
                                </button>
                              </div>
                            </div>

                            {/* Expanded Area */}
                            {isExpanded && (
                              <div className="px-5 pb-5 pt-3 border-t border-gray-100 bg-gray-50/20 space-y-4">
                                {/* Summary Metrics cards */}
                                <div className="grid grid-cols-3 gap-3">
                                  <div className="bg-white border border-gray-150 p-3 rounded-lg text-center shadow-2xs">
                                    <p className="text-[9px] text-gray-400 font-bold uppercase">Tareas de Fase</p>
                                    <p className="text-base font-black text-gray-800 mt-1">{phaseTasks.length}</p>
                                  </div>
                                  <div className="bg-white border border-gray-150 p-3 rounded-lg text-center shadow-2xs">
                                    <p className="text-[9px] text-gray-400 font-bold uppercase">Entregables Oficiales</p>
                                    <p className="text-base font-black text-gray-800 mt-1">{phaseDeliverables.length}</p>
                                  </div>
                                  <div className="bg-white border border-gray-150 p-3 rounded-lg text-center shadow-2xs">
                                    <p className="text-[9px] text-gray-400 font-bold uppercase">Avance de Fase</p>
                                    <div className="flex items-center justify-center gap-1.5 mt-1">
                                      <p className="text-base font-black text-gray-800">{progressPercent}%</p>
                                      <div className="w-12 bg-gray-100 h-1.5 rounded-full overflow-hidden shrink-0">
                                        <div className="h-full bg-green-500" style={{ width: `${progressPercent}%` }}></div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Checklist Tasks list */}
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider block">Checklist de Tareas en esta Fase ({phaseTasks.length})</p>
                                  </div>

                                  {phaseTasks.length === 0 ? (
                                    <div className="text-center p-6 bg-white border border-dashed rounded-xl text-xs text-gray-400 font-bold italic">
                                      No hay tareas vinculadas a esta fase constructiva.
                                    </div>
                                  ) : (
                                    <div className="divide-y divide-gray-150 bg-white border border-gray-150 rounded-xl overflow-hidden">
                                      {phaseTasks.map((task) => {
                                        const isCompleted = task.status === "Completed";
                                        return (
                                          <div key={task.id} className="p-3.5 flex items-center justify-between hover:bg-gray-50/35 transition-colors">
                                            <div className="flex items-center gap-3">
                                              <input
                                                type="checkbox"
                                                checked={isCompleted}
                                                onChange={() => toggleTaskStatus(task.id, task.status)}
                                                className="w-4 h-4 rounded text-[#7c5800] border-gray-300 focus:ring-[#ffb800] cursor-pointer shrink-0"
                                              />
                                              <div>
                                                <span className={`text-xs font-bold block ${isCompleted ? "line-through text-gray-400 font-medium" : "text-gray-900"}`}>
                                                  {task.name}
                                                </span>
                                                <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">
                                                  Responsable: <span className="text-[#a18146]">{task.assignedTo}</span> &bull; {task.category}
                                                </p>
                                              </div>
                                            </div>
                                            <span className="text-[9px] text-gray-400 font-mono font-bold uppercase">Límite: {task.dueDate}</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 1: MODELING TASKS */}
              {activeTab === "tareas" && (
                <div className="space-y-6" id="panel-tasks-list">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-gray-150 p-4 rounded-xl gap-4">
                    <div>
                      <h4 className="text-sm font-black text-gray-900">Tareas de Coordinación BIM</h4>
                      <p className="text-[11px] text-gray-500 font-medium">Asigne y gestione tareas de modelado o compatibilización entre especialistas.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setNewTaskName("");
                        setNewTaskDueDate("");
                        setNewTaskDesc("");
                        setNewTaskStatus("Pending");
                        setShowAddTaskModal(true);
                      }}
                      className="bg-[#ffb800] hover:brightness-105 active:scale-95 text-[#181c1e] rounded-lg px-4 py-2 text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer self-stretch sm:self-auto justify-center"
                    >
                      <span className="material-symbols-outlined text-sm font-bold">add</span>
                      <span>Crear Nueva Tarea</span>
                    </button>
                  </div>

                  {/* Grouped and filtered by phases visually */}
                  <div className="space-y-4" id="tasks-checklist-wrapper">
                    {projectPhases.length === 0 && tasks.length === 0 ? (
                      <div className="p-8 text-center text-xs text-gray-400 font-bold uppercase tracking-wider bg-gray-50/40 border border-gray-150 rounded-xl">No hay tareas creadas para este proyecto.</div>
                    ) : (
                      <>
                        {projectPhases.map((phase: any) => {
                          const phaseTasks = tasks.filter((t) => Number(t.phaseId) === Number(phase.id));
                          return (
                            <div key={phase.id} className="border border-gray-150 rounded-xl overflow-hidden bg-white">
                              <div className="bg-gray-50/75 px-4 py-3 border-b border-gray-150 flex justify-between items-center">
                                <span className="text-xs font-black text-gray-700 uppercase tracking-wider">{phase.name}</span>
                                <span className="text-[10px] font-mono font-extrabold bg-gray-200/80 text-gray-600 px-2 py-0.5 rounded-full">
                                  {phaseTasks.length} {phaseTasks.length === 1 ? "tarea" : "tareas"}
                                </span>
                              </div>
                              
                              {phaseTasks.length === 0 ? (
                                <div className="p-4 text-center text-xs text-gray-400 italic">
                                  No hay tareas asignadas en esta fase constructiva.
                                </div>
                              ) : (
                                <div className="divide-y divide-gray-150">
                                  {phaseTasks.map((task) => {
                                    const isCompleted = task.status === "Completed";
                                    return (
                                      <div 
                                        key={task.id}
                                        className="px-5 py-4 flex items-center justify-between hover:bg-gray-50/20 transition-colors group"
                                        id={`task-item-${task.id}`}
                                      >
                                        <div className="flex items-center gap-4 flex-1 mr-4">
                                          <input
                                            type="checkbox"
                                            checked={isCompleted}
                                            onChange={() => toggleTaskStatus(task.id, task.status)}
                                            className="w-5 h-5 rounded text-[#7c5800] border-gray-300 focus:ring-[#ffb800] cursor-pointer shrink-0"
                                            id={`task-checkbox-${task.id}`}
                                          />
                                          <div>
                                            <span className={`text-sm font-bold block transition-all ${isCompleted ? "line-through text-gray-400 font-semibold" : "text-gray-900"}`}>
                                              {task.name}
                                            </span>
                                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-gray-400 font-bold uppercase mt-1">
                                              <span className="font-mono text-gray-500">{task.id}</span>
                                              <span>&bull;</span>
                                              <span className="text-[#a18146]">{task.assignedTo}</span>
                                              <span>&bull;</span>
                                              <span className="text-gray-400">{task.category}</span>
                                              <span>&bull;</span>
                                              <span className={`px-1.5 py-0.2 rounded text-[8px] ${
                                                task.priority === "Alta" ? "bg-red-50 text-red-600" :
                                                task.priority === "Baja" ? "bg-gray-100 text-gray-600" : "bg-blue-50 text-blue-600"
                                              }`}>
                                                {task.priority || "Media"}
                                              </span>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Inline operations */}
                                        <div className="flex items-center gap-3 shrink-0">
                                          <span className="text-[10px] text-gray-400 font-bold font-mono tracking-wide">
                                            LÍMITE: {task.dueDate}
                                          </span>
                                          
                                          <button
                                            onClick={() => handleOpenTaskComments(task)}
                                            type="button"
                                            className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-cyan-600 rounded-md transition-colors cursor-pointer"
                                            title="Ver comentarios de la tarea"
                                            id={`task-btn-comments-${task.id}`}
                                          >
                                            <span className="material-symbols-outlined text-base select-none">forum</span>
                                          </button>

                                          <button
                                            onClick={() => handleOpenEditTask(task)}
                                            type="button"
                                            className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-gray-800 rounded-md transition-colors cursor-pointer"
                                            title="Editar parámetros de la tarea"
                                            id={`task-btn-edit-${task.id}`}
                                          >
                                            <span className="material-symbols-outlined text-base select-none">edit</span>
                                          </button>

                                          <button
                                            onClick={() => handleDeleteTask(task.id, task.name)}
                                            type="button"
                                            className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-650 rounded-md transition-colors cursor-pointer"
                                            title="Eliminar tarea"
                                            id={`task-btn-delete-${task.id}`}
                                          >
                                            <span className="material-symbols-outlined text-base select-none">delete</span>
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {/* Unphased tasks (if any) */}
                        {(() => {
                          const unphasedTasks = tasks.filter(t => !projectPhases.some(p => Number(p.id) === Number(t.phaseId)));
                          if (unphasedTasks.length === 0) return null;
                          return (
                            <div className="border border-gray-150 rounded-xl overflow-hidden bg-white">
                              <div className="bg-gray-150/40 px-4 py-3 border-b border-gray-150 flex justify-between items-center">
                                <span className="text-xs font-black text-gray-500 uppercase tracking-wider">Otras Tareas (Sin Fase asignada)</span>
                                <span className="text-[10px] font-mono font-extrabold bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">
                                  {unphasedTasks.length} {unphasedTasks.length === 1 ? "tarea" : "tareas"}
                                </span>
                              </div>
                              <div className="divide-y divide-gray-150">
                                {unphasedTasks.map((task) => {
                                  const isCompleted = task.status === "Completed";
                                  return (
                                    <div 
                                      key={task.id}
                                      className="px-5 py-4 flex items-center justify-between hover:bg-gray-50/20 transition-colors group"
                                      id={`task-item-${task.id}`}
                                    >
                                      <div className="flex items-center gap-4 flex-1 mr-4">
                                        <input
                                          type="checkbox"
                                          checked={isCompleted}
                                          onChange={() => toggleTaskStatus(task.id, task.status)}
                                          className="w-5 h-5 rounded text-[#7c5800] border-gray-300 focus:ring-[#ffb800] cursor-pointer shrink-0"
                                          id={`task-checkbox-${task.id}`}
                                        />
                                        <div>
                                          <span className={`text-sm font-bold block transition-all ${isCompleted ? "line-through text-gray-400 font-semibold" : "text-gray-900"}`}>
                                            {task.name}
                                          </span>
                                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-gray-400 font-bold uppercase mt-1">
                                            <span className="font-mono text-gray-500">{task.id}</span>
                                            <span>&bull;</span>
                                            <span className="text-[#a18146]">{task.assignedTo}</span>
                                            <span>&bull;</span>
                                            <span className="text-gray-400">{task.category}</span>
                                            <span>&bull;</span>
                                            <span className={`px-1.5 py-0.2 rounded text-[8px] ${
                                              task.priority === "Alta" ? "bg-red-50 text-red-600" :
                                              task.priority === "Baja" ? "bg-gray-100 text-gray-600" : "bg-blue-50 text-blue-600"
                                            }`}>
                                              {task.priority || "Media"}
                                            </span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Inline operations */}
                                      <div className="flex items-center gap-3 shrink-0">
                                        <span className="text-[10px] text-gray-400 font-bold font-mono tracking-wide">
                                          LÍMITE: {task.dueDate}
                                        </span>
                                        
                                        <button
                                          onClick={() => handleOpenTaskComments(task)}
                                          type="button"
                                          className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-cyan-600 rounded-md transition-colors cursor-pointer"
                                          title="Ver comentarios de la tarea"
                                          id={`task-btn-comments-${task.id}`}
                                        >
                                          <span className="material-symbols-outlined text-base select-none">forum</span>
                                        </button>

                                        <button
                                          onClick={() => handleOpenEditTask(task)}
                                          type="button"
                                          className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-gray-800 rounded-md transition-colors cursor-pointer"
                                          title="Editar parámetros de la tarea"
                                          id={`task-btn-edit-${task.id}`}
                                        >
                                          <span className="material-symbols-outlined text-base select-none">edit</span>
                                        </button>

                                        <button
                                          onClick={() => handleDeleteTask(task.id, task.name)}
                                          type="button"
                                          className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-650 rounded-md transition-colors cursor-pointer"
                                          title="Eliminar tarea"
                                          id={`task-btn-delete-${task.id}`}
                                        >
                                          <span className="material-symbols-outlined text-base select-none">delete</span>
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })()}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: GENERAL DELIVERABLES */}
              {activeTab === "entregables" && (
                <div className="space-y-4" id="panel-deliverables">
                  <div className="flex items-center justify-between text-xs text-gray-600 font-bold mb-2">
                    <p className="uppercase tracking-widest text-[9px] text-gray-400">Entregables BIM para Aseguramiento de Calidad</p>
                    <button
                      onClick={handleOpenNewDeliv}
                      className="bg-[#ffb800] hover:brightness-105 active:scale-95 text-[#181c1e] text-[10px] uppercase font-black tracking-wider px-4 py-2 rounded-lg cursor-pointer transition-all flex items-center gap-1 shadow-xs"
                      id="btn-trigger-new-deliv"
                    >
                      <span className="material-symbols-outlined text-xs">add</span>
                      <span>Registrar Entregable</span>
                    </button>
                  </div>
                  
                  <div className="space-y-3" id="deliverables-deck">
                    {deliverables.length === 0 ? (
                      <div className="p-8 text-center text-xs text-gray-400 font-bold">Sin entregables cargados en este proyecto.</div>
                    ) : (
                      deliverables.map((deliv) => {
                        const isPending = deliv.status === "PENDIENTE" || deliv.status === "PENDIENTE REVISIÓN";
                        return (
                          <div 
                            key={deliv.id} 
                            className="p-5 bg-white border border-gray-200 rounded-xl hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                            id={`deliv-card-${deliv.id}`}
                          >
                            <div className="flex items-center gap-3.5">
                              <div className="w-10 h-10 bg-[#ffb800]/10 rounded-xl flex items-center justify-center text-[#7c5800] shrink-0">
                                <span className="material-symbols-outlined text-xl">description</span>
                              </div>
                              <div>
                                <p className="font-bold text-sm text-[#181c1e] hover:text-[#7c5800] transition-colors">{deliv.name}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                                  Cargado por: {deliv.uploadedBy} • Exigencia: {deliv.lod} ({deliv.dueDate || "Sin vencimiento"})
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className={`font-bold text-[9px] px-2.5 py-1 rounded border uppercase tracking-wider ${
                                deliv.status === "APROBADO" ? "bg-green-50 text-green-700 border-green-200" :
                                deliv.status === "RECHAZADO" ? "bg-red-50 text-red-650 border-red-200" :
                                "bg-amber-50 text-[#7c5800] border-amber-250"
                              }`}>
                                {deliv.status}
                              </span>

                              {/* Operations desk */}
                              <div className="flex gap-1">
                                <button
                                  onClick={() => setShowDelivDetailModal(deliv)}
                                  className="p-1 px-2 hover:bg-gray-150 text-gray-500 hover:text-gray-800 text-[10px] font-bold rounded-md cursor-pointer transition-colors"
                                  title="Ver detalles completos del entregable"
                                  id={`deliv-btn-view-${deliv.id}`}
                                >
                                  Ver
                                </button>
                                <button
                                  onClick={() => handleOpenEditDeliv(deliv)}
                                  className="p-1 px-2 hover:bg-gray-150 text-gray-500 hover:text-gray-800 text-[10px] font-bold rounded-md cursor-pointer transition-colors"
                                  title="Editar entregable"
                                  id={`deliv-btn-edit-${deliv.id}`}
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={() => handleDeleteDeliverable(deliv.id, deliv.name)}
                                  className="p-1 px-2 hover:bg-red-50 text-gray-500 hover:text-red-650 text-[10px] font-bold rounded-md cursor-pointer transition-colors"
                                  title="Eliminar entregable"
                                  id={`deliv-btn-delete-${deliv.id}`}
                                >
                                  Borrar
                                </button>
                              </div>

                              {/* Evaluators actions (Administrador or Gestor roles logic) */}
                              {isPending && (userRole === "Administrador" || userRole === "Gestor") && (
                                <div className="flex gap-1 ml-2 border-l border-gray-200 pl-2">
                                  <button
                                    onClick={() => handleReviewDeliverable(deliv.id, "APROBADO")}
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold text-[9px] px-2.5 py-1 rounded-md select-none cursor-pointer transition-all"
                                    id={`deliv-btn-approve-${deliv.id}`}
                                  >
                                    Aprobar
                                  </button>
                                  <button
                                    onClick={() => handleReviewDeliverable(deliv.id, "RECHAZADO")}
                                    className="bg-red-550 hover:bg-red-650 text-white font-bold text-[9px] px-2.5 py-1 rounded-md select-none cursor-pointer transition-all"
                                    id={`deliv-btn-reject-${deliv.id}`}
                                  >
                                    Rechazar
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: SHARED SUPPORTING FILES */}
              {activeTab === "archivos" && (
                <div className="space-y-4" id="panel-shared-files">
                  
                  {/* File Upload Box drop target */}
                  <div className="border-2 border-dashed border-gray-250 hover:border-[#ffb800] rounded-xl p-8 flex flex-col items-center text-center justify-center hover:bg-gray-55 transition-all cursor-pointer" onClick={triggerLocalFileSelect}>
                    <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">cloud_upload</span>
                    <h5 className="font-bold text-gray-800 text-sm">Cargar Documentación de Apoyo</h5>
                    <p className="text-gray-400 text-xs mt-1 max-w-sm leading-normal">
                      Soporta extensiones <span className="font-bold font-mono">.rvt, .ifc, .nwd, .pdf, .xlsx, .docx</span>. Seleccione o arrastre el archivo.
                    </p>
                    <button 
                      type="button"
                      className="mt-4 bg-[#ffb800] hover:brightness-105 active:scale-95 text-[#181c1e] font-black text-[11px] px-5 py-2.5 rounded-lg cursor-pointer transition-all shadow-xs"
                    >
                      Buscador de Archivos
                    </button>
                  </div>

                  {/* HTML File input concealed */}
                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".rvt,.ifc,.nwd,.pdf,.xlsx,.docx"
                    id="hidden-file-input"
                  />
                  
                  {/* Shared files table database */}
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs" id="shared-files-table-wrapper">
                    <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-200 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                      LISTADO DE ARCHIVOS SOPORTADOS
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse font-medium">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-150 text-[10px] font-bold text-gray-400 tracking-wider">
                            <th className="px-5 py-3.5">NOMBRE DE ARCHIVO</th>
                            <th className="px-5 py-3.5">TAMAÑO</th>
                            <th className="px-5 py-3.5">CARGADO</th>
                            <th className="px-5 py-3.5 text-right">ACCIONES</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {sharedFiles.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="px-5 py-8 text-center text-gray-400 font-bold uppercase tracking-wide">
                                Desprovisto de archivos adjuntos.
                              </td>
                            </tr>
                          ) : (
                            sharedFiles.map((file) => {
                              const isBimModel = file.name.endsWith(".rvt") || file.name.endsWith(".ifc") || file.name.endsWith(".nwd");
                              return (
                                <tr key={file.id} className="hover:bg-gray-50 transition-colors" id={`file-row-${file.id}`}>
                                  <td className="px-5 py-3.5 font-bold text-gray-950">
                                    <div className="flex items-center gap-2.5">
                                      <span className="material-symbols-outlined text-gray-400 text-lg">
                                        {isBimModel ? "view_in_ar" : file.name.endsWith(".pdf") ? "picture_as_pdf" : "description"}
                                      </span>
                                      <span className="truncate max-w-xs">{file.name}</span>
                                    </div>
                                  </td>
                                  <td className="px-5 py-3.5 font-mono text-gray-400 text-[11px] font-bold">{file.size}</td>
                                  <td className="px-5 py-3.5 text-gray-500 font-bold">{file.uploadedAt}</td>
                                  <td className="px-5 py-3.5 text-right">
                                    <div className="flex justify-end gap-1">
                                      <button
                                        onClick={() => window.open(file.url, "_blank")}
                                        className="p-1 px-2.5 hover:bg-gray-100 text-[#7c5800] font-bold rounded"
                                        title="Descargar archivo ordinario"
                                        id={`file-btn-dl-${file.id}`}
                                      >
                                        Descargar
                                      </button>
                                      
                                      {/* Permissions based file deletion */}
                                      {(userRole === "Administrador" || userRole === "Gestor") && (
                                        <button
                                          onClick={() => handleDeleteFile(file.id, file.name)}
                                          className="p-1 px-2.5 hover:bg-red-50 text-red-650 font-bold rounded"
                                          title="Retirar archivo del servidor"
                                          id={`file-btn-delete-${file.id}`}
                                        >
                                          Eliminar
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}

            </div>
          </div>

          {/* SIDEBAR BLOCK: COMMENTS AND STAKEHOLDERS (4 columns) */}
          <div className="col-span-12 lg:col-span-4 space-y-6" id="detail-sidebar-widgets">
            
            {/* BIM COMMENTS PANEL */}
            <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-xs" id="widget-comments-forum">
              <div>
                <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-gray-400">forum</span>
                  <span>Muro General del Proyecto</span>
                </h4>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Espacio de comunicación, consultas técnicas y novedades del equipo.</p>
              </div>

              <div className="space-y-4 max-h-[250px] overflow-y-auto pr-1" id="comments-column-feed">
                {comments.length === 0 ? (
                  <p className="text-xs text-gray-400 italic font-medium p-4 text-center">Bandeja de comentarios del foro limpia.</p>
                ) : (
                  comments.map((comm) => {
                    const isAuthor = comm.author === loggedUser?.name;
                    const isEditing = editingCommentId === comm.id;
                    return (
                      <div key={comm.id} className="bg-gray-50/70 border border-gray-100 p-3 rounded-lg text-xs leading-normal" id={`comment-block-${comm.id}`}>
                        <div className="flex justify-between items-center mb-1 bg-white/40 p-1 rounded">
                          <span className="font-bold text-[#7c5800]">{comm.author}</span>
                          <span className="text-[9px] text-gray-400 font-mono font-bold">{comm.createdAt || comm.date}</span>
                        </div>
                        
                        {isEditing ? (
                          <div className="space-y-1.5 mt-2">
                            <input
                              type="text"
                              value={editingCommentText}
                              onChange={(e) => setEditingCommentText(e.target.value)}
                              className="w-full bg-white border outline-none p-1.5 rounded text-xs text-gray-800 font-medium"
                            />
                            <div className="flex gap-1 justify-end">
                              <button 
                                onClick={() => setEditingCommentId(null)}
                                className="px-2 py-0.5 bg-gray-200 hover:bg-gray-300 rounded text-[10px] font-bold"
                              >
                                Cancelar
                              </button>
                              <button 
                                onClick={() => handleSaveCommentEdit(comm.id)}
                                className="px-2 py-0.5 bg-[#ffb800] text-gray-900 rounded text-[10px] font-bold"
                              >
                                Guardar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-700 font-semibold mb-1 ml-1">{comm.text}</p>
                        )}

                        {isAuthor && !isEditing && (
                          <div className="flex gap-2 justify-end text-[9px] font-bold text-gray-400 border-t border-gray-200/50 pt-1 mt-1.5">
                            <button onClick={() => handleStartEditComment(comm.id, comm.text)} className="hover:text-amber-600 transition-colors bg-transparent">Editar</button>
                            <span>&bull;</span>
                            <button onClick={() => handleDeleteComment(comm.id)} className="hover:text-red-650 transition-colors bg-transparent">Eliminar</button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <form onSubmit={handleAddProjectComment} className="mt-4 flex gap-1" id="project-comment-draft-form">
                <input
                  type="text"
                  required
                  placeholder="Escribir comentario..."
                  value={projectCommentInput}
                  onChange={(e) => setProjectCommentInput(e.target.value)}
                  className="flex-grow bg-gray-50 text-xs px-3.5 py-3 border rounded-lg focus:border-[#ffb800] outline-none text-gray-850 font-semibold"
                />
                <button
                  type="submit"
                  className="bg-[#ffb800] hover:brightness-105 text-[#181c1e] font-bold rounded-lg px-3 flex items-center justify-center cursor-pointer shrink-0"
                >
                  <span className="material-symbols-outlined text-sm font-bold">send</span>
                </button>
              </form>
            </div>

            {/* PROJECT TEAM EDITABLE CARD */}
            <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-xs" id="widget-team-management">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-gray-400">group</span>
                  <span>Equipo de Coordinación</span>
                </h4>
                
                <button
                  onClick={() => setShowAddMemberModal(true)}
                  className="p-1 px-2 border border-gray-200 hover:border-[#ffb800] text-[#7c5800] hover:bg-[#ffb800]/5 text-[9px] uppercase font-black tracking-wider rounded transition-colors cursor-pointer"
                  id="btn-add-team-member"
                >
                  + Agregar
                </button>
              </div>

              {/* Members Deck */}
              <div className="space-y-4" id="team-members-list">
                {(!project.team || project.team.length === 0) ? (
                  <div className="text-center p-3 text-xs text-gray-400 font-bold uppercase tracking-wider">
                    Sin integrantes específicos asignados.
                  </div>
                ) : (
                  project.team.map((member, idx) => {
                    const isEditing = editingMemberIndex === idx;
                    return (
                      <div key={member.userId || idx} className="flex items-center justify-between gap-2 p-2 bg-gray-50/70 border border-gray-100 rounded-xl" id={`member-item-${idx}`}>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center font-bold text-xs text-blue-900 uppercase shrink-0">
                            {member.name ? member.name.slice(0, 2) : "TM"}
                          </div>
                          <div>
                            <p className="font-bold text-xs text-[#1c1c1c]">{member.name}</p>
                            
                            {isEditing ? (
                              <div className="flex gap-1.5 mt-1 items-center">
                                <select
                                  value={editMemberRoleInput}
                                  onChange={(e) => setEditMemberRoleInput(e.target.value)}
                                  className="text-[10px] p-0.5 border outline-none font-bold text-gray-700 bg-white"
                                >
                                  <option value="Responsable">Responsable</option>
                                  <option value="Líder BIM">Líder BIM</option>
                                  <option value="Colaborador">Colaborador</option>
                                </select>
                                <button 
                                  onClick={() => handleUpdateMemberRole(idx)}
                                  className="p-0.5 px-1.5 bg-green-150 hover:bg-[#ffb800]/20 text-xs rounded text-green-700 font-bold"
                                >
                                  OK
                                </button>
                              </div>
                            ) : (
                              <p className="text-[9px] text-[#7c5800] font-black uppercase tracking-wider mt-0.5">{member.role}</p>
                            )}
                          </div>
                        </div>

                        {/* Member modifications Actions */}
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => {
                              setEditingMemberIndex(isEditing ? null : idx);
                              setEditMemberRoleInput(member.role);
                            }}
                            className="p-1 text-gray-400 hover:text-gray-800 transition-colors font-bold"
                            title="Cambiar rol en proyecto"
                            id={`member-btn-edit-${idx}`}
                          >
                            <span className="material-symbols-outlined text-xs">edit</span>
                          </button>
                          
                          <button
                            onClick={() => handleDeleteTeamMember(member.userId, member.name)}
                            className="p-1 text-gray-400 hover:text-red-650 transition-colors font-bold"
                            title="Remover de la mesa técnica"
                            id={`member-btn-delete-${idx}`}
                          >
                            <span className="material-symbols-outlined text-xs">delete</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* RECENT ACTIVITY LOGS feeds replacing direct coordination channel */}
            <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-xs" id="widget-activity-timeline-tracker">
              <h5 className="text-[10px] font-black tracking-widest text-[#7c5800] uppercase mb-4">Actividad Reciente en GMP BIM</h5>
              
              <div className="space-y-4" id="recent-activity-deck">
                {projectLogs.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No se registran actividades previas.</p>
                ) : (
                  projectLogs.map((log) => (
                    <div key={log.id} className="relative pl-5 border-l-2 border-gray-150/80 last:border-l-0 pb-1" id={`audit-log-line-${log.id}`}>
                      {/* Visual node */}
                      <span className={`absolute -left-1.5 top-0.5 w-2.5 h-2.5 rounded-full ${
                        log.type === "success" ? "bg-green-500" :
                        log.type === "error" ? "bg-red-500" : "bg-blue-400"
                      }`}></span>
                      
                      <div className="text-xs">
                        <span className="font-bold text-gray-900">{log.user || "Sistema"}</span>{" "}
                        <span className="text-gray-600 font-medium">{log.action}</span>
                        <p className="text-[9px] text-gray-400 font-mono mt-0.5 font-bold uppercase">{log.time} {log.detail ? `| ${log.detail}` : ""}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div> {/* Closes Sidebar block */}

        </div>
      </main>

      {/* MODAL I: GENERAL PROJECT PARAMETERS EDIT */}
      {showEditProjectModal && (
        <div className="fixed inset-0 bg-gray-950/60 flex items-center justify-center p-4 z-[95]" id="modal-project-editor-container">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-gray-200 overflow-hidden shadow-2xl flex flex-col relative">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#ffb800]"></div>
            <div className="p-6 bg-gray-50 border-b border-gray-250 flex justify-between items-center">
              <h4 className="text-lg font-sans font-black text-gray-950 leading-none">Editar Parámetros de Proyecto</h4>
              <button 
                type="button" 
                onClick={() => setShowEditProjectModal(false)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <span className="material-symbols-outlined font-bold">close</span>
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto max-h-[80vh]">
              <ProjectForm 
                mode="edit"
                initialProject={project}
                onSubmit={handleSaveProjectChanges}
                onCancel={() => setShowEditProjectModal(false)}
                isSubmitting={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL II: ADD MEMBER TO project.team */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-gray-950/60 flex items-center justify-center p-4 z-[95]" id="modal-member-registrator">
          <form 
            onSubmit={handleAddTeamMember}
            className="bg-white rounded-2xl max-w-sm w-full border border-gray-200 overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="p-5 bg-gray-50 border-b flex justify-between items-center">
              <h5 className="font-sans font-black text-gray-950 text-base leading-none">Vincular Coordinador</h5>
              <button type="button" onClick={() => setShowAddMemberModal(false)} className="p-1 text-gray-400 hover:text-gray-950">
                <span className="material-symbols-outlined font-bold text-sm">close</span>
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-1.5">Usuario GMP BIM Disponible</label>
                <select
                  required
                  value={selectedUserIdForMember}
                  onChange={(e) => setSelectedUserIdForMember(e.target.value)}
                  className="w-full border p-2.5 rounded-lg text-xs font-bold bg-white"
                >
                  <option value="">Seleccione un colaborador...</option>
                  {systemUsers.map(u => (
                    <option key={u.id} value={u.id}>{u.name} (Esp: {u.discipline})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-1.5 font-bold">Rol Técnico de Campo</label>
                <select
                  value={memberRoleInput}
                  onChange={(e) => setMemberRoleInput(e.target.value as any)}
                  className="w-full border p-2.5 rounded-lg text-xs font-bold bg-white"
                >
                  <option value="Responsable">Responsable</option>
                  <option value="Líder BIM">Líder BIM</option>
                  <option value="Colaborador">Colaborador</option>
                </select>
              </div>
            </div>

            <div className="p-5 bg-gray-50 border-t flex justify-end gap-2">
              <button 
                type="button" 
                onClick={() => setShowAddMemberModal(false)}
                className="px-3 py-2 text-xs font-bold text-gray-650"
              >
                Cerrar
              </button>
              <button 
                type="submit"
                className="px-4 py-2 bg-[#ffb800] text-[#181c1e] text-xs font-black rounded-lg"
              >
                Guardar Integrante
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL III: TASK COMMENT DIALOGUE THREAD */}
      {selectedTaskForComments && (
        <div className="fixed inset-0 bg-gray-950/60 flex items-center justify-center p-4 z-[95]" id="modal-task-comments">
          <div className="bg-white rounded-2xl max-w-md w-full border border-gray-150 overflow-hidden shadow-2xl flex flex-col h-[480px]">
            <div className="p-5 bg-gray-50 border-b flex justify-between items-center shrink-0">
              <div>
                <span className="text-[9px] font-mono font-bold tracking-wider text-[#a18146] uppercase">MODERACIÓN DE COMENTARIOS</span>
                <h5 className="font-sans font-black text-gray-950 text-sm truncate max-w-sm mt-0.5">{selectedTaskForComments.name}</h5>
              </div>
              <button 
                onClick={() => setSelectedTaskForComments(null)}
                className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-950"
              >
                <span className="material-symbols-outlined font-bold text-sm">close</span>
              </button>
            </div>

            {/* Comments Area list */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3.5 bg-gray-100/30">
              {taskComments.length === 0 ? (
                <div className="text-center p-8 text-xs text-gray-400 italic">No hay aportes ni comentarios todavía sobre este entregable de tarea.</div>
              ) : (
                taskComments.map((tc) => {
                  return (
                    <div key={tc.id} className="p-3 bg-white border border-gray-200 rounded-xl space-y-1 shadow-2xs">
                      <div className="flex justify-between items-center text-[10px] border-b border-gray-50 pb-1">
                        <span className="font-extrabold text-[#7c5800]">{tc.author}</span>
                        <span className="font-mono text-gray-400 font-bold">{tc.createdAt || tc.date}</span>
                      </div>
                      <p className="text-xs font-medium text-gray-700 leading-normal pt-1">{tc.text}</p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleAddTaskComment} className="p-4 bg-white border-t flex gap-2 shrink-0">
              <input
                type="text"
                required
                placeholder="Escriba comentario de tarea..."
                value={taskCommentInput}
                onChange={(e) => setTaskCommentInput(e.target.value)}
                className="flex-grow bg-gray-50 hover:bg-gray-100/50 outline-none text-xs px-3 py-2.5 rounded-lg border focus:border-[#ffb800] text-gray-800 font-bold"
              />
              <button 
                type="submit"
                className="bg-[#ffb800] text-[#181c1e] font-black text-xs px-4 rounded-lg flex items-center justify-center gap-1 shrink-0"
              >
                Enviar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL IV: DETAILED TASK PARAMETER EDITOR */}
      {showEditTaskModal && (
        <div className="fixed inset-0 bg-gray-950/60 flex items-center justify-center p-4 z-[95]" id="modal-task-editor">
          <form 
            onSubmit={handleSaveTaskChanges}
            className="bg-white rounded-2xl max-w-md w-full border border-gray-200 overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="p-5 bg-gray-50 border-b flex justify-between items-center">
              <h5 className="font-sans font-black text-gray-950 text-sm">Editar Tarea de Coordinación</h5>
              <button type="button" onClick={() => setShowEditTaskModal(null)} className="p-1 text-gray-400 hover:text-gray-950">
                <span className="material-symbols-outlined font-bold text-sm">close</span>
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Nombre de la Tarea *</label>
                <input 
                  type="text"
                  required
                  value={editTaskName}
                  onChange={(e) => setEditTaskName(e.target.value)}
                  className="w-full border p-2.5 rounded-lg text-xs font-bold text-gray-950 bg-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Fase del Proyecto *</label>
                <select
                  required
                  value={editTaskPhaseId}
                  onChange={(e) => setEditTaskPhaseId(Number(e.target.value))}
                  className="w-full border p-2.5 rounded-lg text-xs font-bold bg-white text-gray-950"
                >
                  {project.phases && project.phases.length > 0 ? (
                    project.phases.map((ph: any) => (
                      <option key={ph.id} value={ph.id}>{ph.name}</option>
                    ))
                  ) : (
                    <option value="1">Planificación (Default)</option>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Disciplina / Especialidad</label>
                  <select
                    value={editTaskCategory}
                    onChange={(e) => setEditTaskCategory(e.target.value)}
                    className="w-full border p-2.5 rounded-lg text-xs font-bold bg-white"
                  >
                    <option value="Modelado BIM">Modelado BIM</option>
                    <option value="Coordinación">Coordinación</option>
                    <option value="Estructura">Estructura</option>
                    <option value="Ingeniería MEP">Ingeniería MEP</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Asignado A</label>
                  <select
                    value={editTaskAssignedTo}
                    onChange={(e) => setEditTaskAssignedTo(e.target.value)}
                    className="w-full border p-2.5 rounded-lg text-xs font-bold bg-white"
                  >
                    {systemUsers.map(u => (
                      <option key={u.id} value={u.name}>{u.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Estado</label>
                  <select
                    value={editTaskStatus}
                    onChange={(e) => setEditTaskStatus(e.target.value as any)}
                    className="w-full border p-2 rounded-lg text-xs font-bold bg-white"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Execution">Execution</option>
                    <option value="Review">Review</option>
                    <option value="Completed">Completed</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Prioridad</label>
                  <select
                    value={editTaskPriority}
                    onChange={(e) => setEditTaskPriority(e.target.value as any)}
                    className="w-full border p-2 rounded-lg text-xs font-bold bg-white"
                  >
                    <option value="Baja">Baja</option>
                    <option value="Media">Media</option>
                    <option value="Alta">Alta</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Fecha Límite</label>
                  <input
                    type="text"
                    required
                    value={editTaskDueDate}
                    onChange={(e) => setEditTaskDueDate(e.target.value)}
                    className="w-full border p-2 rounded-lg text-xs font-bold font-mono bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="p-5 bg-gray-50 border-t flex justify-end gap-2.5">
              <button 
                type="button" 
                onClick={() => setShowEditTaskModal(null)}
                className="px-3.5 py-2 hover:bg-gray-100 text-xs text-gray-600 font-bold"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="px-4.5 py-2.5 bg-[#ffb800] text-[#181c1e] text-xs font-black rounded-lg"
              >
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL V: REGISTER DELIVERABLE */}
      {showNewDelivModal && (
        <div className="fixed inset-0 bg-gray-950/60 flex items-center justify-center p-4 z-[95]" id="modal-new-deliv-registry">
          <form 
            onSubmit={handleSaveNewDeliverable}
            className="bg-white rounded-2xl max-w-md w-full border border-gray-200 overflow-hidden shadow-2xl flex flex-col animate-fade-in"
          >
            <div className="p-5 bg-gray-50 border-b flex justify-between items-center">
              <h5 className="font-sans font-black text-gray-950 text-sm">Registrar Entregable Oficial</h5>
              <button type="button" onClick={() => setShowNewDelivModal(false)} className="p-1 text-gray-400 hover:text-[#181c1e]">
                <span className="material-symbols-outlined font-bold text-sm">close</span>
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* File Uploader instead of text input */}
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Archivo de Entregable Oficial *</label>
                {delivFileText ? (
                  <div className="border border-green-200 bg-green-50/50 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="material-symbols-outlined text-green-600">verified</span>
                      <div className="truncate">
                        <p className="text-xs font-bold text-gray-800 truncate">{delivName || "Archivo seleccionado"}</p>
                        <p className="text-[9px] text-gray-400 font-mono font-bold">Ruta auto-generada: {delivFileText}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setDelivFileText("");
                        setDelivName("");
                      }}
                      className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 text-xs font-bold shrink-0 cursor-pointer"
                    >
                      Quitar
                    </button>
                  </div>
                ) : (
                  <div 
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = ".rvt,.ifc,.nwd,.pdf,.xlsx,.docx";
                      input.onchange = (e: any) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                          const path = `/uploads/${file.name.replace(/\s+/g, "_")}`;
                          setDelivName(file.name);
                          setDelivFileText(path);
                        };
                        reader.readAsDataURL(file);
                      };
                      input.click();
                    }}
                    className="border border-dashed border-gray-300 hover:border-[#ffb800] rounded-lg p-5 text-center cursor-pointer bg-gray-50 hover:bg-amber-50/20 transition-all space-y-1"
                  >
                    <span className="material-symbols-outlined text-gray-400 text-2xl">cloud_upload</span>
                    <p className="text-xs font-bold text-gray-700">Seleccionar o Arrastrar Archivo</p>
                    <p className="text-[10px] text-gray-400 font-semibold">Formatos permitidos: .rvt, .ifc, .nwd, .pdf, .xlsx, .docx</p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Nombre del Entregable *</label>
                <input 
                  type="text"
                  required
                  placeholder="ej. Planos_Estructuras_LOD400.rvt"
                  value={delivName}
                  onChange={(e) => setDelivName(e.target.value)}
                  className="w-full border p-2.5 rounded-lg text-xs font-bold bg-white text-gray-905"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Descripción Técnica</label>
                <textarea
                  rows={2}
                  placeholder="Detalles sobre interferencias resueltas..."
                  value={delivDesc}
                  onChange={(e) => setDelivDesc(e.target.value)}
                  className="w-full border p-2.5 rounded-lg text-xs font-medium bg-white text-gray-700"
                ></textarea>
              </div>

              {/* Related Task Selector */}
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Tarea Relacionada (Opcional)</label>
                <select
                  value={delivTaskId}
                  onChange={(e) => setDelivTaskId(e.target.value)}
                  className="w-full border p-2.5 rounded-lg text-xs font-bold bg-white text-gray-800"
                >
                  <option value="">-- Sin vincular a ninguna tarea --</option>
                  {tasks.map((tsk) => (
                    <option key={tsk.id} value={tsk.id}>
                      {tsk.name} ({tsk.assignedTo})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Nivel de Confianza (LOD)</label>
                  <select
                    value={delivLod}
                    onChange={(e) => setDelivLod(e.target.value)}
                    className="w-full border p-2.5 rounded-lg text-xs font-bold bg-white text-gray-800"
                  >
                    <option value="LOD 100">LOD 100 (Conceptual)</option>
                    <option value="LOD 200">LOD 200 (Esquema)</option>
                    <option value="LOD 300">LOD 300 (Diseño)</option>
                    <option value="LOD 350">LOD 350 (Coordinación)</option>
                    <option value="LOD 400">LOD 400 (Construcción)</option>
                    <option value="LOD 500">LOD 500 (As-Built)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Fecha de Entrega *</label>
                  <input
                    type="text"
                    required
                    value={delivDueDate}
                    onChange={(e) => setDelivDueDate(e.target.value)}
                    className="w-full border p-2.5 rounded-lg text-xs font-bold font-mono bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="p-5 bg-gray-50 border-t flex justify-end gap-2">
              <button 
                type="button" 
                onClick={() => setShowNewDelivModal(false)}
                className="px-3.5 py-2 hover:bg-gray-100 text-xs text-gray-600 font-bold"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="px-4.5 py-2.5 bg-[#ffb800] text-[#181c1e] text-xs font-black rounded-lg cursor-pointer"
              >
                Guardar Entregable
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL VI: EDIT DELIVERABLE SPECIFICATIONS */}
      {showEditDelivModal && (
        <div className="fixed inset-0 bg-gray-950/60 flex items-center justify-center p-4 z-[95]" id="modal-edit-deliverable">
          <form 
            onSubmit={handleSaveEditDeliverable}
            className="bg-white rounded-2xl max-w-md w-full border border-gray-200 overflow-hidden shadow-2xl flex flex-col animate-fade-in"
          >
            <div className="p-5 bg-gray-50 border-b flex justify-between items-center">
              <h5 className="font-sans font-black text-gray-950 text-sm">Editar Parámetros de Entregable</h5>
              <button type="button" onClick={() => setShowEditDelivModal(null)} className="p-1 text-gray-400 hover:text-gray-950">
                <span className="material-symbols-outlined font-bold text-sm">close</span>
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* File Uploader instead of text input */}
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Archivo de Entregable Oficial *</label>
                {editDelivFileText ? (
                  <div className="border border-green-200 bg-green-50/50 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="material-symbols-outlined text-green-600">verified</span>
                      <div className="truncate">
                        <p className="text-xs font-bold text-gray-800 truncate">{editDelivName || "Archivo seleccionado"}</p>
                        <p className="text-[9px] text-gray-400 font-mono font-bold">Ruta auto-generada: {editDelivFileText}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditDelivFileText("");
                        setEditDelivName("");
                      }}
                      className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 text-xs font-bold shrink-0 cursor-pointer"
                    >
                      Quitar
                    </button>
                  </div>
                ) : (
                  <div 
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = ".rvt,.ifc,.nwd,.pdf,.xlsx,.docx";
                      input.onchange = (e: any) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                          const path = `/uploads/${file.name.replace(/\s+/g, "_")}`;
                          setEditDelivName(file.name);
                          setEditDelivFileText(path);
                        };
                        reader.readAsDataURL(file);
                      };
                      input.click();
                    }}
                    className="border border-dashed border-gray-300 hover:border-[#ffb800] rounded-lg p-5 text-center cursor-pointer bg-gray-50 hover:bg-amber-50/20 transition-all space-y-1"
                  >
                    <span className="material-symbols-outlined text-gray-400 text-2xl">cloud_upload</span>
                    <p className="text-xs font-bold text-gray-700">Seleccionar o Arrastrar Archivo</p>
                    <p className="text-[10px] text-gray-400 font-semibold">Formatos permitidos: .rvt, .ifc, .nwd, .pdf, .xlsx, .docx</p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Nombre del Entregable *</label>
                <input 
                  type="text"
                  required
                  value={editDelivName}
                  onChange={(e) => setEditDelivName(e.target.value)}
                  className="w-full border p-2.5 rounded-lg text-xs font-bold bg-white text-gray-900"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Descripción Técnica</label>
                <textarea
                  rows={2}
                  value={editDelivDesc}
                  onChange={(e) => setEditDelivDesc(e.target.value)}
                  className="w-full border p-2.5 rounded-lg text-xs font-medium bg-white text-gray-750"
                ></textarea>
              </div>

              {/* Related Task Selector */}
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Tarea Relacionada (Opcional)</label>
                <select
                  value={editDelivTaskId}
                  onChange={(e) => setEditDelivTaskId(e.target.value)}
                  className="w-full border p-2.5 rounded-lg text-xs font-bold bg-white text-gray-850"
                >
                  <option value="">-- Sin vincular a ninguna tarea --</option>
                  {tasks.map((tsk) => (
                    <option key={tsk.id} value={tsk.id}>
                      {tsk.name} ({tsk.assignedTo})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-[#1c1c1c] block mb-1">LOD Requerido</label>
                  <select
                    value={editDelivLod}
                    onChange={(e) => setEditDelivLod(e.target.value)}
                    className="w-full border p-2.5 rounded-lg text-[#1c1c1c] text-xs font-bold bg-white"
                  >
                    <option value="LOD 100">LOD 100</option>
                    <option value="LOD 200">LOD 200</option>
                    <option value="LOD 300">LOD 300</option>
                    <option value="LOD 350">LOD 350</option>
                    <option value="LOD 400">LOD 400</option>
                    <option value="LOD 500">LOD 500</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Fecha de Entrega</label>
                  <input
                    type="text"
                    required
                    value={editDelivDueDate}
                    onChange={(e) => setEditDelivDueDate(e.target.value)}
                    className="w-full border p-2.5 rounded-lg text-xs font-bold font-mono bg-white text-gray-905"
                  />
                </div>
              </div>
            </div>

            <div className="p-5 bg-gray-50 border-t flex justify-end gap-2.5">
              <button 
                type="button" 
                onClick={() => setShowEditDelivModal(null)}
                className="px-4 py-2 hover:bg-gray-150 text-xs text-gray-600 font-bold"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="px-5 py-2.5 bg-[#ffb800] text-[#181c1e] text-xs font-black rounded-lg cursor-pointer"
              >
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL VII: VIEW DELIVERABLE DETAILED METADATA */}
      {showDelivDetailModal && (
        <div className="fixed inset-0 bg-gray-950/60 flex items-center justify-center p-4 z-[95]" id="modal-view-deliverable-detail">
          <div className="bg-white rounded-2xl max-w-md w-full border border-gray-150 overflow-hidden shadow-2xl flex flex-col">
            <div className="p-5 bg-gray-50 border-b flex justify-between items-center">
              <h5 className="font-sans font-black text-gray-950 text-sm leading-none">Detalles del Entregable</h5>
              <button type="button" onClick={() => setShowDelivDetailModal(null)} className="p-1 hover:bg-gray-150 rounded">
                <span className="material-symbols-outlined font-bold text-sm">close</span>
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <span className="text-[10px] text-gray-400 font-black block uppercase mb-1">CÓDIGO ENTREGABLE</span>
                <p className="font-mono text-sm text-gray-800 font-bold bg-gray-50 p-2 border rounded-md">{showDelivDetailModal.id}</p>
              </div>

              <div>
                <span className="text-[10px] text-gray-400 font-black block uppercase mb-1">Archivo de Ingeniería</span>
                <p className="font-sans text-base text-gray-950 font-black">{showDelivDetailModal.name}</p>
              </div>

              <div>
                <span className="text-[10px] text-gray-400 font-black block uppercase mb-1">Descripción u Objeto de Envío</span>
                <p className="text-xs text-gray-600 font-medium leading-relaxed bg-[#f8fafc] p-3 border rounded-lg border-gray-100">{showDelivDetailModal.description || "Sin descripción adicional provista."}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-gray-400 font-black block uppercase mb-1">Subido Por</span>
                  <p className="text-xs font-bold text-[#1c1c1c]">{showDelivDetailModal.uploadedBy}</p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-black block uppercase mb-1">Estado</span>
                  <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider mt-1 ${
                    showDelivDetailModal.status === "APROBADO" ? "bg-green-100 text-green-700" :
                    showDelivDetailModal.status === "RECHAZADO" ? "bg-red-50 text-red-600" : "bg-amber-100 text-amber-700"
                  }`}>{showDelivDetailModal.status}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-gray-400 font-black block uppercase mb-1">Fecha Límite</span>
                  <p className="text-xs font-bold font-mono text-gray-905">{showDelivDetailModal.dueDate || "N/A"}</p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-black block uppercase mb-1">Exigencia de Geometría</span>
                  <p className="text-xs font-bold text-[#7c5800] font-sans">{showDelivDetailModal.lod || "LOD 400"}</p>
                </div>
              </div>

              {showDelivDetailModal.fileUrl && (
                <div>
                  <span className="text-[10px] text-gray-400 font-black block uppercase mb-1">Ubicación física / URL</span>
                  <a 
                    href={showDelivDetailModal.fileUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-xs text-[#7c5800] underline font-bold mt-1 block hover:text-black truncate"
                  >
                    {showDelivDetailModal.fileUrl}
                  </a>
                </div>
              )}
            </div>

            <div className="p-5 bg-gray-50 border-t flex justify-end">
              <button
                type="button"
                onClick={() => setShowDelivDetailModal(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-xs font-bold text-gray-700 transition"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL VIII: CREAR NUEVA TAREA */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-gray-950/60 flex items-center justify-center p-4 z-[95]" id="modal-add-task">
          <form 
            onSubmit={handleCreateTaskFromModal}
            className="bg-white rounded-2xl max-w-md w-full border border-gray-200 overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="p-5 bg-gray-50 border-b flex justify-between items-center">
              <h5 className="font-sans font-black text-gray-950 text-sm">Crear Nueva Tarea de Coordinación</h5>
              <button type="button" onClick={() => setShowAddTaskModal(false)} className="p-1 text-gray-400 hover:text-[#181c1e]">
                <span className="material-symbols-outlined font-bold text-sm">close</span>
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Nombre de la Tarea *</label>
                <input 
                  type="text"
                  required
                  placeholder="Ej. Conciliar interferencias de tuberías en nivel 3"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  className="w-full border p-2.5 rounded-lg text-xs font-bold text-gray-950 bg-white focus:border-[#ffb800] outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Descripción de la Tarea</label>
                <textarea
                  rows={2}
                  placeholder="Instrucciones específicas..."
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  className="w-full border p-2.5 rounded-lg text-xs font-semibold bg-white text-gray-750 focus:border-[#ffb800] outline-none"
                ></textarea>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Fase del Proyecto *</label>
                <select
                  required
                  value={newTaskPhaseId}
                  onChange={(e) => setNewTaskPhaseId(Number(e.target.value))}
                  className="w-full border p-2.5 rounded-lg text-xs font-bold bg-white text-gray-950 focus:border-[#ffb800] outline-none"
                >
                  {project.phases && project.phases.length > 0 ? (
                    project.phases.map((ph: any) => (
                      <option key={ph.id} value={ph.id}>{ph.name}</option>
                    ))
                  ) : (
                    <option value="1">Planificación (Default)</option>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Disciplina / Especialidad</label>
                  <select
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value)}
                    className="w-full border p-2.5 rounded-lg text-xs font-bold bg-white focus:border-[#ffb800] outline-none"
                  >
                    <option value="Modelado BIM">Modelado BIM</option>
                    <option value="Coordinación">Coordinación</option>
                    <option value="Estructuras">Estructuras</option>
                    <option value="Ingeniería MEP">Ingeniería MEP</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Asignado A</label>
                  <select
                    value={newTaskAssignedTo}
                    onChange={(e) => setNewTaskAssignedTo(e.target.value)}
                    className="w-full border p-2.5 rounded-lg text-xs font-bold bg-white focus:border-[#ffb800] outline-none"
                  >
                    <option value="">-- Seleccionar --</option>
                    {systemUsers.map(u => (
                      <option key={u.id} value={u.name}>{u.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Estado</label>
                  <select
                    value={newTaskStatus}
                    onChange={(e) => setNewTaskStatus(e.target.value as any)}
                    className="w-full border p-2.5 rounded-lg text-xs font-bold bg-white focus:border-[#ffb800] outline-none"
                  >
                    <option value="Pending">Pendiente</option>
                    <option value="Execution">En Progreso</option>
                    <option value="Review">En Revisión</option>
                    <option value="Completed">Completado</option>
                    <option value="Overdue">Atrasada</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Prioridad</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full border p-2.5 rounded-lg text-xs font-bold bg-white focus:border-[#ffb800] outline-none"
                  >
                    <option value="Baja">Baja</option>
                    <option value="Media">Media</option>
                    <option value="Alta">Alta</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Fecha Límite</label>
                  <input
                    type="date"
                    required
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="w-full border p-2 rounded-lg text-xs font-bold font-mono bg-white text-[#1c1c1c] focus:border-[#ffb800] outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="p-5 bg-gray-50 border-t flex justify-end gap-2.5">
              <button 
                type="button" 
                onClick={() => setShowAddTaskModal(false)}
                className="px-3.5 py-2 hover:bg-gray-100 text-xs text-gray-600 font-bold"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                disabled={isSaving}
                className="px-4.5 py-2.5 bg-[#ffb800] text-[#181c1e] text-xs font-black rounded-lg hover:brightness-105 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {isSaving && <span className="animate-spin border-2 border-[#181c1e] border-t-transparent rounded-full w-3.5 h-3.5"></span>}
                <span>Crear Tarea</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL IX: CONFIRMACIÓN ELIMINAR FASE */}
      {phaseToDelete && (
        <div className="fixed inset-0 bg-gray-950/60 flex items-center justify-center p-4 z-[95]" id="modal-delete-phase-confirm">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-gray-150 p-6 shadow-2xl space-y-4">
            <div className="text-red-500">
              <span className="material-symbols-outlined text-4xl">warning</span>
            </div>
            <div className="space-y-1">
              <h4 className="font-sans font-black text-gray-900 text-sm">¿Desea eliminar la fase "{phaseToDelete.name}"?</h4>
              <p className="text-xs text-gray-500 font-medium">Esta acción eliminará de forma irreversible esta etapa. Las fases subsiguientes se renumerarán automáticamente.</p>
            </div>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setPhaseToDelete(null)}
                className="px-4 py-2 hover:bg-gray-100 rounded-lg text-xs text-gray-600 font-bold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => confirmDeletePhase(phaseToDelete.id)}
                disabled={isSaving}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 active:scale-95 disabled:opacity-50 rounded-lg text-xs font-black text-white flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {isSaving && <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-3.5 h-3.5"></span>}
                <span>Eliminar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL X: CONFIRMACIÓN ELIMINAR TAREA */}
      {showDeleteTaskConfirm && (
        <div className="fixed inset-0 bg-gray-950/60 flex items-center justify-center p-4 z-[95]" id="modal-delete-task-confirm">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-gray-150 p-6 shadow-2xl space-y-4">
            <div className="text-red-500">
              <span className="material-symbols-outlined text-4xl">warning</span>
            </div>
            <div className="space-y-1">
              <h4 className="font-sans font-black text-gray-900 text-sm">¿Desea eliminar la tarea "{showDeleteTaskConfirm.name}"?</h4>
              <p className="text-xs text-gray-500 font-medium">Esta acción retirará la tarea del equipo de forma definitiva.</p>
            </div>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteTaskConfirm(null)}
                className="px-4 py-2 hover:bg-gray-100 rounded-lg text-xs text-gray-600 font-bold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteTask}
                disabled={isSaving}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 active:scale-95 disabled:opacity-50 rounded-lg text-xs font-black text-white flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {isSaving && <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-3.5 h-3.5"></span>}
                <span>Eliminar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL XI: CONFIRMACIÓN ELIMINAR ENTREGABLE */}
      {showDeleteDeliverableConfirm && (
        <div className="fixed inset-0 bg-gray-950/60 flex items-center justify-center p-4 z-[95]" id="modal-delete-deliverable-confirm">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-gray-150 p-6 shadow-2xl space-y-4">
            <div className="text-red-500">
              <span className="material-symbols-outlined text-4xl">warning</span>
            </div>
            <div className="space-y-1">
              <h4 className="font-sans font-black text-gray-900 text-sm">¿Desea eliminar el entregable "{showDeleteDeliverableConfirm.name}"?</h4>
              <p className="text-xs text-gray-500 font-medium">Esta acción removerá el archivo técnico de los registros del proyecto.</p>
            </div>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteDeliverableConfirm(null)}
                className="px-4 py-2 hover:bg-gray-100 rounded-lg text-xs text-gray-600 font-bold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteDeliverable}
                disabled={isSaving}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 active:scale-95 disabled:opacity-50 rounded-lg text-xs font-black text-white flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {isSaving && <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-3.5 h-3.5"></span>}
                <span>Eliminar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL XII: CONFIRMACIÓN ELIMINAR ARCHIVO */}
      {showDeleteFileConfirm && (
        <div className="fixed inset-0 bg-gray-950/60 flex items-center justify-center p-4 z-[95]" id="modal-delete-file-confirm">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-gray-150 p-6 shadow-2xl space-y-4">
            <div className="text-red-500">
              <span className="material-symbols-outlined text-4xl">warning</span>
            </div>
            <div className="space-y-1">
              <h4 className="font-sans font-black text-gray-900 text-sm">¿Confirmar eliminación absoluta de "{showDeleteFileConfirm.name}"?</h4>
              <p className="text-xs text-gray-500 font-medium">Este archivo adjunto de soporte será eliminado de forma definitiva del servidor.</p>
            </div>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteFileConfirm(null)}
                className="px-4 py-2 hover:bg-gray-100 rounded-lg text-xs text-gray-600 font-bold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteFile}
                disabled={isSaving}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 active:scale-95 disabled:opacity-50 rounded-lg text-xs font-black text-white flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {isSaving && <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-3.5 h-3.5"></span>}
                <span>Eliminar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL XIII: CONFIRMACIÓN ELIMINAR COMENTARIO */}
      {showDeleteCommentConfirm && (
        <div className="fixed inset-0 bg-gray-950/60 flex items-center justify-center p-4 z-[95]" id="modal-delete-comment-confirm">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-gray-150 p-6 shadow-2xl space-y-4">
            <div className="text-red-500">
              <span className="material-symbols-outlined text-4xl">warning</span>
            </div>
            <div className="space-y-1">
              <h4 className="font-sans font-black text-gray-900 text-sm">¿Desea eliminar este comentario?</h4>
              <p className="text-xs text-gray-500 font-medium">Esta acción no se puede deshacer.</p>
            </div>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteCommentConfirm(null)}
                className="px-4 py-2 hover:bg-gray-100 rounded-lg text-xs text-gray-600 font-bold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteComment}
                disabled={isSaving}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 active:scale-95 disabled:opacity-50 rounded-lg text-xs font-black text-white flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {isSaving && <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-3.5 h-3.5"></span>}
                <span>Eliminar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL XIV: CONFIRMACIÓN RETIRAR INTEGRANTE */}
      {showDeleteMemberConfirm && (
        <div className="fixed inset-0 bg-gray-950/60 flex items-center justify-center p-4 z-[95]" id="modal-delete-member-confirm">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-gray-150 p-6 shadow-2xl space-y-4">
            <div className="text-red-500">
              <span className="material-symbols-outlined text-4xl">warning</span>
            </div>
            <div className="space-y-1">
              <h4 className="font-sans font-black text-gray-900 text-sm">¿Desea retirar a {showDeleteMemberConfirm.name} de este proyecto?</h4>
              <p className="text-xs text-gray-500 font-medium">Esta acción lo retirará del equipo y sus privilegios de coordinación en este proyecto.</p>
            </div>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteMemberConfirm(null)}
                className="px-4 py-2 hover:bg-gray-100 rounded-lg text-xs text-gray-600 font-bold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteTeamMember}
                disabled={isSaving}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 active:scale-95 disabled:opacity-50 rounded-lg text-xs font-black text-white flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {isSaving && <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-3.5 h-3.5"></span>}
                <span>Retirar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL XV: SOLICITAR CORRECCIÓN DE ENTREGABLE */}
      {correctionDeliverable && (
        <div className="fixed inset-0 bg-gray-950/60 flex items-center justify-center p-4 z-[95]" id="modal-request-correction">
          <form 
            onSubmit={async (e) => {
              e.preventDefault();
              if (!correctionComment.trim()) {
                toast.warning("Por favor ingrese el motivo de la corrección.");
                return;
              }
              await handleReviewDeliverable(correctionDeliverable.id, "PENDIENTE", correctionComment.trim());
              setCorrectionComment("");
              setCorrectionDeliverable(null);
            }}
            className="bg-white rounded-2xl max-w-md w-full border border-gray-150 overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="p-5 bg-gray-50 border-b flex justify-between items-center">
              <h5 className="font-sans font-black text-gray-950 text-sm">Solicitar Corrección Técnico-Formativa</h5>
              <button type="button" onClick={() => setCorrectionDeliverable(null)} className="p-1 hover:bg-gray-150 rounded text-gray-400 hover:text-black">
                <span className="material-symbols-outlined font-bold text-sm">close</span>
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-amber-850 text-xs font-semibold leading-relaxed">
                El entregable <strong>"{correctionDeliverable.name}"</strong> cambiará su estado a <strong>PENDIENTE</strong>. El responsable de la tarea asignada podrá subir una nueva revisión del archivo.
              </div>

              <div>
                <label className="text-[10px] text-gray-400 font-black block uppercase mb-1">Motivo de Corrección (Obligatorio) *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detalle los errores, colisiones o cambios requeridos..."
                  value={correctionComment}
                  onChange={(e) => setCorrectionComment(e.target.value)}
                  className="w-full border p-2.5 rounded-lg text-xs font-medium bg-white text-gray-900 focus:border-[#ffb800] outline-none"
                ></textarea>
              </div>
            </div>

            <div className="p-5 bg-gray-50 border-t flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setCorrectionDeliverable(null)}
                className="px-4 py-2 hover:bg-gray-100 rounded-lg text-xs text-gray-600 font-bold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 bg-[#ffb800] hover:brightness-105 disabled:opacity-50 text-[#181c1e] text-xs font-black rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {isSaving && <span className="animate-spin border-2 border-[#181c1e] border-t-transparent rounded-full w-3.5 h-3.5"></span>}
                <span>Solicitar Corrección</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
