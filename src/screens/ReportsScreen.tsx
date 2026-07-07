import React, { useState, useEffect } from "react";
import { AppScreen, Project } from "../types";
import { api, getSavedUser } from "../api";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

interface ReportsScreenProps {
  onNavigate: (screen: AppScreen) => void;
  onSelectProject: (project: Project) => void;
}

export default function ReportsScreen({ onNavigate, onSelectProject }: ReportsScreenProps) {
  const [loggedUser, setLoggedUser] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoggedUser(getSavedUser());
    
    api.getProjects()
      .then((data) => {
        setProjects(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching projects for reports:", err);
        setLoading(false);
      });

    api.getGeneralReportStats()
      .then((data) => {
        setStats(data);
      })
      .catch((err) => {
        console.error("Error fetching general stats:", err);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#f7fafc] text-[#181c1e] font-sans selection:bg-[#ffb800] selection:text-[#6d4c00]">
      {/* Sidebar Selector */}
      <Sidebar currentScreen={AppScreen.REPORTS_CENTER} onNavigate={onNavigate} />

      {/* Header Slot */}
      <Header 
        userName={loggedUser?.name || "Arq. Javier Solis"} 
        userRole={loggedUser?.role || "Project Manager"} 
        onNavigate={onNavigate}
      />

      {/* Main Panel Content */}
      <main className="ml-[240px] pt-24 px-8 pb-12 transition-soft">
        
        {/* Breadcrumb path */}
        <div className="flex items-center gap-2 text-gray-400 mb-6 uppercase text-[10px] tracking-widest font-bold">
          <button onClick={() => onNavigate(AppScreen.DASHBOARD)} className="hover:text-[#7c5800] cursor-pointer">
            Dashboard
          </button>
          <span className="material-symbols-outlined text-xs select-none">chevron_right</span>
          <span className="text-[#7c5800]">Centro de Reportes</span>
        </div>

        {/* Header content section */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h3 className="text-3xl font-bold tracking-tight text-[#181c1e]">Centro de Reportes</h3>
            <p className="text-gray-500 text-sm mt-1 mb-1">
              Visualice e imprima reportes consolidados del rendimiento del portafolio en tiempo real.
            </p>
          </div>
        </div>

        {/* Reporte General del Sistema */}
        <section className="bg-white border border-gray-200 rounded-xl p-8 shadow-xs mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <span className="bg-[#ffb800]/15 text-[#7c5800] px-3.5 py-1 rounded text-[10px] font-black uppercase tracking-widest">
                INDICADORES GENERALES
              </span>
              <h4 className="text-xl font-bold text-[#181c1e] tracking-tight mt-2 font-sans">Reporte General del Sistema</h4>
              <p className="text-gray-500 text-sm mt-1">
                Resumen analítico en tiempo real calculado a partir de todos los registros en el sistema.
              </p>
            </div>
            
            <button
              onClick={() => onNavigate(AppScreen.PREVIEW_GENERAL_REPORT)}
              className="bg-[#ffb800] text-[#6d4c00] font-bold px-6 py-3.5 rounded-lg text-xs hover:brightness-105 active:scale-98 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer uppercase tracking-wider"
            >
              <span className="material-symbols-outlined text-sm font-bold">visibility</span>
              <span>Ver reporte general</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-[10px] text-gray-400 uppercase font-black">PROYECTOS TOTALES</p>
              <p className="text-2xl font-black text-[#1c1c1c] mt-1">{stats ? stats.totalProjects : 0}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-[10px] text-gray-400 uppercase font-black">PROYECTOS ACTIVOS</p>
              <p className="text-2xl font-black text-[#1c1c1c] mt-1">{stats ? stats.activeProjects : 0}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-[10px] text-gray-400 uppercase font-black">PROYECTOS COMPLETADOS</p>
              <p className="text-2xl font-black text-[#1c1c1c] mt-1">{stats ? stats.completedProjects : 0}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-[10px] text-gray-400 uppercase font-black">TOTAL DE TAREAS</p>
              <p className="text-2xl font-black text-[#1c1c1c] mt-1">{stats ? stats.totalTasks : 0}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-[10px] text-gray-400 uppercase font-black">TAREAS PENDIENTES</p>
              <p className="text-2xl font-black text-[#1c1c1c] mt-1">{stats ? stats.pendingTasks : 0}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-[10px] text-gray-400 uppercase font-black">TAREAS EN PROGRESO</p>
              <p className="text-2xl font-black text-[#1c1c1c] mt-1">{stats ? stats.inProgressTasks : 0}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-[10px] text-gray-400 uppercase font-black">TAREAS COMPLETADAS</p>
              <p className="text-2xl font-black text-[#1c1c1c] mt-1">{stats ? stats.completedTasks : 0}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-[10px] text-gray-400 uppercase font-black">TOTAL ENTREGABLES</p>
              <p className="text-2xl font-black text-[#1c1c1c] mt-1">{stats ? stats.totalDeliverables : 0}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-[10px] text-gray-400 uppercase font-black">ENTREGABLES PEND.</p>
              <p className="text-2xl font-black text-[#1c1c1c] mt-1">{stats ? stats.pendingDeliverables : 0}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-[10px] text-gray-400 uppercase font-black">ENTREGABLES APROB.</p>
              <p className="text-2xl font-black text-[#1c1c1c] mt-1">{stats ? stats.approvedDeliverables : 0}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-[10px] text-gray-400 uppercase font-black">TOTAL ARCHIVOS</p>
              <p className="text-2xl font-black text-[#1c1c1c] mt-1">{stats ? stats.totalFiles : 0}</p>
            </div>
            <div className="bg-[#ffb800]/10 p-4 rounded-xl border border-[#ffb800]/30">
              <p className="text-[10px] text-[#7c5800] uppercase font-black">AVANCE PROMEDIO</p>
              <p className="text-2xl font-black text-[#7c5800] mt-1">{stats ? `${stats.averageProgress}%` : "Sin datos disponibles"}</p>
            </div>
          </div>
        </section>

        {/* Project Specific Reports Table */}
        <section className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
          <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-200 flex justify-between items-center">
            <h5 className="font-bold text-[11px] text-gray-400 tracking-wider uppercase">REPORTES POR PROYECTO</h5>
            <span className="font-mono text-[10px] text-gray-400 uppercase font-bold">FILTRADO AUTOMÁTICO</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                <tr>
                  <th className="px-6 py-4">Código</th>
                  <th className="px-6 py-4">Nombre del Proyecto</th>
                  <th className="px-6 py-4">Responsable</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Progreso</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-semibold">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400 italic font-medium">
                      Cargando listado de proyectos desde el servidor...
                    </td>
                  </tr>
                ) : projects.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400 italic font-medium">
                      No hay proyectos creados para generar reportes.
                    </td>
                  </tr>
                ) : (
                  projects.map((item) => {
                    return (
                      <tr key={item.id} className="hover:bg-gray-50/40 transition-colors">
                        <td className="px-6 py-4 font-mono text-gray-400 text-[11px]">
                          {item.code || "S/C"}
                        </td>
                        <td className="px-6 py-4 text-[#181c1e] font-bold text-sm">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-xs">
                          {item.responsible || "Sin asignar"}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            item.status === "Completado" ? "bg-green-100 text-green-700" :
                            item.status === "Retrasado" || item.status === "Atrasado" ? "bg-red-100 text-red-700" :
                            "bg-blue-100 text-blue-700"
                          }`}>
                            {item.status || "En Curso"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-150 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  item.progress < 30 ? "bg-red-500" :
                                  item.progress < 75 ? "bg-amber-500" : "bg-[#ffb800]"
                                }`}
                                style={{ width: `${item.progress}%` }}
                              ></div>
                            </div>
                            <span className="font-mono text-gray-400 font-bold text-[10px]">{item.progress}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <div className="flex items-center justify-end">
                            <button
                              onClick={() => {
                                onSelectProject(item);
                                onNavigate(AppScreen.PREVIEW_PROJECT_REPORT);
                              }}
                              className="bg-gray-100 text-[#181c1e] hover:bg-[#ffb800] hover:text-[#6d4c00] font-black text-[10px] uppercase px-4.5 py-2 rounded-lg transition-all shadow-2xs select-none cursor-pointer"
                            >
                              Ver
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
        </section>

      </main>
    </div>
  );
}
