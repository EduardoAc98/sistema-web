import React, { useState, useEffect, useRef } from "react";
import { AppScreen, Project } from "../types";
import { api, getSavedUser, saveUser } from "../api";
import SettingsModal from "./SettingsModal";
import AccountModal from "./AccountModal";
import NewTaskModal from "./NewTaskModal";
import BimUploadModal from "./BimUploadModal";
import { toast } from "./Toast";

interface HeaderProps {
  userRole?: string;
  userName?: string;
  userAvatar?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  onNavigate?: (screen: AppScreen) => void;
  onSelectProject?: (project: Project) => void;
}

interface AlertNotification {
  id: string;
  title: string;
  desc: string;
  type: string;
  date?: string;
  read: boolean;
}

export default function Header({
  userRole: propRole,
  userName: propName,
  userAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuCthXgoeC8twArVnzgpGRnUv2jswYr9b8WgXlf6wJNWhdi5A-yRR7CaNz1IMpueffr6aDUe0pQlvmkE-G2iXqqI-9Pe8MVVvXm1wp6FelVrRoaDRbAXSUe1DKhRFxt4QXJqol-7KO-EFxx4XUtz5fNONZUkb5jWPE_KKQK2tXjAlQJIds8LGAXoIjwkY_zcng2lvTtWNSwag_iLXgZGKx7hXIoQkbvLJj9z1AneHGlMLsAkPl7mFLW0QIpb6D1ACuxWWNq8JwrBZPuC",
  onSearchChange,
  searchPlaceholder = "Buscar proyectos, archivos o tareas...",
  onNavigate,
  onSelectProject
}: HeaderProps) {
  const [user, setUser] = useState<any>(null);

  // Panels visibility toggles
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showAppsMenu, setShowAppsMenu] = useState(false);

  // Search box state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchCacheBuilt, setSearchCacheBuilt] = useState(false);

  // Search datasets cache
  const [projectsCache, setProjectsCache] = useState<Project[]>([]);
  const [usersCache, setUsersCache] = useState<any[]>([]);
  const [tasksCache, setTasksCache] = useState<any[]>([]);
  const [filesCache, setFilesCache] = useState<any[]>([]);
  const [delivsCache, setDelivsCache] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Password reset inside profile dropdown
  const [dropdownNewPassword, setDropdownNewPassword] = useState("");
  const [dropdownConfirmPassword, setDropdownConfirmPassword] = useState("");
  const [dropdownPasswordSectionExpanded, setDropdownPasswordSectionExpanded] = useState(false);

  // Dynamic notifications state
  const [notifications, setNotifications] = useState<AlertNotification[]>([
    {
      id: "not-1",
      title: "Vencimiento Próximo (RF-11)",
      desc: "Puente Interconector requiere levantamiento urgente. Faltan 2 horas.",
      type: "error",
      date: "Hoy, 12:45",
      read: false
    },
    {
      id: "not-2",
      title: "Nuevo Entregable Cargado",
      desc: 'Colaborador subió "Diseño_Estructural_V2.rvt" para el Proyecto Sigma.',
      type: "warning",
      date: "Ayer, 18:22",
      read: false
    },
    {
      id: "not-3",
      title: "Comentario nuevo",
      desc: 'Lucía M: "Revisar espesores de placa en el eje 4, parece incongruente."',
      type: "info",
      date: "13 Jun 2026, 12:15",
      read: true
    }
  ]);

  // Global modals control states
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [isBimUploadOpen, setIsBimUploadOpen] = useState(false);

  // Refs for tracking outside-clicks to close panels
  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const appsRef = useRef<HTMLDivElement>(null);

  // Loading profile data from active session
  const reloadUserProfile = () => {
    const saved = getSavedUser();
    if (saved) {
      setUser(saved);
    }
  };

  useEffect(() => {
    reloadUserProfile();
    
    // Listen to profile updates made elsewhere (AccountModal)
    const handleProfileUpdate = () => {
      reloadUserProfile();
    };
    window.addEventListener("gmp_profile_updated", handleProfileUpdate);
    return () => {
      window.removeEventListener("gmp_profile_updated", handleProfileUpdate);
    };
  }, []);

  // Fetch alerts from backend to make notifications dynamic!
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const dbAlerts = await api.getAlerts();
        if (dbAlerts && dbAlerts.length > 0) {
          const formatted = dbAlerts.map((alt: any, index: number) => ({
            id: alt.id || `db-alt-${index}`,
            title: alt.title || "Notificación de Alerta",
            desc: alt.desc || "",
            type: alt.type || "info",
            date: "Hace poco",
            read: false
          }));
          setNotifications(prev => {
            // Merge unique ones
            const existingIds = new Set(prev.map(n => n.id));
            const filteredNew = formatted.filter((n: any) => !existingIds.has(n.id));
            return [...filteredNew, ...prev];
          });
        }
      } catch (err) {
        console.warn("Could not merge backend alerts", err);
      }
    };
    fetchAlerts();
  }, []);

  // Click outside to collapse menus
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifMenu(false);
      }
      if (appsRef.current && !appsRef.current.contains(event.target as Node)) {
        setShowAppsMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Load backend datasets for local fast-cache global queries
  const buildSearchCache = async () => {
    if (searchCacheBuilt) return;
    try {
      const prjs = await api.getProjects();
      setProjectsCache(prjs);
      
      const usrs = await api.getUsers();
      setUsersCache(usrs);

      // Resolve tasks, files, and deliverables for each project in parallel
      const tasksPromises = prjs.map(p => api.getTasks(p.id).catch(() => []));
      const filesPromises = prjs.map(p => api.getFiles(p.id).catch(() => []));
      const delivPromises = prjs.map(p => api.getDeliverables(p.id).catch(() => []));

      const tasksResults = await Promise.all(tasksPromises);
      const filesResults = await Promise.all(filesPromises);
      const delivResults = await Promise.all(delivPromises);

      setTasksCache(tasksResults.flat());
      setFilesCache(filesResults.flat());
      setDelivsCache(delivResults.flat());
      
      setSearchCacheBuilt(true);
    } catch (err) {
      console.error("Error building search cache:", err);
    }
  };

  // Live filter query executor
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const term = searchQuery.toLowerCase();
    const results: any[] = [];

    // 1. Projects search
    projectsCache.forEach((p) => {
      if (p.name.toLowerCase().includes(term) || p.code.toLowerCase().includes(term) || p.description.toLowerCase().includes(term)) {
        results.push({
          type: "Proyecto",
          title: p.name,
          subtitle: `Código: ${p.code} | Fase: ${p.phaseName}`,
          icon: "architecture",
          item: p
        });
      }
    });

    // 2. Tasks search
    tasksCache.forEach((t) => {
      if (t.name.toLowerCase().includes(term) || t.category.toLowerCase().includes(term)) {
        results.push({
          type: "Tarea",
          title: t.name,
          subtitle: `Asignado: ${t.assignedTo} | ${t.category}`,
          icon: "task_alt",
          item: t
        });
      }
    });

    // 3. Users search (Visible only to Administrador role)
    if (user?.role === "Administrador") {
      usersCache.forEach((u) => {
        if (u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term) || u.discipline.toLowerCase().includes(term)) {
          results.push({
            type: "Usuario",
            title: u.name,
            subtitle: `Rol: ${u.role} | Disciplina: ${u.discipline}`,
            icon: "person",
            item: u
          });
        }
      });
    }

    // 4. Deliverables search
    delivsCache.forEach((d) => {
      if (d.name.toLowerCase().includes(term) || d.lod?.toLowerCase().includes(term)) {
        results.push({
          type: "Entregable",
          title: d.name,
          subtitle: `LOD: ${d.lod || "LOD 400"} | Estado: ${d.status}`,
          icon: "box",
          item: d
        });
      }
    });

    // 5. Files search
    filesCache.forEach((f) => {
      if (f.name.toLowerCase().includes(term)) {
        results.push({
          type: "Archivo BIM",
          title: f.name,
          subtitle: `Tamaño: ${f.size} | Subido: ${f.uploadedAt}`,
          icon: "folder_zip",
          item: f
        });
      }
    });

    setSearchResults(results.slice(0, 8)); // top 8 results
  }, [searchQuery, projectsCache, tasksCache, usersCache, filesCache, delivsCache]);

  const handleSelectSearchResult = (res: any) => {
    setSearchQuery("");
    setSearchFocused(false);

    if (!onNavigate) {
      toast.info(`Navegar a: ${res.type} - ${res.title}.`);
      return;
    }

    if (res.type === "Proyecto") {
      if (onSelectProject) onSelectProject(res.item);
      onNavigate(AppScreen.PROJECT_DETAIL);
    } else if (res.type === "Tarea") {
      // Find parent project and select
      const parent = projectsCache.find(p => p.id === res.item.projectId);
      if (parent && onSelectProject) onSelectProject(parent);
      localStorage.setItem("gmp_bim_active_tab", "tareas");
      onNavigate(AppScreen.PROJECT_DETAIL);
    } else if (res.type === "Usuario") {
      onNavigate(AppScreen.USERS_AND_ROLES);
    } else if (res.type === "Entregable") {
      const parent = projectsCache.find(p => p.id === res.item.projectId);
      if (parent && onSelectProject) onSelectProject(parent);
      localStorage.setItem("gmp_bim_active_tab", "entregables");
      onNavigate(AppScreen.PROJECT_DETAIL);
    } else if (res.type === "Archivo BIM") {
      const parent = projectsCache.find(p => p.id === res.item.projectId);
      if (parent && onSelectProject) onSelectProject(parent);
      localStorage.setItem("gmp_bim_active_tab", "archivos");
      onNavigate(AppScreen.PROJECT_DETAIL);
    }
  };

  const handleSaveDropdownPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dropdownNewPassword) return;
    if (dropdownNewPassword !== dropdownConfirmPassword) {
      toast.warning("Las contraseñas no coinciden.");
      return;
    }
    try {
      await api.updateUser(user.id, { password: dropdownNewPassword } as any);
      toast.success("Su nueva contraseña se guardó de forma correcta.");
      setDropdownNewPassword("");
      setDropdownConfirmPassword("");
      setDropdownPasswordSectionExpanded(false);
      setShowProfileMenu(false);
    } catch {
      toast.error("Fallo la actualización rápida de contraseña.");
    }
  };

  const handleLogoutClick = () => {
    api.logout();
    if (onNavigate) {
      onNavigate(AppScreen.LOGIN);
    } else {
      window.location.reload();
    }
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleMarkOneRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const triggerSearchInputFocus = () => {
    setSearchFocused(true);
    buildSearchCache();
  };

  const countUnread = notifications.filter(n => !n.read).length;

  return (
    <>
      <header className="fixed top-0 right-0 w-[calc(100%-240px)] bg-white h-16 border-b border-gray-200 flex items-center justify-between px-8 z-40 selection:bg-[#ffb800] selection:text-[#6d4c00]">
        
        {/* Requirement 2: Global Search Area Box */}
        <div ref={searchRef} className="flex items-center gap-4 flex-1 relative">
          <div className="relative w-full max-w-md group transition-all duration-300">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#7c5800] transition-colors select-none">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onFocus={triggerSearchInputFocus}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (onSearchChange) onSearchChange(e.target.value);
              }}
              placeholder={searchPlaceholder}
              className="w-full bg-gray-50 border border-gray-200 focus:border-[#ffb800] rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-[#ffb800] outline-none transition-all placeholder:text-gray-400"
            />

            {/* Clear query trigger */}
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-450 hover:text-gray-650 cursor-pointer text-xs"
              >
                <span className="material-symbols-outlined text-sm font-bold">close</span>
              </button>
            )}
          </div>

          {/* Search Results Dropdown Panel */}
          {searchFocused && (searchQuery.trim() || searchResults.length > 0) && (
            <div className="absolute top-12 left-0 w-full max-w-lg bg-white border border-gray-200 rounded-xl shadow-lg z-[80] overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="p-3 bg-gray-50 border-b border-gray-150 flex justify-between items-center text-[10px] uppercase tracking-wider font-bold text-gray-400">
                <span>Resultados de Búsqueda Global ({searchResults.length})</span>
                {searchQuery && <span className="font-mono text-gray-400">Buscando: "{searchQuery}"</span>}
              </div>

              {searchResults.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <span className="material-symbols-outlined text-3xl mb-1">find_in_page</span>
                  <p className="text-xs">No se encontraron proyectos, tareas, usuarios, entregables ni archivos matching.</p>
                </div>
              ) : (
                <div className="max-h-[350px] overflow-y-auto divide-y divide-gray-100">
                  {searchResults.map((res, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectSearchResult(res)}
                      className="w-full text-left p-3.5 hover:bg-gray-50 transition-colors flex items-start gap-3 cursor-pointer group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center group-hover:bg-[#ffb800]/20 group-hover:text-[#7c5800] transition-colors shrink-0">
                        <span className="material-symbols-outlined text-lg">{res.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <p className="text-xs font-bold text-gray-805 truncate group-hover:text-[#7c5800] transition-colors">{res.title}</p>
                          <span className="bg-gray-100 text-gray-500 rounded px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider scale-90">{res.type}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 truncate mt-0.5">{res.subtitle}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Menu, apps matrix trigger, notifications, help links */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 text-gray-500">
            
            {/* Requirement 3: Campana de Notificaciones icon drop */}
            <div ref={notifRef} className="relative">
              <button 
                onClick={() => {
                  setShowNotifMenu(!showNotifMenu);
                  setShowProfileMenu(false);
                  setShowAppsMenu(false);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-transform scale-95 hover:scale-100 relative active:scale-90 cursor-pointer"
                title="Notificaciones de Alerta"
              >
                <span className="material-symbols-outlined text-[22px] select-none text-gray-700">notifications</span>
                {countUnread > 0 && (
                  <span className="absolute top-1.5 right-1.5 bg-red-600 text-white font-black text-[8px] h-3.5 min-w-3.5 px-0.5 flex items-center justify-center rounded-full ring-2 ring-white">
                    {countUnread}
                  </span>
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 top-11 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="p-4 bg-gray-50 border-b border-gray-150 flex justify-between items-center text-xs font-bold text-gray-800">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[#7c5800] text-sm">notifications</span>
                      <span>Notificaciones Activas</span>
                    </span>
                    {countUnread > 0 && (
                      <button 
                        type="button"
                        onClick={handleMarkAllRead}
                        className="text-[10px] text-blue-600 hover:underline cursor-pointer"
                      >
                        Marcar leídas
                      </button>
                    )}
                  </div>

                  <div className="max-h-[300px] overflow-y-auto divide-y divide-gray-100">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-400">
                        <span className="material-symbols-outlined text-3xl mb-1">check_circle</span>
                        <p className="text-xs font-medium">No tiene notificaciones activas</p>
                      </div>
                    ) : (
                      notifications.map((item) => (
                        <div 
                          key={item.id} 
                          onClick={() => handleMarkOneRead(item.id)}
                          className={`p-3.5 transition-colors cursor-pointer hover:bg-gray-50 relative ${!item.read ? "bg-amber-50/20" : ""}`}
                        >
                          {!item.read && (
                            <span className="absolute left-2.5 top-4.5 w-1.5 h-1.5 bg-[#ffb800] rounded-full"></span>
                          )}
                          <div className="pl-3">
                            <p className="text-xs font-bold text-gray-850 leading-tight">{item.title}</p>
                            <p className="text-[10px] text-gray-500 mt-0.5 leading-snug">{item.desc}</p>
                            <p className="text-[8px] text-gray-400 mt-1 font-mono font-bold uppercase">{item.date}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-2 border-t border-gray-150 bg-gray-50 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        handleMarkAllRead();
                        toast.success("Todas las notificaciones marcadas como leídas.");
                        setShowNotifMenu(false);
                      }}
                      className="w-full py-1 text-[10px] text-[#7c5800] hover:bg-gray-100 rounded font-black uppercase tracking-wider cursor-pointer"
                    >
                      Marcar todo como leído
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Requirement 4: Grid App matrix Menu */}
            <div ref={appsRef} className="relative">
              <button 
                onClick={() => {
                  setShowAppsMenu(!showAppsMenu);
                  setShowProfileMenu(false);
                  setShowNotifMenu(false);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-transform scale-95 hover:scale-100 active:scale-95 cursor-pointer"
                title="Menú Rápido de Aplicaciones"
              >
                <span className="material-symbols-outlined text-[22px] select-none text-gray-700">apps</span>
              </button>

              {showAppsMenu && (
                <div className="absolute right-0 top-11 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-4 animate-in fade-in slide-in-from-top-1 duration-150">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 pb-1.5">Accesos Directos Matrix</p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => { setShowAppsMenu(false); onNavigate?.(AppScreen.DASHBOARD); }}
                      className="p-2.5 rounded-lg border border-gray-100 hover:border-[#ffb800]/50 hover:bg-gray-50 text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-amber-500 text-lg">dashboard</span>
                      <span className="text-[10px] font-bold text-gray-700">Dashboard</span>
                    </button>

                    <button
                      onClick={() => { setShowAppsMenu(false); onNavigate?.(AppScreen.PROJECTS_LIST); }}
                      className="p-2.5 rounded-lg border border-gray-100 hover:border-[#ffb800]/50 hover:bg-gray-50 text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-blue-500 text-lg">architecture</span>
                      <span className="text-[10px] font-bold text-gray-700">Proyectos</span>
                    </button>

                    <button
                      onClick={() => { setShowAppsMenu(false); onNavigate?.(AppScreen.USERS_AND_ROLES); }}
                      className="p-2.5 rounded-lg border border-gray-100 hover:border-[#ffb800]/50 hover:bg-gray-50 text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-emerald-500 text-lg">group</span>
                      <span className="text-[10px] font-bold text-gray-700">Usuarios</span>
                    </button>

                    <button
                      onClick={() => { setShowAppsMenu(false); onNavigate?.(AppScreen.REPORTS_CENTER); }}
                      className="p-2.5 rounded-lg border border-gray-100 hover:border-[#ffb800]/50 hover:bg-gray-50 text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-indigo-500 text-lg">assessment</span>
                      <span className="text-[10px] font-bold text-gray-700">Reportes</span>
                    </button>

                    <button
                      onClick={() => { setShowAppsMenu(false); setIsAccountOpen(true); }}
                      className="p-2.5 rounded-lg border border-gray-100 hover:border-[#ffb800]/50 hover:bg-gray-50 text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer col-span-1"
                    >
                      <span className="material-symbols-outlined text-rose-500 text-lg">person</span>
                      <span className="text-[10px] font-bold text-gray-700">Mi Cuenta</span>
                    </button>

                    <button
                      onClick={() => { setShowAppsMenu(false); setIsSettingsOpen(true); }}
                      className="p-2.5 rounded-lg border border-gray-100 hover:border-[#ffb800]/50 hover:bg-gray-50 text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer col-span-1"
                    >
                      <span className="material-symbols-outlined text-gray-500 text-lg">settings</span>
                      <span className="text-[10px] font-bold text-gray-700">Ajustes</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Opciones adicionales de soporte/ayuda removidas temporalmente */}
          </div>

          {/* Requirement 6: Dynamic Interactive Profile sub-dropdown context menu */}
          <div ref={profileRef} className="relative">
            <div 
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifMenu(false);
                setShowAppsMenu(false);
              }}
              className="flex items-center gap-3 pl-4 border-l border-gray-100 cursor-pointer hover:opacity-90 select-none group"
            >
              <div className="text-right">
                <p className="font-bold text-sm text-[#181c1e] leading-none group-hover:text-[#7c5800] transition-colors">
                  {user?.name || propName || "Arq. Javier Solis"}
                </p>
                <p className="text-[10px] text-gray-400 mt-1 font-bold uppercase tracking-wider">
                  {user?.role || propRole || "Project Manager"}
                </p>
              </div>
              <div className="relative shrink-0">
                <div className={`w-10 h-10 rounded-full border-2 border-[#ffb800] ${user?.avatarBg || "bg-amber-500"} text-white font-black flex items-center justify-center text-sm shadow-xs select-none object-cover`}>
                  {user?.avatarInitials || "JS"}
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
              </div>
            </div>

            {showProfileMenu && (
              <div className="absolute right-0 top-12 w-72 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-3 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-4 py-2 border-b border-gray-100 pb-3">
                  <p className="font-bold text-xs text-gray-400 uppercase tracking-widest leading-none">Conectado como</p>
                  <p className="font-bold text-sm text-gray-800 truncate mt-1.5">{user?.name || "Javier Solis"}</p>
                  <p className="text-[11px] text-gray-400 truncate leading-none mt-1">{user?.email || "j.solis@gmpbim.com"}</p>
                </div>

                <div className="py-2.5">
                  {/* Account detail profile trigger */}
                  <button
                    type="button"
                    onClick={() => { setShowProfileMenu(false); setIsAccountOpen(true); }}
                    className="w-full px-4 py-2 text-left text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-gray-400 text-lg">manage_accounts</span>
                    <span>Mi cuenta</span>
                  </button>

                  {/* Collapsible fast password editor */}
                  <div className="border-t border-gray-50 mt-1.5 pt-1.5">
                    <button
                      type="button"
                      onClick={() => setDropdownPasswordSectionExpanded(!dropdownPasswordSectionExpanded)}
                      className="w-full px-4 py-2 text-left text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-gray-400 text-lg">lock</span>
                        <span>Cambiar contraseña</span>
                      </span>
                      <span className="material-symbols-outlined text-gray-400 text-sm">
                        {dropdownPasswordSectionExpanded ? "expand_less" : "expand_more"}
                      </span>
                    </button>

                    {dropdownPasswordSectionExpanded && (
                      <form onSubmit={handleSaveDropdownPassword} className="px-4 py-3 bg-gray-50 space-y-2.5 mt-1 border-y border-gray-100">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Nueva contraseña</label>
                          <input
                            type="password"
                            required
                            placeholder="Mínimo 6 caracteres"
                            value={dropdownNewPassword}
                            onChange={(e) => setDropdownNewPassword(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded p-1.5 text-xs font-semibold outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Repetir contraseña</label>
                          <input
                            type="password"
                            required
                            placeholder="Repita contraseña"
                            value={dropdownConfirmPassword}
                            onChange={(e) => setDropdownConfirmPassword(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded p-1.5 text-xs font-semibold outline-none"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full py-1.5 bg-[#ffb800] text-[#6d4c00] font-black uppercase text-[10px] tracking-wider rounded transition-all cursor-pointer"
                        >
                          Guardar Contraseña
                        </button>
                      </form>
                    )}
                  </div>

                  {/* Logout section */}
                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <button
                      type="button"
                      onClick={handleLogoutClick}
                      className="w-full px-4 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-lg">logout</span>
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>

      </header>

      {/* Embedded Global Modals Stage */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      
      <AccountModal isOpen={isAccountOpen} onClose={() => setIsAccountOpen(false)} />
      
      <NewTaskModal isOpen={isNewTaskOpen} onClose={() => setIsNewTaskOpen(false)} />
      
      <BimUploadModal isOpen={isBimUploadOpen} onClose={() => setIsBimUploadOpen(false)} />
    </>
  );
}
