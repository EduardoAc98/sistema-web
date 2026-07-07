import React, { useState, useEffect } from "react";
import { AppScreen, Project, User, Task } from "../types";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { api, getSavedUser } from "../api";
import ProjectForm from "../components/ProjectForm";
import { toast } from "../components/Toast";

interface ProjectsListScreenProps {
  onNavigate: (screen: AppScreen) => void;
  onSelectProject: (project: Project) => void;
  projects: Project[];
  onRefresh?: () => void;
}

export default function ProjectsListScreen({
  onNavigate,
  onSelectProject,
  projects,
  onRefresh
}: ProjectsListScreenProps) {
  const [searchTerm, setSearchQuery] = useState(() => {
    const filter = localStorage.getItem("gmp_project_search_filter");
    if (filter) {
      localStorage.removeItem("gmp_project_search_filter");
      return filter;
    }
    return "";
  });
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  
  // Stats states
  const [stats, setStats] = useState({
    active: 0,
    pendingDeliverables: 0,
    criticalDelays: 0,
    collaboratingTeams: 0
  });

  // Modal states
  const [previewProject, setPreviewProject] = useState<Project | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  
  // Dropdowns
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [saving, setSaving] = useState(false);

  // Edit fields
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState<any>("En Curso");
  const [editDueDate, setEditDueDate] = useState("");
  const [editResponsible, setEditResponsible] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Load system users
  useEffect(() => {
    api.getUsers()
      .then((data) => {
        if (data && data.length > 0) {
          setUsers(data);
        }
      })
      .catch((err) => console.error("Error loading users:", err));
  }, []);

  // Fetch and compute stats dynamically
  useEffect(() => {
    const fetchAllStats = async () => {
      try {
        if (!projects || projects.length === 0) return;

        // BATCH FETCH OPTIMIZATION:
        // Instead of N+1 calls per project, we fetch all data once.
        const [rawTasks, rawDelivs] = await Promise.all([
          api.getAllTasks().catch(() => []),
          api.getAllDeliverables().catch(() => [])
        ]);

        // Filter data to only include items belonging to the current projects list
        // This ensures statistics are accurate if the project list is ever filtered.
        const projectIds = new Set(projects.map(p => p.id));
        const allTasks = rawTasks.filter((t: any) => projectIds.has(t.projectId));
        const allDelivs = rawDelivs.filter((d: any) => projectIds.has(d.projectId));

        // Count projects with status: Planificación, En Curso, Entregables Pendientes (case-insensitive & mapped to system terms)
        const activeCount = projects.filter(p => {
          const st = (p.status || "").toLowerCase();
          return ["planificación", "planificacion", "en curso", "entregables pendientes", "pendiente approval", "ejecución", "ejecucion", "revisión", "revision", "atrasado", "en pausa", "retrasado"].includes(st);
        }).length;

        // Count deliverables: Pendiente, En Revisión
        const pendCount = allDelivs.filter(d => {
          const st = (d.status || "").toLowerCase();
          return ["pendiente", "en revisión", "en revision", "pendientes"].includes(st);
        }).length;

        // Count tasks: Overdue status OR dueDate passed and !== Completed
        const delayCount = allTasks.filter(t => {
          const st = (t.status || "").toLowerCase();
          if (st === "overdue" || st === "atrasado" || st === "retrasado" || st === "vencido") {
            return true;
          }
          try {
            // Task format like "24 Oct 2024" or standard ISO
            // Simple date parser
            const now = new Date();
            const dateStr = t.dueDate || "";
            let parsedDate = new Date(dateStr);
            if (isNaN(parsedDate.getTime())) {
              // Try replacing month abbreviations
              const months: Record<string, string> = { "jan": "01", "feb": "02", "mar": "03", "apr": "04", "may": "05", "jun": "06", "jul": "07", "aug": "08", "sep": "09", "oct": "10", "nov": "11", "dec": "12" };
              const clean = dateStr.toLowerCase();
              for (const [m, num] of Object.entries(months)) {
                if (clean.includes(m)) {
                  // e.g. "24 oct 2024" => "2024-10-24"
                  const parts = clean.split(/\s+/);
                  if (parts.length >= 3) {
                    parsedDate = new Date(`${parts[2]}-${num}-${parts[0]}`);
                  }
                  break;
                }
              }
            }
            if (!isNaN(parsedDate.getTime()) && parsedDate < now && st !== "completed" && st !== "completado" && st !== "conseguido") {
              return true;
            }
          } catch {}
          return false;
        }).length;

        // Count active users collaborating
        const activeUsersCount = users.filter(u => u.status === "Activo").length || 4;

        setStats({
          active: activeCount || projects.length,
          pendingDeliverables: pendCount,
          criticalDelays: delayCount,
          collaboratingTeams: activeUsersCount
        });
      } catch (err) {
        console.error("Error calculating statistical dynamic dashboard cards:", err);
      }
    };

    fetchAllStats();
  }, [projects, users]);

  // Reset pagination on search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Filter projects by name or code or responsible based on search query
  const filteredProjects = projects.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      (p.name || "").toLowerCase().includes(term) ||
      (p.code || "").toLowerCase().includes(term) ||
      (p.responsible || "").toLowerCase().includes(term)
    );
  });

  // Pagination logic
  const totalItems = filteredProjects.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedProjects = filteredProjects.slice(startIndex, endIndex);

  // Open edit modal
  const handleOpenEdit = (e: React.MouseEvent, p: Project) => {
    e.stopPropagation();
    setEditingProject(p);
    setEditName(p.name);
    setEditDescription(p.description || "");
    setEditStatus(p.status);
    setEditDueDate(p.dueDate);
    setEditResponsible(p.responsible);
  };

  // Open preview modal
  const handleOpenPreview = (e: React.MouseEvent, p: Project) => {
    e.stopPropagation();
    setPreviewProject(p);
  };

  // Close modals
  const handleCloseEdit = () => {
    setEditingProject(null);
  };

  const handleClosePreview = () => {
    setPreviewProject(null);
  };

  // Save changes to project
  const handleSaveChanges = async (projectData: any) => {
    if (!editingProject) return;
    setSaving(true);
    try {
      const selectedUser = users.find(u => u.name === projectData.responsible);
      const responsibleAvatar = selectedUser?.avatarInitials 
        ? `https://lh3.googleusercontent.com/v1/placeholder-user-1.jpg` 
        : editingProject.responsibleAvatar;

      await api.updateProject(editingProject.id, {
        ...projectData,
        responsibleAvatar
      } as any);

      // Log successful edit action
      const savedUser = getSavedUser() || { name: "Usuario" };
      await api.createLog(
        savedUser.name,
        `Modificó información del proyecto: "${projectData.name}"`,
        `Código: ${editingProject.code} | Responsable: ${projectData.responsible}`,
        "info"
      );

      if (onRefresh) onRefresh();
      handleCloseEdit();
    } catch (err) {
      toast.error("Error al guardar los cambios del proyecto.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Safe downloads trigger
  const triggerDownload = (type: "pdf" | "excel") => {
    setShowDownloadMenu(false);
    const endpoint = type === "pdf" ? "/api/reports/general/pdf" : "/api/reports/general/excel";
    window.open(endpoint, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#f7fafc] text-[#181c1e] font-sans selection:bg-[#ffb800] selection:text-[#6d4c00]" id="projects-list-viewport">
      {/* Sidebar Navigation */}
      <Sidebar currentScreen={AppScreen.PROJECTS_LIST} onNavigate={onNavigate} />

      {/* Header Panel with search bind */}
      <Header
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar por nombre, código o responsable..."
        onNavigate={onNavigate}
        onSelectProject={onSelectProject}
      />

      {/* Main Container Work Area */}
      <main className="ml-[240px] pt-24 px-8 pb-12 transition-all duration-300">
        
        {/* Breadcrumb & Navigation Trigger Header */}
        <div className="flex items-end justify-between mb-8" id="projects-list-header">
          <div>
            <nav className="flex items-center gap-2 text-gray-400 mb-2 uppercase text-[10px] tracking-widest font-bold">
              <span>Home</span>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
              <span className="text-[#a18146]">Proyectos</span>
            </nav>
            <h3 className="text-3xl font-black tracking-tight text-gray-900">Listado de Proyectos</h3>
          </div>
          
          <button
            id="register-new-project-btn"
            onClick={() => onNavigate(AppScreen.REGISTER_PROJECT)}
            className="bg-[#ffb800] text-[#181c1e] px-6 py-3 rounded-lg font-bold text-xs flex items-center gap-2 hover:brightness-105 active:scale-95 transition-all shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined font-bold text-sm">add</span>
            <span>Registrar Nuevo Proyecto</span>
          </button>
        </div>

        {/* Dynamic Bento cards KPI dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8" id="projects-list-kpi-cards">
          
          {/* Card 1: Active Projects */}
          <div className="bg-white border border-gray-200 p-6 border-l-4 border-l-[#ffb800] rounded-xl relative overflow-hidden group shadow-sm" id="kpi-card-active-projects">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500 text-gray-400">
              <span className="material-symbols-outlined" style={{ fontSize: "80px" }}>architecture</span>
            </div>
            <p className="text-gray-400 font-bold uppercase text-[9px] tracking-widest mb-1">PROYECTOS ACTIVOS</p>
            <h4 className="text-3xl font-black text-gray-950">{stats.active}</h4>
            <p className="text-[#7c5800] font-bold text-xs mt-2">Monitoreo en tiempo real</p>
          </div>

          {/* Card 2: Pending Deliverables */}
          <div className="bg-white border border-gray-200 p-6 border-l-4 border-l-blue-600 rounded-xl relative overflow-hidden group shadow-sm" id="kpi-card-pending-deliverables">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500 text-gray-400">
              <span className="material-symbols-outlined" style={{ fontSize: "80px" }}>task_alt</span>
            </div>
            <p className="text-gray-400 font-bold uppercase text-[9px] tracking-widest mb-1">ENTREGABLES PENDIENTES</p>
            <h4 className="text-3xl font-black text-gray-950">{stats.pendingDeliverables}</h4>
            <p className="text-blue-600 font-bold text-xs mt-2">Bandeja de revisión activa</p>
          </div>

          {/* Card 3: Overdue Critical alerts */}
          <div className="bg-white border border-gray-200 p-6 border-l-4 border-l-red-500 rounded-xl relative overflow-hidden group shadow-sm" id="kpi-card-critical-delays">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500 text-gray-400">
              <span className="material-symbols-outlined" style={{ fontSize: "80px" }}>warning</span>
            </div>
            <p className="text-gray-400 font-bold uppercase text-[9px] tracking-widest mb-1">RETRASOS CRÍTICOS</p>
            <h4 className={`text-3xl font-black ${stats.criticalDelays > 0 ? "text-red-650" : "text-gray-950"}`}>{stats.criticalDelays}</h4>
            <p className="text-red-600 font-bold text-xs mt-2">{stats.criticalDelays > 0 ? "Acción inmediata requerida" : "Sin incidencias"}</p>
          </div>

          {/* Card 4: Team active size */}
          <div className="bg-white border border-gray-200 p-6 border-l-4 border-l-emerald-500 rounded-xl relative overflow-hidden group shadow-sm" id="kpi-card-team-collaborating">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500 text-gray-400">
              <span className="material-symbols-outlined" style={{ fontSize: "80px" }}>group</span>
            </div>
            <p className="text-gray-400 font-bold uppercase text-[9px] tracking-widest mb-1">EQUIPO COLABORANDO</p>
            <h4 className="text-3xl font-black text-gray-950">{stats.collaboratingTeams}</h4>
            <p className="text-emerald-600 font-bold text-xs mt-2">Colaboradores de alta gama</p>
          </div>

        </div>

        {/* Outer Data Visual container with operative selectors */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm" id="projects-table-card-container">
          
          {/* Operative actions bar: Views toggle, Search status, Download exports */}
          <div className="px-6 py-4 bg-gray-50/70 border-b border-gray-200 flex justify-between items-center" id="operating-actions-bar">
            <div>
              <h5 className="font-sans font-bold text-xs text-gray-800 tracking-wider uppercase">VISTA OPERATIVA (RF-02)</h5>
              <p className="text-[10px] text-gray-400 mt-0.5">Visualización y gestión rápida de proyectos coordinados</p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Toggle switch view: Table vs Grid/Cards */}
              <div className="flex bg-gray-200/70 rounded-lg p-0.5" id="view-mode-toggle-group">
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                    viewMode === "table" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-950"
                  }`}
                  title="Vista Tabla"
                >
                  <span className="material-symbols-outlined text-sm">table_rows</span>
                  <span className="hidden sm:inline">Tabla</span>
                </button>
                <button
                  onClick={() => setViewMode("cards")}
                  className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                    viewMode === "cards" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-950"
                  }`}
                  title="Vista Tarjetas"
                >
                  <span className="material-symbols-outlined text-sm">grid_view</span>
                  <span className="hidden sm:inline">Tarjetas</span>
                </button>
              </div>

              {/* Exports Actions Dropdown Option Button */}
              <div className="relative">
                <button 
                  onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                  className="p-2 border border-gray-200 hover:bg-gray-100/80 rounded-lg text-gray-600 transition-colors cursor-pointer flex items-center gap-1 bg-white shadow-sm font-semibold text-xs"
                  id="exporter-toggle-btn"
                  title="Exportar Reportes"
                >
                  <span className="material-symbols-outlined text-xs">download</span>
                  <span>Exportar</span>
                  <span className="material-symbols-outlined text-xs">arrow_drop_down</span>
                </button>

                {showDownloadMenu && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-30 font-sans text-xs" id="exporter-dropdown-menu">
                    <button
                      onClick={() => triggerDownload("excel")}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-gray-50 text-gray-700 text-left font-medium"
                    >
                      <span className="material-symbols-outlined text-green-600">table_chart</span>
                      <span>Descargar Excel</span>
                    </button>
                    <button
                      onClick={() => triggerDownload("pdf")}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-gray-50 text-gray-700 text-left font-medium"
                    >
                      <span className="material-symbols-outlined text-red-500">picture_as_pdf</span>
                      <span>Descargar Reporte PDF</span>
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* TABLE MODE VIEW */}
          {viewMode === "table" ? (
            <div className="overflow-x-auto custom-scrollbar" id="table-view-mode-wrapper">
              <table className="w-full text-left border-collapse" id="operative-projects-table">
                <thead className="bg-[#fcfdfd] border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 tracking-wider uppercase">CÓDIGO / NOMBRE DEL PROYECTO</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 tracking-wider uppercase">RESPONSABLE</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 tracking-wider uppercase text-center">ESTADO</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 tracking-wider uppercase">PROGRESO</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 tracking-wider uppercase">FECHA FIN</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 tracking-wider uppercase text-right">ACCIONES</th>
                  </tr>
                </thead>
                
                <tbody className="divide-y divide-gray-100 font-medium">
                  {paginatedProjects.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center text-gray-400">
                        <span className="material-symbols-outlined text-4xl mb-2 text-gray-300">search_off</span>
                        <p className="text-sm font-semibold">No se encontraron proyectos correspondientes a su búsqueda.</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedProjects.map((p) => {
                      return (
                        <tr 
                          key={p.id}
                          className="hover:bg-gray-50/70 transition-colors group cursor-pointer"
                          onClick={() => {
                            onSelectProject(p);
                            onNavigate(AppScreen.PROJECT_DETAIL);
                          }}
                          id={`project-row-${p.id}`}
                        >
                          {/* Name and Code */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                p.status === "Atrasado" || p.status === "Retrasado" ? "bg-red-500" :
                                p.status === "Revisión" || p.status === "Pendiente Approval" ? "bg-amber-400" :
                                p.status === "Completado" ? "bg-green-500" : "bg-[#ffb800]"
                              }`}></div>
                              <div>
                                <span className="font-bold text-gray-900 group-hover:text-[#7c5800] transition-colors text-sm block">
                                  {p.name}
                                </span>
                                <span className="text-[10px] text-gray-400 font-mono mt-0.5 block tracking-wide">
                                  {p.code} &bull; {p.description ? p.description.slice(0, 60) : ""}...
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Responsible user */}
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[10px] text-blue-800 uppercase border border-white shadow-sm shrink-0">
                                {p.responsible ? p.responsible.split(" ").map(w => w[0]).join("").slice(0, 2) : "JS"}
                              </div>
                              <span className="text-xs text-gray-800 font-bold">{p.responsible}</span>
                            </div>
                          </td>

                          {/* Project Status */}
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-block px-3 py-1 font-bold text-[10px] uppercase rounded tracking-wider ${
                              p.status === "Completado" ? "bg-green-50 text-green-700 border border-green-200" :
                              p.status === "Atrasado" || p.status === "Retrasado" || (p.status as string) === "Retrasado Crítico" ? "bg-red-50 text-red-700 border border-red-200" :
                              p.status === "Revisión" || p.status === "Pendiente Approval" ? "bg-amber-50 text-[#7c5800] border border-amber-200" :
                              "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}>
                              {p.status}
                            </span>
                          </td>

                          {/* Progress bar */}
                          <td className="px-6 py-4">
                            <div className="w-28 bg-gray-100 h-2 rounded-full overflow-hidden flex">
                              <div 
                                className={`h-full rounded-full transition-all duration-1000 ${
                                  p.status === "Completado" ? "bg-green-500" :
                                  p.status === "Atrasado" || p.status === "Retrasado" ? "bg-red-500" :
                                  "bg-[#ffb800]"
                                }`}
                                style={{ width: `${p.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-[10px] text-gray-400 font-mono mt-1 font-bold block">{p.progress}% completado</span>
                          </td>

                          {/* Target end date */}
                          <td className="px-6 py-4 text-xs font-bold text-gray-650 font-mono">
                            {p.dueDate}
                          </td>

                          {/* Inline preview & edit operations */}
                          <td className="px-6 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5 opacity-100">
                              <button 
                                onClick={(e) => handleOpenPreview(e, p)}
                                className="p-2 hover:bg-[#ffb800]/15 hover:text-[#7c5800] text-gray-400 hover:scale-105 active:scale-95 rounded-lg transition-all cursor-pointer"
                                title="Visualizar Vista Previa Rápida"
                                id={`project-btn-preview-${p.id}`}
                              >
                                <span className="material-symbols-outlined text-lg select-none">visibility</span>
                              </button>
                              <button 
                                onClick={(e) => handleOpenEdit(e, p)}
                                className="p-2 hover:bg-gray-150 text-gray-400 hover:text-gray-800 hover:scale-105 active:scale-95 rounded-lg transition-all cursor-pointer"
                                title="Editar parámetros generales del proyecto"
                                id={`project-btn-edit-${p.id}`}
                              >
                                <span className="material-symbols-outlined text-lg select-none">edit</span>
                              </button>
                            </div>
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* CARDS GRID MODE VIEW */
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6" id="cards-view-mode-wrapper">
              {paginatedProjects.length === 0 ? (
                <div className="col-span-1 md:col-span-3 py-16 text-center text-gray-400">
                  <span className="material-symbols-outlined text-4xl mb-2 text-gray-300">search_off</span>
                  <p className="text-sm font-semibold">No se encontraron proyectos correspondientes a su búsqueda.</p>
                </div>
              ) : (
                paginatedProjects.map((p) => {
                  return (
                    <div 
                      key={p.id}
                      onClick={() => {
                        onSelectProject(p);
                        onNavigate(AppScreen.PROJECT_DETAIL);
                      }}
                      className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between cursor-pointer hover:border-gray-300 group"
                      id={`project-card-${p.id}`}
                    >
                      <div>
                        {/* Top Row with status and code */}
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[10px] font-mono tracking-widest text-[#7c5800] font-bold bg-[#ffb800]/10 px-2.5 py-0.5 rounded-md">
                            {p.code}
                          </span>
                          <span className={`inline-block px-2.5 py-0.5 font-bold text-[9px] uppercase rounded tracking-wider ${
                            p.status === "Completado" ? "bg-green-50 text-green-700 border border-green-200" :
                            p.status === "Atrasado" || p.status === "Retrasado" ? "bg-red-50 text-red-700 border border-red-200" :
                            p.status === "Revisión" || p.status === "Pendiente Approval" ? "bg-amber-50 text-[#7c5800] border border-amber-200" :
                            "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}>
                            {p.status}
                          </span>
                        </div>

                        {/* Title and description */}
                        <h4 className="font-bold text-gray-900 text-base leading-snug tracking-tight mb-1 hover:text-[#7c5800] transition-colors">
                          {p.name}
                        </h4>
                        <p className="text-xs text-gray-400 font-medium line-clamp-3 mb-4">
                          {p.description || "Sin descripción proporcionada."}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
                        {/* Progress and target end date */}
                        <div>
                          <div className="flex justify-between items-center text-[10px] font-bold mb-1">
                            <span className="text-gray-400">AVANCE</span>
                            <span className="text-[#7c5800] font-mono">{p.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 ${
                                p.status === "Completado" ? "bg-green-500" :
                                p.status === "Atrasado" || p.status === "Retrasado" ? "bg-red-500" :
                                "bg-[#ffb800]"
                              }`}
                              style={{ width: `${p.progress}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Responsible and Date info */}
                        <div className="flex justify-between items-center text-xs pt-1">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[8px] text-blue-800 uppercase">
                              {p.responsible ? p.responsible.split(" ").map(w => w[0]).join("").slice(0, 2) : "JS"}
                            </div>
                            <span className="text-[11px] text-gray-700 font-bold">{p.responsible}</span>
                          </div>
                          
                          <span className="text-[10px] font-mono font-bold text-gray-400">
                            Fin: {p.dueDate}
                          </span>
                        </div>

                        {/* Actions block inside card */}
                        <div className="flex justify-end gap-1 pt-1">
                          <button 
                            onClick={(e) => handleOpenPreview(e, p)}
                            className="p-1.5 hover:bg-[#ffb800]/15 hover:text-[#7c5800] text-gray-400 rounded-lg transition-colors cursor-pointer"
                            title="Vista Previa Rápida"
                            id={`project-card-preview-btn-${p.id}`}
                          >
                            <span className="material-symbols-outlined text-base">visibility</span>
                          </button>
                          <button 
                            onClick={(e) => handleOpenEdit(e, p)}
                            className="p-1.5 hover:bg-gray-150 text-gray-400 hover:text-gray-800 rounded-lg transition-colors cursor-pointer"
                            title="Editar parámetros generales"
                            id={`project-card-edit-btn-${p.id}`}
                          >
                            <span className="material-symbols-outlined text-base">edit</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Table Footer with dynamic pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500" id="projects-pagination-controls">
              <span>Mostrando {startIndex + 1}-{endIndex} de {totalItems} proyectos registrados</span>
              <div className="flex gap-2">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className={`px-4 py-2 border rounded-lg bg-white select-none transition-colors font-bold ${
                    currentPage === 1 
                      ? "opacity-50 cursor-not-allowed border-gray-150 text-gray-300" 
                      : "border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer"
                  }`}
                  id="pagination-prev-btn"
                >
                  Anterior
                </button>
                <div className="flex items-center gap-1.5 px-2 font-black text-gray-700">
                  <span>Página</span>
                  <span className="px-2 py-1 bg-gray-100 rounded text-[#7c5800]">{currentPage}</span>
                  <span>de {totalPages}</span>
                </div>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className={`px-4 py-2 border rounded-lg bg-white select-none transition-colors font-bold ${
                    currentPage === totalPages 
                      ? "opacity-50 cursor-not-allowed border-gray-150 text-gray-300" 
                      : "border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer"
                  }`}
                  id="pagination-next-btn"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}

        </div>

      </main>

      {/* MODAL 1: VIEW PREVIEW ("VISTA PREVIA") */}
      {previewProject && (
        <div className="fixed inset-0 bg-gray-900/60 flex items-center justify-center p-4 z-[90] selection:bg-[#ffb800] selection:text-[#6d4c00]" id="modal-project-preview-wrapper">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col" id="modal-project-preview-content">
            
            {/* Modal Header */}
            <div className="p-6 bg-gray-50 border-b border-gray-150 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-mono tracking-widest font-bold text-[#7c5800] block mb-1">CÓDIGO: {previewProject.code}</span>
                <h4 className="text-xl font-sans font-black text-gray-900 leading-none">Vista Previa de Proyecto</h4>
              </div>
              <button 
                onClick={handleClosePreview}
                className="p-1 text-gray-400 hover:text-gray-900 hover:bg-gray-200/50 rounded-lg transition-colors cursor-pointer"
                title="Cerrar modal"
              >
                <span className="material-symbols-outlined select-none font-bold">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 flex-1 overflow-y-auto">
              
              {/* Project Name and Description */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 tracking-wider uppercase block mb-1.5">Nombre del Proyecto</label>
                <p className="font-sans font-bold text-base text-gray-900 leading-snug">{previewProject.name}</p>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 tracking-wider uppercase block mb-1.5">Descripción o Resumen Ejecutivo</label>
                <p className="text-sm text-gray-600 font-medium leading-relaxed bg-[#f8fafc] p-3.5 border border-gray-100 rounded-lg">{previewProject.description || "N/A"}</p>
              </div>

              {/* Responsible & Target Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 tracking-wider uppercase block mb-1">Responsable Líder</label>
                  <p className="text-sm text-gray-800 font-bold">{previewProject.responsible || "No asignado"}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 tracking-wider uppercase block mb-1">Estado de Trabajo</label>
                  <span className={`inline-block px-3 py-0.5 font-bold text-[9px] uppercase rounded tracking-wider mt-1 ${
                    previewProject.status === "Completado" ? "bg-green-50 text-green-700 border border-green-200" :
                    previewProject.status === "Atrasado" || previewProject.status === "Retrasado" ? "bg-red-50 text-red-700 border border-red-200" :
                    previewProject.status === "Revisión" || previewProject.status === "Pendiente Approval" ? "bg-amber-50 text-[#7c5800] border border-amber-200" :
                    "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}>
                    {previewProject.status}
                  </span>
                </div>
              </div>

              {/* Target end date & progression */}
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 tracking-wider uppercase block mb-1">Fecha de Entrega</label>
                  <p className="text-xs font-bold text-gray-800 font-mono mt-1">{previewProject.dueDate || "Sin fecha"}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 tracking-wider uppercase block mb-1">Progreso Integrado</label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-24 bg-gray-150 h-2 rounded-full overflow-hidden shrink-0">
                      <div 
                        className={`h-full rounded-full ${
                          previewProject.status === "Completado" ? "bg-green-500" : "bg-[#ffb800]"
                        }`} 
                        style={{ width: `${previewProject.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-[11px] font-bold text-gray-700 font-mono shrink-0">{previewProject.progress}%</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className="p-6 bg-gray-50 border-t border-gray-150 flex justify-end gap-3">
              <button
                onClick={handleClosePreview}
                className="px-5 py-2.5 bg-gray-200 hover:bg-gray-350 text-gray-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Cerrar Detalle
              </button>
              <button
                onClick={() => {
                  onSelectProject(previewProject);
                  onNavigate(AppScreen.PROJECT_DETAIL);
                }}
                className="px-5 py-2.5 bg-[#ffb800] hover:brightness-105 active:scale-95 text-[#181c1e] font-bold rounded-lg text-xs transition-all cursor-pointer flex items-center gap-1"
              >
                <span>Navegar a Detalles Integrales</span>
                <span className="material-symbols-outlined text-sm font-bold">arrow_right_alt</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: EDIT PROJECT ("EDITAR PROYECTO") */}
      {editingProject && (
        <div className="fixed inset-0 bg-gray-900/60 flex items-center justify-center p-4 z-[90] selection:bg-[#ffb800] selection:text-[#6d4c00]" id="modal-project-edit-wrapper">
          <div className="bg-white rounded-2xl border border-gray-150 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col relative" id="modal-project-edit-content">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#ffb800]"></div>
            
            {/* Modal Header */}
            <div className="p-6 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-mono tracking-widest font-bold text-[#7c5800] block mb-1">CÓDIGO: {editingProject.code}</span>
                <h4 className="text-xl font-sans font-black text-gray-900">Editar Proyecto</h4>
              </div>
              <button 
                type="button"
                onClick={handleCloseEdit}
                className="p-1 text-gray-400 hover:text-gray-950 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                title="Cerrar modal"
              >
                <span className="material-symbols-outlined select-none font-bold">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex-1 overflow-y-auto max-h-[80vh]">
              <ProjectForm 
                mode="edit"
                initialProject={editingProject}
                onSubmit={handleSaveChanges}
                onCancel={handleCloseEdit}
                isSubmitting={saving}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
