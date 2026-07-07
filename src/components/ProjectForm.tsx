import React, { useState, useEffect } from "react";
import { Project, User } from "../types";
import { api } from "../api";

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

interface ProjectFormProps {
  mode: "create" | "edit";
  initialProject?: Partial<Project>;
  onSubmit: (projectData: any) => Promise<void> | void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function ProjectForm({
  mode,
  initialProject,
  onSubmit,
  onCancel,
  isSubmitting = false
}: ProjectFormProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [responsible, setResponsible] = useState("");
  const [status, setStatus] = useState<Project["status"]>("En Curso");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [bepCompliance, setBepCompliance] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Load users for the PM selection dropdown
  useEffect(() => {
    async function loadUsers() {
      try {
        const u = await api.getUsers();
        setUsers(u);
        if (u.length > 0 && !responsible && mode === "create") {
          setResponsible(u[0].name);
        }
      } catch (err) {
        console.error("Error loading users in ProjectForm:", err);
      }
    }
    loadUsers();
  }, [mode, responsible]);

  // Load or generate initial fields
  useEffect(() => {
    if (mode === "edit" && initialProject) {
      setName(initialProject.name || "");
      setCode(initialProject.code || "");
      setDescription(initialProject.description || "");
      setResponsible(initialProject.responsible || "");
      setStatus(initialProject.status || "En Curso");
      setStartDate(initialProject.startDate || "");
      setDueDate(initialProject.dueDate || "");
      setBepCompliance(!!(initialProject as any).bepCompliance);
    } else {
      // Create mode
      setName("");
      // Generate dynamic code using actual current year, no hardcoded year
      const currentYear = new Date().getFullYear();
      const randomId = Math.floor(Math.random() * 900) + 100;
      setCode(`PRJ-${currentYear}-${randomId}`);
      setDescription("");
      setResponsible(initialProject?.responsible || "");
      setStatus("En Curso");
      // Start dates as empty, or start date can optionally be today
      const today = new Date();
      const pad = (num: number) => num.toString().padStart(2, "0");
      const todayFormatted = `${pad(today.getDate())}/${pad(today.getMonth() + 1)}/${today.getFullYear()}`;
      setStartDate(todayFormatted); // Starts as current date
      setDueDate(""); // Ends empty
      setBepCompliance(true);
    }
  }, [mode, initialProject]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg("El nombre del proyecto es obligatorio.");
      return;
    }
    if (!code.trim()) {
      setErrorMsg("El código del proyecto es obligatorio.");
      return;
    }
    if (!description.trim()) {
      setErrorMsg("La descripción del proyecto es obligatoria.");
      return;
    }
    if (!responsible.trim()) {
      setErrorMsg("Debe seleccionar un Project Manager responsable.");
      return;
    }
    if (!dueDate.trim()) {
      setErrorMsg("La fecha de finalización es obligatoria.");
      return;
    }

    const selectedUser = users.find(u => u.name === responsible);
    const responsibleUserId = selectedUser ? selectedUser.id : undefined;

    // Submit payload
    const payload = {
      name: name.trim(),
      code: code.trim(),
      description: description.trim(),
      responsible,
      responsibleUserId,
      status,
      startDate: startDate.trim(),
      dueDate: dueDate.trim(),
      bepCompliance,
      phaseName: initialProject?.phaseName || "PLANIFICACIÓN"
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMsg && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 text-xs font-bold text-red-700 rounded-r">
          {errorMsg}
        </div>
      )}

      {/* SECTION A: IDENTITY */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-150 pb-2">
          <span className="w-5 h-5 bg-amber-50 rounded text-[#7c5800] flex items-center justify-center font-bold text-xs select-none">A</span>
          <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider">Identidad del Proyecto</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1 md:col-span-2 flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest" htmlFor="project_name_input">
              Nombre del Proyecto *
            </label>
            <input
              id="project_name_input"
              type="text"
              required
              placeholder="ej. Residencial Los Sauces - Fase II"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-gray-50 hover:bg-gray-100/30 focus:bg-white border focus:border-[#ffb800] outline-none text-xs rounded-lg px-3 py-2.5 font-semibold text-gray-800 transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest" htmlFor="project_code_input">
              Código del Proyecto *
            </label>
            <input
              id="project_code_input"
              type="text"
              required
              placeholder="ej. PRJ-2026-001"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="bg-gray-50 border focus:border-[#ffb800] outline-none text-xs rounded-lg px-3 py-2.5 font-bold font-mono text-gray-700 transition-all"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest" htmlFor="project_desc_input">
            Descripción *
          </label>
          <textarea
            id="project_desc_input"
            rows={3}
            required
            placeholder="Indique las especificaciones del modelado, alcances, entregables, etc..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-gray-50 hover:bg-gray-100/30 focus:bg-white border focus:border-[#ffb800] outline-none text-xs rounded-lg p-3 font-semibold text-gray-800 leading-relaxed transition-all"
          />
        </div>
      </div>

      {/* SECTION B: EXECUTION */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-150 pb-2">
          <span className="w-5 h-5 bg-blue-50 rounded text-blue-700 flex items-center justify-center font-bold text-xs select-none">B</span>
          <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider">Ejecución y Parámetros Operativos</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest" htmlFor="project_pm_input">
              Project Manager Responsable *
            </label>
            <select
              id="project_pm_input"
              value={responsible}
              onChange={(e) => setResponsible(e.target.value)}
              className="bg-gray-50 border focus:border-[#ffb800] outline-none rounded-lg p-2.5 text-xs font-bold text-gray-700"
            >
              <option value="" disabled>Seleccione un responsable...</option>
              {users.map((u) => (
                <option key={u.id} value={u.name}>
                  {u.name} ({u.discipline || u.role})
                </option>
              ))}
              {/* Fallback mock PMs if empty */}
              {users.length === 0 && (
                <>
                  <option value="Ing. Marta Sánchez">Ing. Marta Sánchez (Civil)</option>
                  <option value="Arq. Roberto Gómez">Arq. Roberto Gómez (Arq.)</option>
                  <option value="Ing. Lucía Méndez">Ing. Lucía Méndez (MEP)</option>
                  <option value="Ing. Carlos Mendoza">Ing. Carlos Mendoza (Sistemas)</option>
                </>
              )}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest" htmlFor="project_status_input">
              Estado *
            </label>
            <select
              id="project_status_input"
              value={status}
              onChange={(e) => setStatus(e.target.value as Project["status"])}
              className="bg-gray-50 border focus:border-[#ffb800] outline-none rounded-lg p-2.5 text-xs font-bold text-gray-700"
            >
              <option value="Ejecución">Ejecución</option>
              <option value="En Curso">En Curso</option>
              <option value="Pendiente Approval">Pendiente de Aprobación</option>
              <option value="Completado">Completado</option>
              <option value="Retrasado">Retrasado</option>
              <option value="Revisión">Revisión</option>
              <option value="Atrasado">Atrasado</option>
              <option value="En Pausa">En Pausa</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest" htmlFor="project_start_date_input">
              Fecha de Inicio
            </label>
            <input
              id="project_start_date_input"
              type="date"
              value={toInputDateFormat(startDate)}
              onChange={(e) => setStartDate(toDisplayDateFormat(e.target.value))}
              className="bg-gray-50 border focus:border-[#ffb800] outline-none rounded-lg p-2.5 text-xs font-semibold text-gray-700 font-mono"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest" htmlFor="project_due_date_input">
              Fecha Final *
            </label>
            <input
              id="project_due_date_input"
              type="date"
              required
              value={toInputDateFormat(dueDate)}
              onChange={(e) => setDueDate(toDisplayDateFormat(e.target.value))}
              className="bg-gray-50 border focus:border-[#ffb800] outline-none rounded-lg p-2.5 text-xs font-semibold text-gray-700 font-mono"
            />
          </div>
        </div>
      </div>

      {/* SECTION C: GOVERNANCE */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-150 pb-2">
          <span className="w-5 h-5 bg-emerald-50 rounded text-emerald-700 flex items-center justify-center font-bold text-xs select-none">C</span>
          <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider">Gobernanza</h4>
        </div>

        <div className="bg-gray-50 border border-gray-150 rounded-xl p-4 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h5 className="font-bold text-xs text-[#181c1e] flex items-center gap-1">
              <span className="material-symbols-outlined text-green-600 text-sm">gavel</span>
              <span>Plan de Ejecución BIM (BEP)</span>
            </h5>
            <p className="text-gray-400 text-[10px] leading-relaxed">
              Adherirse formalmente a las directivas del estándar ISO 19650 de administración de la información y flujos colaborativos del modelo.
            </p>
          </div>
          
          <div className="flex items-center gap-2 mt-1 shrink-0">
            <input
              id="project_bep_compliance"
              type="checkbox"
              checked={bepCompliance}
              onChange={(e) => setBepCompliance(e.target.checked)}
              className="w-4 h-4 text-[#7c5800] border-gray-300 focus:ring-[#ffb800] rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-150">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 font-bold text-xs text-gray-600 transition-colors cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-[#ffb800] text-[#6d4c00] font-black rounded-lg text-xs hover:brightness-105 active:scale-95 transition-all shadow-sm flex items-center gap-1.5 uppercase tracking-wider disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <span className="material-symbols-outlined text-xs animate-spin font-bold">autorenew</span>
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-xs font-bold">save</span>
              <span>{mode === "create" ? "CREAR PROYECTO" : "GUARDAR CAMBIOS"}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
