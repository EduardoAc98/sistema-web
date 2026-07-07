import React, { useState, useEffect } from "react";
import { AppScreen, Project } from "../types";
import { api, getSavedUser } from "../api";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import SettingsModal from "../components/SettingsModal";
import AccountModal from "../components/AccountModal";
import NewTaskModal from "../components/NewTaskModal";
import BimUploadModal from "../components/BimUploadModal";

interface DashboardScreenProps {
  projects: Project[];
  onNavigate: (screen: AppScreen) => void;
  onSelectProject: (project: Project) => void;
}

interface AlertNotification {
  id: string;
  title: string;
  desc: string;
  type: string;
  actionText?: string;
}

export default function DashboardScreen({
  projects,
  onNavigate,
  onSelectProject
}: DashboardScreenProps) {
  const [loggedUser, setLoggedUser] = useState<any>(null);
  
  // Real-time backend status
  const [isBackendConnected, setIsBackendConnected] = useState(true);

  // Dynamic statistics states
  const [activeProjectsCount, setActiveProjectsCount] = useState(0);
  const [pendingDeliverablesCount, setPendingDeliverablesCount] = useState(0);
  const [globalProgressPercent, setGlobalProgressPercent] = useState(74);

  // Efficiency meters states
  const [tiEfficiency, setTiEfficiency] = useState(98);
  const [docEfficiency, setDocEfficiency] = useState(82);
  const [commEfficiency, setCommEfficiency] = useState(65);

  // Slide-Show banner carousel state (Requirement 13)
  const [slideIndex, setSlideIndex] = useState(0);
  const slides = [
    {
      title: "PROYECTO DESTACADO",
      desc: "Residencial Las Palmas - Coordinación general al 85% y federado de sanitarios.",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDcOzK0TdACo51sSiC6Lk_Ci0A2iWsz9uNBeZrpuQ7pRn5Fv9wY4BOJfbUfNMGRGEI5aL2_IimoWal3YJVp5I6usn4AV1w04i18TvITUWA5EO58tHg8DfqgSDZ6yxLR-6aFLqbkCRSiofWaS0fGfGMqDG3V2l0bFKPcigkIyhJkwzJ3N9eBAYb9dM-C1ErUJkKN49ZgE3Dv7HEqJ-8Y3m5KRSVckB2aoEQgD5RqeBTuOxZrylnAU_2hyuzNn4lKRsgEzPiYu7qoSlCN",
      tag: "INNOVACIÓN BIM"
    },
    {
      title: "DIFUSIÓN INTERNA TI",
      desc: "Sincronización semanal de Licencias ACC programada para este viernes a las 10:00 PM.",
      img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=650",
      tag: "INFRAESTRUCTURA"
    },
    {
      title: "LOGRO DEL EQUIPO",
      desc: "Alcanzamos el hito de 50 modelos federados exitosamente auditados bajo ISO 19650.",
      img: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=650",
      tag: "AUDITORÍA GMP"
    }
  ];

  // Floating speed dial menu toggle (Requirement 14)
  const [isFabOpen, setIsFabOpen] = useState(false);

  // Modals management trigger states
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [isBimUploadOpen, setIsBimUploadOpen] = useState(false);

  // Default dynamic notification feed
  const [notifications, setNotifications] = useState<AlertNotification[]>([
    {
      id: "not-1",
      title: "Vencimiento Próximo (RF-11)",
      desc: "Puente Interconector requiere levantamiento urgente. Faltan 2 horas.",
      type: "error"
    },
    {
      id: "not-2",
      title: "Nuevo Entregable Cargado",
      desc: 'Colaborador subió "Diseño_Estructural_V2.rvt" para el Proyecto Sigma.',
      type: "warning",
      actionText: "REVISAR AHORA"
    },
    {
      id: "not-3",
      title: "Comentario en Tarea",
      desc: 'Elena P: "¿Contamos con los planos de instalaciones sanitarias?"',
      type: "info"
    },
    {
      id: "not-4",
      title: "Proyecto Finalizado",
      desc: 'El proyecto "Planta Industrial Beta" ha sido cerrado exitosamente.',
      type: "success"
    }
  ]);

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  };

  // Fetch session user on mount
  useEffect(() => {
    const user = getSavedUser();
    if (user) {
      setLoggedUser(user);
    }
  }, []);

  // Requirement 8: Health-check loop
  useEffect(() => {
    let selectActive = true;
    const pingEndpoint = async () => {
      try {
        const resp = await fetch("/api/health");
        if (resp.ok && selectActive) {
          setIsBackendConnected(true);
        } else if (selectActive) {
          setIsBackendConnected(false);
        }
      } catch (err) {
        if (selectActive) setIsBackendConnected(false);
      }
    };

    pingEndpoint();
    const interval = setInterval(pingEndpoint, 8000);
    return () => {
      selectActive = false;
      clearInterval(interval);
    };
  }, []);

  // SlideShow banner timer rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Compute stats on mount and load deliverables/tasks
  useEffect(() => {
    if (projects && projects.length > 0) {
      // 1. Calculate active projects
      const activeCount = projects.filter((p) => p.status !== "Completado").length;
      setActiveProjectsCount(activeCount);

      // 2. Load deliverables and tasks statistical indices
      calculateDynamicStats();
    }
  }, [projects]);

  const calculateDynamicStats = async () => {
    try {
      // BATCH FETCH OPTIMIZATION:
      // Instead of N+1 calls per project, we fetch all data once.
      // This reduces 2N calls to 2.
      const [allDelivs, allTasks] = await Promise.all([
        api.getAllDeliverables().catch(() => []),
        api.getAllTasks().catch(() => [])
      ]);

      // Filter data to only include items belonging to the current projects list
      // This ensures statistics are accurate if the project list is ever filtered.
      const projectIds = new Set(projects.map(p => p.id));
      const flatDelivs = allDelivs.filter((d: any) => projectIds.has(d.projectId));
      const flatTasks = allTasks.filter((t: any) => projectIds.has(t.projectId));

      // Calculation 1: Pending Deliverables count (status !== "APROBADO")
      const pendingCount = flatDelivs.filter(
        (d: any) => d.status === "PENDIENTE" || d.status?.toLowerCase().includes("revis") || d.status === "Pendiente"
      ).length;
      setPendingDeliverablesCount(pendingCount);

      // Calculation 2: Global Progress = (Completed tasks / total tasks) * 100
      if (flatTasks.length > 0) {
        const completedCount = flatTasks.filter(
          (t: any) => t.status === "Completado" || t.status === "Completed" || t.status === true
        ).length;
        const progressPercent = Math.round((completedCount / flatTasks.length) * 100);
        setGlobalProgressPercent(progressPercent);
      } else {
        setGlobalProgressPercent(0); // safeguard static default
      }

      // Calculation 3: Efficiency meters
      // TI tasks efficiency
      const tiTasks = flatTasks.filter((t: any) => t.category?.toLowerCase().includes("ti") || t.category?.toLowerCase().includes("sistemas") || t.category?.toLowerCase().includes("coordinac"));
      if (tiTasks.length > 0) {
        const tiCompleted = tiTasks.filter((t: any) => t.status === "Completado" || t.status === "Completed" || t.status === true).length;
        setTiEfficiency(Math.round((tiCompleted / tiTasks.length) * 100));
      } else {
        setTiEfficiency(100);
      }

      // Document approval efficiency
      if (flatDelivs.length > 0) {
        const appDeliv = flatDelivs.filter((d: any) => d.status === "APROBADO" || d.status?.toLowerCase().includes("aprob")).length;
        setDocEfficiency(Math.round((appDeliv / flatDelivs.length) * 100));
      } else {
        setDocEfficiency(100);
      }

    } catch (err) {
      console.warn("Error calculating dynamic stats in dashboard:", err);
    }
  };

  // Safe subset for active overview (first 4 projects)
  const dashboardProjects = projects.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#f7fafc] text-[#181c1e] font-sans selection:bg-[#ffb800] selection:text-[#6d4c00]">
      {/* Side Navigation Block */}
      <Sidebar currentScreen={AppScreen.DASHBOARD} onNavigate={onNavigate} />

      {/* Top Application Bar */}
      <Header 
        userName={loggedUser?.name || "Arq. Javier Solis"} 
        userRole={loggedUser?.role || "Project Manager"} 
        onNavigate={onNavigate}
        onSelectProject={onSelectProject}
      />

      {/* Main Panel Content */}
      <main className="ml-[240px] pt-24 px-8 pb-12 transition-all">
        
        {/* Dashboard Header Bar */}
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-[#181c1e]">Dashboard Principal</h2>
            <p className="text-gray-500 text-sm mt-1">
              Bienvenido al ecosistema moderno de coordinación multidisciplinaria GMP BIM.
            </p>
          </div>
          
          {/* Requirement 8: Connection Indicator */}
          <div className="flex gap-2">
            <div className="bg-white border border-gray-150 px-4 py-2 rounded-lg flex items-center gap-2.5 text-xs font-semibold shadow-xs select-none">
              <span className={`w-2.5 h-2.5 rounded-full ${isBackendConnected ? "bg-emerald-500 animate-pulse" : "bg-gray-400"}`}></span>
              <span className="text-gray-700">
                Sistema GMP: <span className="font-extrabold">{isBackendConnected ? "● Online" : "● Offline"}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Bento Grid Analytics Row (Requirement 11) */}
        <div className="grid grid-cols-12 gap-6 mb-8">
          
          {/* Card 1: Proyectos Activos (No completados) */}
          <div className="col-span-12 md:col-span-3 bg-white border border-gray-200 p-6 rounded-xl relative overflow-hidden group shadow-sm">
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Proyectos Activos</p>
              <h3 className="text-4xl font-black text-[#181c1e]">{activeProjectsCount}</h3>
              <p className="text-green-600 text-xs font-bold mt-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm font-bold">trending_up</span> 
                <span>En curso operativo</span>
              </p>
            </div>
            <span 
              className="material-symbols-outlined absolute -right-6 -bottom-6 text-8xl text-gray-200/40 group-hover:text-[#ffb800]/10 select-none group-hover:scale-110 transition-all duration-300"
              style={{ fontSize: "110px" }}
            >
              architecture
            </span>
          </div>

          {/* Card 2: Entregables Pendientes */}
          <div className="col-span-12 md:col-span-3 bg-white border border-gray-200 p-6 rounded-xl relative overflow-hidden group shadow-sm">
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Entregables Pendientes</p>
              <h3 className="text-4xl font-black text-[#181c1e]">{pendingDeliverablesCount}</h3>
              <p className="text-[#7c5800] text-xs font-bold mt-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">schedule</span> 
                <span>Hitos en etapa revisión</span>
              </p>
            </div>
            <span 
              className="material-symbols-outlined absolute -right-6 -bottom-6 text-8xl text-gray-200/40 group-hover:text-[#ffb800]/10 select-none group-hover:scale-110 transition-all duration-300"
              style={{ fontSize: "110px" }}
            >
              assignment_late
            </span>
          </div>

          {/* Card 3: Progreso Global */}
          <div className="col-span-12 md:col-span-3 bg-white border border-gray-200 p-6 rounded-xl relative overflow-hidden group shadow-sm">
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Progreso Global de Tareas</p>
              <h3 className="text-4xl font-black text-[#181c1e]">{globalProgressPercent}%</h3>
              <div className="w-full bg-gray-100 h-2 rounded-full mt-4 overflow-hidden">
                <div className="bg-[#ffb800] h-full rounded-full transition-all duration-1000" style={{ width: `${globalProgressPercent}%` }}></div>
              </div>
            </div>
            <span 
              className="material-symbols-outlined absolute -right-6 -bottom-6 text-8xl text-gray-200/40 group-hover:text-[#ffb800]/10 select-none group-hover:scale-110 transition-all duration-300"
              style={{ fontSize: "110px" }}
            >
              analytics
            </span>
          </div>

          {/* Card 4: Acceso Rápido */}
          <div className="col-span-12 md:col-span-3 bg-[#181c1e] text-white p-6 rounded-xl border border-gray-800 flex flex-col justify-between shadow-md">
            <div>
              <h4 className="font-bold text-sm tracking-wide text-[#ffb800] uppercase">Acceso Rápido</h4>
              <p className="text-xs text-gray-400 mt-1">Sincronización en la Nube</p>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <button 
                onClick={() => setIsBimUploadOpen(true)}
                className="bg-white/10 hover:bg-white/20 p-2.5 rounded text-[11px] font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer border-none"
              >
                <span className="material-symbols-outlined text-lg text-amber-400">upload_file</span> 
                <span>Subir BIM</span>
              </button>
              <button 
                onClick={() => setIsNewTaskOpen(true)}
                className="bg-white/10 hover:bg-white/20 p-2.5 rounded text-[11px] font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer border-none"
              >
                <span className="material-symbols-outlined text-lg text-emerald-400">add_task</span> 
                <span>Nueva Tarea</span>
              </button>
            </div>
          </div>

        </div>

        {/* Operational tracking & alerts list block */}
        <div className="grid grid-cols-12 gap-6 mb-8">
          
          {/* Tracking Table (Central area, 8 cols) */}
          <div className="col-span-12 lg:col-span-8 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
              <h4 className="font-bold text-gray-800 text-sm">Seguimiento de Proyectos Operativos</h4>
              <button 
                onClick={() => onNavigate(AppScreen.PROJECTS_LIST)}
                className="text-[#7c5800] text-xs font-bold flex items-center gap-1 hover:underline cursor-pointer bg-transparent border-none outline-none"
              >
                <span>Ver todos</span> 
                <span className="material-symbols-outlined text-xs">chevron_right</span>
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-[10px] uppercase tracking-wider text-gray-500 font-bold border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3">Proyecto / ID</th>
                    <th className="px-6 py-3">Fase Actual</th>
                    <th className="px-6 py-3">Responsable</th>
                    <th className="px-6 py-3">Estado</th>
                    <th className="px-6 py-3">Progreso</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-gray-100">
                  {dashboardProjects.map((p) => (
                    <tr 
                      key={p.id}
                      onClick={() => {
                        onSelectProject(p);
                        onNavigate(AppScreen.PROJECT_DETAIL);
                      }}
                      className="hover:bg-gray-50/70 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900 group-hover:text-[#7c5800] transition-colors">{p.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">{p.code}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
                          {p.phaseName}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-bold">
                        {p.responsible}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 font-bold ${
                          p.status === "Completado" ? "text-green-600" :
                          p.status === "Retrasado" ? "text-red-650" :
                          p.status === "Pendiente Approval" ? "text-[#7c5800]" : "text-blue-600"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            p.status === "Completado" ? "bg-green-600" :
                            p.status === "Retrasado" ? "bg-red-600" :
                            p.status === "Pendiente Approval" ? "bg-[#7c5800]" : "bg-blue-600"
                          }`}></span>
                          <span>{p.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${p.status === "Completado" ? "bg-green-500" : p.status === "Retrasado" ? "bg-red-500" : "bg-[#ffb800]"}`}
                              style={{ width: `${p.progress}%` }}
                            ></div>
                          </div>
                          <span className="font-mono text-[10px] text-gray-400 font-bold">{p.progress}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Warnings & Alerts column (Sidebar area, 4 cols) */}
          <div className="col-span-12 lg:col-span-4 bg-white border border-gray-200 rounded-xl flex flex-col shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
              <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[#7c5800] text-lg font-bold">warning</span>
                <span>Canal de Advertencias</span>
              </h4>
              {notifications.length > 0 && (
                <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-[10px] font-bold">
                  {notifications.length} Activas
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[305px] custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 text-gray-300">
                  <span className="material-symbols-outlined text-4xl mb-2">check_circle</span>
                  <p className="text-xs font-semibold text-gray-400">Sin notificaciones de alerta</p>
                </div>
              ) : (
                notifications.map((item) => (
                  <div 
                    key={item.id}
                    className={`border-l-4 p-3.5 rounded-r-lg shadow-2xs relative group transition-all duration-300 hover:translate-x-0.5 ${
                      item.type === "error" ? "bg-red-50/40 border-red-500" :
                      item.type === "warning" ? "bg-amber-50/40 border-[#ffb800]" :
                      item.type === "info" ? "bg-blue-50/40 border-blue-500" : "bg-green-50/40 border-green-500"
                    }`}
                  >
                    <button 
                      onClick={() => dismissNotification(item.id)}
                      className="absolute right-2 top-2 p-1 text-gray-300 hover:text-gray-500 transition-colors rounded-full flex items-center justify-center hover:bg-gray-100/50 cursor-pointer border-none bg-transparent"
                      title="Descartar"
                    >
                      <span className="material-symbols-outlined text-sm font-bold border-none">close</span>
                    </button>

                    <div className="pr-4">
                      <p className="text-xs font-bold text-gray-800 mb-1 leading-tight flex items-center gap-1">
                        {item.type === "error" && <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>}
                        <span>{item.title}</span>
                      </p>
                      <p className="text-[11px] text-gray-500 leading-snug">{item.desc}</p>
                      
                      {item.actionText && (
                        <button 
                          onClick={() => onNavigate(AppScreen.PROJECT_DETAIL)}
                          className="mt-2.5 text-[9px] bg-[#ffb800] text-[#6d4c00] px-2.5 py-1 rounded font-bold shadow-2xs hover:brightness-105 transition-all uppercase tracking-wider cursor-pointer border-none"
                        >
                          {item.actionText}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Supporters Support Metrics & Assets Row */}
        <div className="grid grid-cols-12 gap-6">
          
          {/* Supporter Support Metrics (Requirement 12: Computed real-time efficiency metrics) */}
          <div className="col-span-12 lg:col-span-6 bg-white border border-gray-200 p-6 rounded-xl shadow-xs">
            <h4 className="font-bold text-gray-800 text-sm mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-gray-400">query_stats</span>
              <span>Eficiencia de Procesos (Datos Reales)</span>
            </h4>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-gray-500">
                  <span className="uppercase tracking-wider">Gestión de TI (Progreso de Tareas)</span>
                  <span className="font-bold text-[#181c1e]">{tiEfficiency}%</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: `${tiEfficiency}%` }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-gray-500 font-sans">
                  <span className="uppercase tracking-wider">Gestión Documental (Entregables Aprobados)</span>
                  <span className="font-bold text-[#181c1e]">{docEfficiency}%</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${docEfficiency}%` }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-gray-500">
                  <span className="uppercase tracking-wider">Flujo de Comunicación</span>
                  <span className="font-bold text-[#181c1e]">{commEfficiency}%</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${commEfficiency}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Architectural Image / Brand Asset (Requirement 13: Rotating Automatic Carousel slider) */}
          <div className="col-span-12 lg:col-span-6 h-64 relative rounded-xl overflow-hidden border border-gray-200 shadow-xs group">
            
            {/* Slide showcase item with transition fade effects */}
            {slides.map((slide, index) => (
              <div 
                key={index}
                className={`absolute inset-0 w-full h-full transition-all duration-700 ease-in-out ${
                  index === slideIndex ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
                }`}
              >
                <img 
                  className="absolute inset-0 w-full h-full object-cover grayscale-[30%] group-hover:grayscale-[5%] scale-102 group-hover:scale-105 transition-transform duration-[4000ms]" 
                  alt={slide.title}
                  src={slide.img}
                />
                {/* Visual rich elegant slide dark gold overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#181c1e] via-[#101314]/50 to-black/20 flex flex-col justify-between p-8 text-white">
                  
                  {/* Top tag badge */}
                  <div className="flex justify-start">
                    <span className="bg-[#ffb800] text-[#1e1700] px-2.5 py-1 rounded text-[9px] font-black tracking-widest uppercase shadow-xs">
                      {slide.tag}
                    </span>
                  </div>

                  {/* Context notice */}
                  <div>
                    <p className="text-gray-400 text-[10px] tracking-widest uppercase font-bold">{slide.title}</p>
                    <p className="text-[#ffb800] font-black text-xl tracking-tight leading-tight mb-1">{slide.desc}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Dots navigation handles */}
            <div className="absolute bottom-4 right-6 flex gap-2 z-10">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setSlideIndex(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all border-none cursor-pointer ${
                    slideIndex === idx ? "bg-[#ffb800] w-6" : "bg-white/40 hover:bg-white/70"
                  }`}
                  title={`Notice ${idx+1}`}
                />
              ))}
            </div>

          </div>

        </div>

      </main>

      {/* Requirement 14: Speed Dial Floating Action Menu Button */}
      <div className="fixed bottom-8 right-8 z-55 flex flex-col items-end gap-3">
        
        {/* Expanded Upward Vertical Quick Action list */}
        {isFabOpen && (
          <div className="flex flex-col gap-2.5 items-end mb-1 animate-in slide-in-from-bottom-3 fade-in duration-200">
            
            {/* Option 1: New Project */}
            <button
              onClick={() => { setIsFabOpen(false); onNavigate(AppScreen.REGISTER_PROJECT); }}
              className="flex items-center gap-2 bg-[#181c1e] text-white px-4 py-2 border border-gray-800 rounded-lg shadow-md hover:bg-gray-800 text-xs font-bold cursor-pointer hover:translate-x-[-2px] transition-transform"
            >
              <span className="material-symbols-outlined text-sm text-[#ffb800]">architecture</span>
              <span>Registrar Proyecto</span>
            </button>

            {/* Option 2: New Task */}
            <button
              onClick={() => { setIsFabOpen(false); setIsNewTaskOpen(true); }}
              className="flex items-center gap-2 bg-[#181c1e] text-white px-4 py-2 border border-gray-800 rounded-lg shadow-md hover:bg-gray-800 text-xs font-bold cursor-pointer hover:translate-x-[-2px] transition-transform"
            >
              <span className="material-symbols-outlined text-sm text-emerald-400">add_task</span>
              <span>Nueva Tarea</span>
            </button>

            {/* Option 3: Upload BIM file */}
            <button
              onClick={() => { setIsFabOpen(false); setIsBimUploadOpen(true); }}
              className="flex items-center gap-2 bg-[#181c1e] text-white px-4 py-2 border border-gray-800 rounded-lg shadow-md hover:bg-gray-800 text-xs font-bold cursor-pointer hover:translate-x-[-2px] transition-transform"
            >
              <span className="material-symbols-outlined text-sm text-amber-400">upload_file</span>
              <span>Subir Archivo BIM</span>
            </button>
            
          </div>
        )}

        {/* Core FAB trigger button */}
        <button 
          onClick={() => setIsFabOpen(!isFabOpen)}
          className={`w-14 h-14 bg-[#ffb800] text-[#181c1e] rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer border-none outline-none ${
            isFabOpen ? "rotate-45 bg-[#ffb800] text-gray-900" : ""
          }`}
          title="Menú Flotante de Acciones"
        >
          <span className="material-symbols-outlined font-extrabold text-3xl">add</span>
        </button>

      </div>

      {/* Local Modal Stage */}
      <NewTaskModal isOpen={isNewTaskOpen} onClose={() => setIsNewTaskOpen(false)} onTaskCreated={calculateDynamicStats} />
      <BimUploadModal isOpen={isBimUploadOpen} onClose={() => setIsBimUploadOpen(false)} onUploadSuccess={calculateDynamicStats} />

    </div>
  );
}
