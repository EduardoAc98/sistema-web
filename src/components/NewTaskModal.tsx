import React, { useState, useEffect } from "react";
import { api } from "../api";
import { Project, User } from "../types";
import { toast } from "./Toast";

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated?: () => void;
}

export default function NewTaskModal({ isOpen, onClose, onTaskCreated }: NewTaskModalProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  // Field states
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [name, setName] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("Media");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadFormData();
    }
  }, [isOpen]);

  const loadFormData = async () => {
    try {
      const [allProjects, allUsers] = await Promise.all([
        api.getProjects(),
        api.getUsers()
      ]);

      // Filter: non-completed projects (status !== "Completado")
      const activeProj = allProjects.filter((p) => p.status !== "Completado");
      setProjects(activeProj);
      if (activeProj.length > 0) {
        setSelectedProjectId(activeProj[0].id);
      }

      setUsers(allUsers);
      if (allUsers.length > 0) {
        setAssignedTo(allUsers[0].name);
      }
    } catch (err) {
      console.error("Error loading task creation data", err);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !name.trim() || !assignedTo || !dueDate) {
      toast.warning("Por favor complete todos los campos requeridos.");
      return;
    }

    try {
      setSaving(true);
      
      // Let's format the task object for our API
      // Category is the Priority or field
      const formattedDate = new Date(dueDate).toLocaleDateString("es-PE", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });

      await api.createTask(selectedProjectId, {
        name: name.trim(),
        category: `Prioridad: ${priority}`,
        assignedTo,
        dueDate: formattedDate,
        phaseId: 1
      });

      toast.success("Tarea creada exitosamente en la base de datos.");
      setName("");
      setDueDate("");
      
      if (onTaskCreated) {
        onTaskCreated();
      }
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Error al intentar registrar la tarea.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#181c1e]/70 backdrop-blur-xs flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-lg overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Block */}
        <div className="bg-[#181c1e] text-white px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#ffb800] text-2xl font-bold">add_task</span>
            <div>
              <h3 className="font-bold text-base leading-none">Nueva Tarea del Sistema</h3>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Registrar hito operativo para BIM</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-[#ffb800] p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Form panel */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Project selection */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide">Proyecto Asociado</label>
            {projects.length === 0 ? (
              <p className="text-xs text-red-500 font-bold">No hay proyectos activos (no completados) disponibles.</p>
            ) : (
              <select
                required
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs font-semibold focus:border-[#ffb800] outline-none"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.code}] {p.name} ({p.status})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Task Name / Description */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide">Descripción / Nombre de la Tarea</label>
            <input
              type="text"
              required
              placeholder="Ej. Modelado de tuberías MEP e interferencias en Nivel 2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 focus:border-[#ffb800] rounded-lg p-2.5 text-xs font-semibold outline-none transition-all placeholder:text-gray-350"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Responsible user selection */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide">Responsable Asignado</label>
              <select
                required
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs font-semibold focus:border-[#ffb800] outline-none"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.name}>
                    {u.name} ({u.discipline})
                  </option>
                ))}
              </select>
            </div>

            {/* Priority selection */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide">Prioridad</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs font-semibold focus:border-[#ffb800] outline-none"
              >
                <option value="Alta">Alta (Urgente)</option>
                <option value="Media">Media (Estándar)</option>
                <option value="Baja">Baja</option>
              </select>
            </div>

            {/* Due date selector */}
            <div className="col-span-2 space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide">Fecha Límite de Entrega</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 focus:border-[#ffb800] rounded-lg p-2.5 text-xs font-semibold outline-none transition-all"
              />
            </div>
          </div>

          {/* Footer controls inside dialog */}
          <div className="border-t border-gray-200 pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-250 text-gray-600 rounded-lg font-bold text-xs hover:bg-gray-100 transition-colors cursor-pointer bg-white"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-[#ffb800] text-[#6d4c00] font-black rounded-lg text-xs hover:brightness-105 transition-all cursor-pointer border-none disabled:opacity-50"
            >
              {saving ? "Creando..." : "Crear Tarea"}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
