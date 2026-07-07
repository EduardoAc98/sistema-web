import React, { useState, useEffect } from "react";
import { AppScreen, User, Log } from "../types";
import { api, getSavedUser } from "../api";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { toast } from "../components/Toast";

interface UsersScreenProps {
  onNavigate: (screen: AppScreen) => void;
  users?: User[];
}

export default function UsersScreen({ onNavigate }: UsersScreenProps) {
  const loggedUser = getSavedUser();
  const isAdmin = loggedUser && loggedUser.role === "Administrador";

  const [usersList, setUsersList] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<Log[]>([]);
  const [disciplinesList, setDisciplinesList] = useState<string[]>([
    "Modelado BIM",
    "Ingeniería Civil",
    "Arquitectura",
    "Instalaciones MEP",
    "Gestión de Proyectos"
  ]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("Todos");
  const [filterDiscipline, setFilterDiscipline] = useState<string>("Todas");
  const [filterStatus, setFilterStatus] = useState<string>("Todos");
  const [associationUser, setAssociationUser] = useState<User | null>(null);
  const [auditSearchQuery, setAuditSearchQuery] = useState("");

  // Modal Control States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null); // null means Registering, User object means Editing

  // Modal Form Inputs
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState<User["role"]>("Colaborador");
  const [formDiscipline, setFormDiscipline] = useState("Modelado BIM");
  const [formStatus, setFormStatus] = useState<User["status"]>("Activo");
  const [isSaving, setIsSaving] = useState(false);

  // Recommendation advisor box state
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allUsers, logs, disciplines] = await Promise.all([
        api.getUsers(),
        api.getLogs(),
        api.getDisciplines().catch(() => [
          "Modelado BIM",
          "Ingeniería Civil",
          "Arquitectura",
          "Instalaciones MEP",
          "Gestión de Proyectos"
        ])
      ]);
      setUsersList(allUsers);
      setAuditLogs(logs);
      setDisciplinesList(disciplines);
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error("Error al cargar los datos del sistema.");
      setLoading(false);
    }
  };

  const handleOpenRegister = () => {
    setEditingUser(null);
    setFormName("");
    setFormEmail("");
    setFormRole("Colaborador");
    setFormDiscipline(disciplinesList[0] || "Modelado BIM");
    setFormStatus("Activo");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (usr: User) => {
    setEditingUser(usr);
    setFormName(usr.name);
    setFormEmail(usr.email);
    setFormRole(usr.role);
    setFormDiscipline(usr.discipline);
    setFormStatus(usr.status);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      toast.warning("Por favor complete todos los campos obligatorios.");
      return;
    }

    // Frontend Duplicate Email Validation
    const normalizedEmail = formEmail.trim().toLowerCase();
    const isDuplicate = usersList.some(
      (u) => u.email.toLowerCase().trim() === normalizedEmail && (!editingUser || u.id !== editingUser.id)
    );
    if (isDuplicate) {
      toast.error("Ya existe un usuario registrado con ese correo electrónico.");
      return;
    }

    try {
      setIsSaving(true);
      if (editingUser) {
        // Edit Mode
        await api.updateUser(editingUser.id, {
          name: formName.trim(),
          email: formEmail.trim(),
          role: formRole,
          discipline: formDiscipline,
          status: formStatus
        });
        toast.success("Usuario actualizado correctamente.");
      } else {
        // Register Mode
        await api.createUser({
          name: formName.trim(),
          email: formEmail.trim(),
          role: formRole,
          discipline: formDiscipline
        });
        toast.success("Usuario registrado exitosamente.");
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || (editingUser ? "Error al intentar modificar el usuario." : "Error al intentar registrar el usuario."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: User["status"], name: string) => {
    try {
      const nextStatus: User["status"] = currentStatus === "Activo" ? "Inactivo" : "Activo";
      await api.updateUser(id, { status: nextStatus });
      toast.success(`Estado de ${name} actualizado a ${nextStatus}.`);
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "No se pudo cambiar el estado del usuario.");
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    const usr = usersList.find((u) => u.id === id);
    if (usr?.hasRelations) {
      toast.error("Este usuario posee información asociada dentro del sistema. Para conservar la trazabilidad de los proyectos solo puede cambiarse su estado a Inactivo.");
      return;
    }

    if (!window.confirm(`¿Está seguro de que desea eliminar a "${name}" de forma permanente del sistema?`)) {
      return;
    }
    try {
      await api.deleteUser(id);
      toast.success("Usuario eliminado correctamente.");
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Error al intentar eliminar el usuario.");
    }
  };

  // Simulates Gemini Recommendation Engine
  const askAiRecommendation = () => {
    setAiAnalyzing(true);
    setTimeout(() => {
      setAiSuggestion(
        "Sugerencia AI: Se recomienda asignar a Carlos Vargas (Modelador BIM) en el Proyecto 'Residencial Las Palmas' ante el retraso de la Fase II. Considere habilitar Rol de 'Gestor' para Arq. Javier Solis con el fin de optimizar aprobaciones técnicas."
      );
      setAiAnalyzing(false);
    }, 800);
  };

  // Combinable Filtering logic
  const filteredUsers = usersList.filter((usr) => {
    // Real-time search query (by name or email)
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      usr.name.toLowerCase().includes(query) ||
      usr.email.toLowerCase().includes(query);

    // Combines with Role filter
    const matchesRole = filterRole === "Todos" || usr.role === filterRole;

    // Combines with Discipline filter
    const matchesDiscipline = filterDiscipline === "Todas" || usr.discipline === filterDiscipline;

    // Combines with Status filter
    const matchesStatus = filterStatus === "Todos" || usr.status === filterStatus;

    return matchesSearch && matchesRole && matchesDiscipline && matchesStatus;
  });

  const filteredAuditLogs = auditLogs.filter((log) => {
    if (!auditSearchQuery) return true;
    const query = auditSearchQuery.toLowerCase().trim();
    return (
      (log.user || "").toLowerCase().includes(query) ||
      (log.action || "").toLowerCase().includes(query) ||
      (log.detail || "").toLowerCase().includes(query)
    );
  });

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#f7fafc] text-[#181c1e] font-sans">
        <Sidebar currentScreen={AppScreen.USERS_AND_ROLES} onNavigate={onNavigate} />
        <Header 
          userName={loggedUser?.name || "Usuario"} 
          userRole={loggedUser?.role || "Colaborador"} 
          onNavigate={onNavigate}
        />
        <main className="ml-[240px] pt-32 px-12 flex flex-col items-center justify-center text-center h-[70vh]">
          <span className="material-symbols-outlined text-red-500 text-6xl mb-4">gavel</span>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Acceso Restringido</h1>
          <p className="text-gray-500 max-w-md mt-2">
            La sección de Gestión de Usuarios y Roles está limitada exclusivamente para usuarios con Rol <strong>Administrador</strong> bajo norma ISO 19650 de GMP.
          </p>
          <button 
            onClick={() => onNavigate(AppScreen.DASHBOARD)} 
            className="mt-6 bg-[#ffb800] text-[#181c1e] font-black px-6 py-3 rounded-lg text-xs hover:brightness-105 transition-all cursor-pointer"
          >
            Volver al Dashboard
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7fafc] text-[#181c1e] font-sans selection:bg-[#ffb800] selection:text-[#6d4c00]">
      {/* Sidebar Selector */}
      <Sidebar currentScreen={AppScreen.USERS_AND_ROLES} onNavigate={onNavigate} />

      {/* Header Container */}
      <Header 
        userName="Arq. Javier Solis" 
        userRole="Project Manager" 
        onNavigate={onNavigate}
      />

      {/* Main Panel Content */}
      <main className="ml-[240px] pt-24 px-8 pb-12 transition-soft">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-gray-400 mb-6 uppercase text-[10px] tracking-widest font-bold">
          <button onClick={() => onNavigate(AppScreen.DASHBOARD)} className="hover:text-[#7c5800] cursor-pointer">
            Dashboard
          </button>
          <span className="material-symbols-outlined text-xs select-none">chevron_right</span>
          <span className="text-[#7c5800]">Usuarios</span>
        </div>

        {/* Header Module Title & Action Button */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-3xl font-bold tracking-tight text-[#181c1e]">Módulo de Usuarios</h3>
            <p className="text-gray-500 text-sm mt-1">
              Gestione perfiles profesionales, asigne roles técnicos y supervise accesos en la plataforma federada GMP BIM.
            </p>
          </div>
          <button
            onClick={handleOpenRegister}
            className="self-start sm:self-center bg-[#ffb800] text-[#181c1e] text-xs font-black px-4.5 py-3 rounded-lg hover:brightness-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-sm font-black">person_add</span>
            <span>Registrar Nuevo Usuario</span>
          </button>
        </div>

        {/* Real-time Search & Multi-Filters Control Bar */}
        <div className="bg-white border border-gray-200 rounded-xl p-4.5 mb-6 shadow-2xs flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Real-time Search box */}
          <div className="relative w-full md:w-96">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm select-none">
              search
            </span>
            <input
              type="text"
              placeholder="Buscar usuarios por nombre o correo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-[#ffb800] focus:bg-white outline-none rounded-lg text-xs font-semibold text-gray-800 transition-all placeholder:text-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-650"
              >
                <span className="material-symbols-outlined text-sm font-bold">close</span>
              </button>
            )}
          </div>

          {/* Combined Filters Options */}
          <div className="w-full md:w-auto flex flex-wrap gap-3 items-center justify-start md:justify-end">
            
            {/* Filter by Role */}
            <div className="flex items-center gap-1.5">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Rol</label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-xs font-bold text-gray-700 focus:border-[#ffb800] outline-none cursor-pointer hover:bg-white transition-all"
              >
                <option value="Todos">Todos</option>
                <option value="Administrador">Administrador</option>
                <option value="Gestor">Gestor</option>
                <option value="Colaborador">Colaborador</option>
              </select>
            </div>

            {/* Filter by Discipline */}
            <div className="flex items-center gap-1.5">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Disciplina</label>
              <select
                value={filterDiscipline}
                onChange={(e) => setFilterDiscipline(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-xs font-bold text-gray-700 focus:border-[#ffb800] outline-none cursor-pointer hover:bg-white transition-all"
              >
                <option value="Todas">Todas</option>
                {disciplinesList.map((disc) => (
                  <option key={disc} value={disc}>{disc}</option>
                ))}
              </select>
            </div>

            {/* Filter by Status */}
            <div className="flex items-center gap-1.5">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Estado</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-xs font-bold text-gray-700 focus:border-[#ffb800] outline-none cursor-pointer hover:bg-white transition-all"
              >
                <option value="Todos">Todos</option>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>

          </div>

        </div>

        {/* Master layout panel */}
        <div className="grid grid-cols-12 gap-6 mb-8">
          
          {/* Directory of BIM Professionals (9 columns) */}
          <div className="col-span-12 lg:col-span-9 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs flex flex-col">
            <div className="px-6 py-4.5 bg-gray-50/50 border-b border-gray-200 flex items-center justify-between">
              <h4 className="font-bold text-gray-800 text-sm">Directorio de Profesionales BIM</h4>
              <span className="bg-gray-100 text-gray-600 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                {filteredUsers.length} {filteredUsers.length === 1 ? "usuario" : "usuarios"}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Nombre</th>
                    <th className="px-6 py-4">Correo</th>
                    <th className="px-6 py-4">Rol Asignado</th>
                    <th className="px-6 py-4">Disciplina</th>
                    <th className="px-6 py-4 text-center">Estado</th>
                    <th className="px-6 py-4 text-right">Última Conexión</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs font-semibold">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-gray-400 font-bold">
                        <span className="animate-spin inline-block border-2 border-[#ffb800] border-t-transparent rounded-full w-5 h-5 mr-2 align-middle"></span>
                        Cargando profesionales...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-gray-400 font-bold">
                        No se encontraron usuarios con los filtros aplicados.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((usr) => (
                      <tr key={usr.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8.5 h-8.5 rounded-full ${usr.avatarBg} text-white flex items-center justify-center font-black text-xs select-none shadow-xs shrink-0`}>
                              {usr.avatarInitials}
                            </div>
                            <div>
                              <p className="text-[#181c1e] text-sm font-bold">{usr.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-500 font-medium">
                          {usr.email}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2.5 py-0.5 text-[9px] font-black uppercase rounded border ${
                            usr.role === "Administrador" ? "bg-amber-50 border-amber-200 text-amber-900" :
                            usr.role === "Gestor" ? "bg-blue-50 border-blue-200 text-blue-900" :
                            "bg-slate-50 border-gray-200 text-gray-600"
                          }`}>
                            {usr.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 font-bold">
                          {usr.discipline}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => handleToggleStatus(usr.id, usr.status, usr.name)}
                            className={`px-3 py-1 font-black text-[10px] rounded uppercase cursor-pointer hover:scale-101 border transition-all ${
                              usr.status === "Activo" 
                                ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100" 
                                : "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                            }`}
                            title={`Click para marcar como ${usr.status === "Activo" ? "Inactivo" : "Activo"}`}
                          >
                            {usr.status}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right text-gray-400 text-xs font-mono font-bold">
                          {usr.lastConnection}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEdit(usr)}
                              className="text-[#7c5800] hover:text-[#ffb800] bg-amber-50 hover:bg-amber-100 transition-colors cursor-pointer font-black uppercase text-[10px] px-2.5 py-1.5 rounded flex items-center gap-1"
                              title="Editar especificaciones de usuario"
                            >
                              <span className="material-symbols-outlined text-[11px] font-bold">edit</span>
                              <span>Editar</span>
                            </button>
                            {usr.hasRelations ? (
                              <button 
                                onClick={() => setAssociationUser(usr)}
                                className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer font-black uppercase text-[10px] px-2.5 py-1.5 rounded flex items-center gap-1"
                                title="Este usuario posee información asociada dentro del sistema. Haga clic para ver detalles de asociación."
                              >
                                <span className="material-symbols-outlined text-[11px] font-bold">lock</span>
                                <span>Asociado</span>
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleDeleteUser(usr.id, usr.name)}
                                className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer font-black uppercase text-[10px] px-2.5 py-1.5 rounded flex items-center gap-1"
                                title="Eliminar profesional del sistema"
                              >
                                <span className="material-symbols-outlined text-[11px] font-bold">delete</span>
                                <span>Eliminar</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Redesigned Compact AI Advisor Assistant (3 columns) */}
          <div className="col-span-12 lg:col-span-3">
            <div className="bg-[#181c1e] text-white p-5 rounded-xl border border-gray-800 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                <span className="material-symbols-outlined text-[#ffb800] text-lg">psychology</span>
                <h5 className="font-bold text-xs uppercase text-gray-100 tracking-wider">Asistente BIM AI</h5>
              </div>
              <p className="text-gray-400 text-[11px] leading-relaxed">
                Optimice la asignación de roles técnicos basándose en la carga operativa de las fases de modelado federado.
              </p>
              
              {aiSuggestion && (
                <div className="bg-white/5 border border-white/10 p-3 rounded-lg text-[10px] text-[#ffb800] leading-relaxed font-semibold animate-in fade-in">
                  {aiSuggestion}
                </div>
              )}

              <button
                onClick={askAiRecommendation}
                disabled={aiAnalyzing}
                className="w-full bg-[#ffb800] hover:brightness-105 disabled:bg-gray-800 disabled:text-gray-400 text-[#181c1e] font-black text-[10px] py-2.5 rounded-lg transition-all uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5"
              >
                {aiAnalyzing ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-xs">sync</span>
                    <span>Analizando...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-xs">electric_bolt</span>
                    <span>Generar sugerencia</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* General Audit Logs (RF-05 trace) */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs" id="audit-logs-section">
          <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h4 className="font-bold text-[#181c1e] text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-gray-400">admin_panel_settings</span>
                <span>Historial de Auditoría de Accesos y Cambios</span>
              </h4>
              {auditSearchQuery && (
                <div className="inline-flex items-center gap-2 bg-[#ffb800]/15 border border-[#ffb800]/30 text-[#7c5800] text-[11px] font-black px-3 py-1 rounded-full animate-in fade-in">
                  <span>Filtrado por: {auditSearchQuery}</span>
                  <button 
                    onClick={() => setAuditSearchQuery("")}
                    className="hover:text-red-600 transition-colors uppercase font-black text-[10px] tracking-wider ml-1 cursor-pointer"
                    title="Limpiar filtro de auditoría"
                  >
                    (Limpiar)
                  </button>
                </div>
              )}
            </div>
            <span className="font-mono text-[10px] text-gray-400 uppercase font-bold tracking-wider">SEGURIDAD ACTIVA ISO 19650</span>
          </div>
          
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-100 font-bold text-gray-500 text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Fecha / Hora</th>
                  <th className="px-6 py-3.5">Usuario Responsable</th>
                  <th className="px-6 py-3.5">Acción Realizada</th>
                  <th className="px-6 py-3.5">Detalle Operación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                {filteredAuditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-gray-450 font-bold">
                      {auditSearchQuery ? "No se encontraron registros de auditoría para este usuario." : "No hay registros de auditoría almacenados."}
                    </td>
                  </tr>
                ) : (
                  filteredAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/30">
                      <td className="px-6 py-3.5 font-mono text-gray-450 text-[11px] font-bold">Hoy {log.time}</td>
                      <td className="px-6 py-3.5 text-[#181c1e] font-bold">{log.user}</td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center gap-1 ${
                          log.type === "error" ? "text-red-600" :
                          log.type === "success" ? "text-green-600" : "text-blue-600"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            log.type === "error" ? "bg-red-600" :
                            log.type === "success" ? "bg-green-600" : "bg-blue-600"
                          }`}></span>
                          <span>{log.action}</span>
                        </span>
                      </td>
                      <td className="px-6 py-3.5 font-normal text-gray-450">{log.detail}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* COHESIVE MODAL: REGISTER / EDIT USER */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-950/60 flex items-center justify-center p-4 z-[95] animate-in fade-in duration-250" id="modal-user-form">
          <form 
            onSubmit={handleFormSubmit}
            className="bg-white rounded-2xl max-w-md w-full border border-gray-200 overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-bottom-4 duration-300"
          >
            {/* Header */}
            <div className="p-5 bg-gray-50 border-b flex justify-between items-center">
              <h5 className="font-sans font-black text-gray-950 text-sm">
                {editingUser ? "Editar Usuario" : "Registrar Nuevo Usuario"}
              </h5>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
                className="p-1 text-gray-400 hover:text-gray-750 transition-colors cursor-pointer rounded-lg hover:bg-gray-150"
              >
                <span className="material-symbols-outlined font-bold text-sm block">close</span>
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              
              {/* Nombre Completo */}
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-1.5 tracking-wider">
                  Nombre Completo *
                </label>
                <input 
                  type="text"
                  required
                  placeholder="Ej. Juan Pérez"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full border border-gray-200 p-2.5 rounded-lg text-xs font-bold text-gray-950 bg-white focus:border-[#ffb800] outline-none hover:border-gray-300 transition-all"
                />
              </div>

              {/* Correo Corporativo */}
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-1.5 tracking-wider">
                  Correo Corporativo *
                </label>
                <input 
                  type="email"
                  required
                  placeholder="Ej. j.perez@gmpbim.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full border border-gray-200 p-2.5 rounded-lg text-xs font-bold text-gray-950 bg-white focus:border-[#ffb800] outline-none hover:border-gray-300 transition-all"
                />
              </div>

              {/* Rol & Disciplina */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 block mb-1.5 tracking-wider">
                    Rol Asignado *
                  </label>
                  <select
                    required
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as User["role"])}
                    className="w-full border border-gray-200 p-2.5 rounded-lg text-xs font-bold bg-white text-gray-950 focus:border-[#ffb800] outline-none hover:border-gray-300 transition-all cursor-pointer"
                  >
                    <option value="Administrador">Administrador</option>
                    <option value="Gestor">Gestor</option>
                    <option value="Colaborador">Colaborador</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 block mb-1.5 tracking-wider">
                    Disciplina *
                  </label>
                  <select
                    required
                    value={formDiscipline}
                    onChange={(e) => setFormDiscipline(e.target.value)}
                    className="w-full border border-gray-200 p-2.5 rounded-lg text-xs font-bold bg-white text-gray-950 focus:border-[#ffb800] outline-none hover:border-gray-300 transition-all cursor-pointer"
                  >
                    {disciplinesList.map((disc) => (
                      <option key={disc} value={disc}>{disc}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status/Estado - ONLY available when Editing */}
              {editingUser && (
                <div className="border-t border-gray-100 pt-4">
                  <label className="text-[10px] font-black uppercase text-gray-400 block mb-1.5 tracking-wider">
                    Estado de Cuenta *
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-800 cursor-pointer">
                      <input
                        type="radio"
                        name="formStatus"
                        value="Activo"
                        checked={formStatus === "Activo"}
                        onChange={() => setFormStatus("Activo")}
                        className="accent-[#ffb800] w-4 h-4 cursor-pointer"
                      />
                      <span>Activo</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-800 cursor-pointer">
                      <input
                        type="radio"
                        name="formStatus"
                        value="Inactivo"
                        checked={formStatus === "Inactivo"}
                        onChange={() => setFormStatus("Inactivo")}
                        className="accent-[#ffb800] w-4 h-4 cursor-pointer"
                      />
                      <span>Inactivo</span>
                    </label>
                  </div>
                </div>
              )}

            </div>

            {/* Footer Buttons */}
            <div className="p-5 bg-gray-50 border-t flex justify-end gap-2.5">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 bg-white hover:bg-gray-100 border border-gray-250 hover:border-gray-300 rounded-lg text-xs text-gray-650 font-black cursor-pointer transition-all"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 bg-[#ffb800] text-[#181c1e] text-xs font-black rounded-lg hover:brightness-105 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {isSaving && <span className="animate-spin border-2 border-[#181c1e] border-t-transparent rounded-full w-3.5 h-3.5"></span>}
                <span>{editingUser ? "Guardar Cambios" : "Registrar Usuario"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* COHESIVE MODAL: VER ASOCIACIONES DE USUARIO */}
      {associationUser && (
        <div className="fixed inset-0 bg-gray-950/60 flex items-center justify-center p-4 z-[95] animate-in fade-in duration-250" id="modal-user-associations">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-gray-200 overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="p-5 bg-gray-50 border-b flex justify-between items-center">
              <h5 className="font-sans font-black text-gray-950 text-sm flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#ffb800] font-bold">lock</span>
                <span>Usuario asociado</span>
              </h5>
              <button 
                type="button" 
                onClick={() => setAssociationUser(null)} 
                className="p-1 text-gray-400 hover:text-gray-750 transition-colors cursor-pointer rounded-lg hover:bg-gray-150"
              >
                <span className="material-symbols-outlined font-bold text-sm block">close</span>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              <div>
                <span className="text-[10px] font-black uppercase text-gray-400 block mb-0.5 tracking-wider">
                  Profesional Seleccionado
                </span>
                <h4 className="text-lg font-black text-gray-950">
                  {associationUser.name}
                </h4>
                <p className="text-xs text-gray-500 mt-1 font-semibold leading-relaxed">
                  Este usuario no puede eliminarse porque posee información relacionada dentro del sistema.
                </p>
              </div>

              <div className="space-y-3">
                <h5 className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
                  Detalle de Asociaciones Activas
                </h5>

                <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-150">
                  {associationUser.projectAssociations && associationUser.projectAssociations.length > 0 ? (
                    associationUser.projectAssociations.map((assoc: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3.5 bg-gray-50/50 hover:bg-white transition-colors">
                        <div className="flex items-start gap-3">
                          <span className="text-lg mt-0.5 select-none">
                            {assoc.type === "Responsable" && "👑"}
                            {assoc.type === "Tarea" && "📋"}
                            {assoc.type === "Entregable" && "📄"}
                            {assoc.type === "Archivo" && "📎"}
                          </span>
                          <div>
                            <h6 className="text-xs font-black text-gray-950">{assoc.projectName}</h6>
                            <p className="text-[11px] font-semibold text-gray-500 mt-0.5">
                              Tipo: <span className="text-amber-655 font-bold uppercase text-[9px] bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded tracking-wide">{assoc.type}</span>
                              <span className="mx-1.5 text-gray-300">|</span>
                              Cantidad: <span className="text-gray-900 font-black">{assoc.count}</span>
                            </p>
                          </div>
                        </div>
                        
                        <button 
                          onClick={() => {
                            localStorage.setItem("gmp_project_search_filter", assoc.projectName);
                            if (assoc.type === "Tarea") {
                              localStorage.setItem("gmp_filter_task_user", associationUser.name);
                            } else if (assoc.type === "Entregable") {
                              localStorage.setItem("gmp_filter_deliverable_user", associationUser.name);
                            }
                            onNavigate(AppScreen.PROJECTS_LIST);
                            setAssociationUser(null);
                          }}
                          className="px-2.5 py-1.5 bg-white hover:bg-gray-100 text-[#7c5800] hover:text-[#ffb800] text-[10px] font-black uppercase tracking-wider rounded-lg border border-gray-200 hover:border-gray-300 shadow-sm transition-all cursor-pointer flex items-center gap-1"
                        >
                          <span>Ir al Proyecto</span>
                          <span className="material-symbols-outlined text-[11px] font-bold">open_in_new</span>
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-gray-500 text-xs font-semibold">
                      No se encontraron asociaciones de proyectos para este usuario.
                    </div>
                  )}
                </div>
              </div>

              <p className="text-[11px] text-gray-500 font-bold leading-relaxed border-t border-gray-100 pt-3">
                Para conservar la trazabilidad e integridad de la información, este usuario no puede eliminarse mientras mantenga relaciones activas dentro del sistema.
              </p>
            </div>

            {/* Footer Buttons */}
            <div className="p-5 bg-gray-50 border-t flex flex-col sm:flex-row justify-end gap-2 sm:items-center">
              <button
                type="button"
                onClick={async () => {
                  const updatedStatus: User["status"] = associationUser.status === "Activo" ? "Inactivo" : "Activo";
                  await handleToggleStatus(associationUser.id, associationUser.status, associationUser.name);
                  setAssociationUser(prev => prev ? { ...prev, status: updatedStatus } : null);
                }}
                className="px-4 py-2.5 bg-[#ffb800] hover:brightness-105 active:scale-95 text-[#181c1e] text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider shrink-0"
              >
                <span className="material-symbols-outlined text-sm">swap_horiz</span>
                <span>Cambiar estado a {associationUser.status === "Activo" ? "Inactivo" : "Activo"}</span>
              </button>
              <button 
                type="button" 
                onClick={() => setAssociationUser(null)}
                className="px-4 py-2.5 bg-white hover:bg-gray-100 border border-gray-250 hover:border-gray-300 rounded-lg text-xs text-gray-650 font-black cursor-pointer transition-all flex items-center justify-center"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
