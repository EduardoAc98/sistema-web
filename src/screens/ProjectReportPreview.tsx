import React, { useState, useEffect } from "react";
import { AppScreen, Project } from "../types";
import { api } from "../api";
import { toast } from "../components/Toast";

interface ProjectReportPreviewProps {
  project: Project | null;
  onNavigate: (screen: AppScreen) => void;
}

export default function ProjectReportPreview({ project, onNavigate }: ProjectReportPreviewProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!project) return;

    api.getProjectReportStats(project.id)
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading project stats:", err);
        setLoading(false);
      });
  }, [project]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    toast.info("Use la opción 'Guardar como PDF' en el menú de impresión de su navegador.");
    setTimeout(() => {
      window.print();
    }, 500);
  };

  if (!project) {
    return (
      <div className="absolute inset-0 bg-[#f1f4f6]/60 backdrop-blur-xs min-h-screen z-[100] flex flex-col items-center justify-center font-sans text-[#181c1e] p-6">
        <div className="max-w-md bg-white border border-gray-200 rounded-2xl shadow-xl p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-amber-500 mb-4 animate-bounce">warning</span>
          <h3 className="text-xl font-bold mb-2">Proyecto no seleccionado</h3>
          <p className="text-gray-500 text-sm mb-6">
            Por favor, seleccione un proyecto en la lista o el Dashboard para previsualizar su informe técnico específico.
          </p>
          <button
            onClick={() => onNavigate(AppScreen.REPORTS_CENTER)}
            className="w-full bg-[#ffb800] text-[#6d4c00] font-black py-3 rounded-lg text-xs hover:brightness-105 transition-all uppercase tracking-wider cursor-pointer border-none"
          >
            Ir a Centro de Reportes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-xs min-h-screen z-[100] flex flex-col font-sans text-[#181c1e]">
      
      {/* Dark elegant top bar */}
      <header className="bg-[#181c1e] border-b border-gray-800 text-white h-16 px-8 flex items-center justify-between shadow-md shrink-0 no-print">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#ffb800] rounded flex items-center justify-center text-[#181c1e]">
            <span className="material-symbols-outlined font-bold text-sm">apartment</span>
          </div>
          <div>
            <h1 
              onClick={() => onNavigate(AppScreen.DASHBOARD)}
              className="text-sm md:text-base font-black text-[#ffb800] tracking-tight cursor-pointer hover:underline"
              title="Volver al Dashboard Principal"
            >
              Reporte de Seguimiento del Proyecto
            </h1>
            <p className="text-[9px] text-gray-400 font-mono uppercase tracking-widest leading-none mt-0.5">GMP INFORME TÉCNICO</p>
          </div>
        </div>

        <button
          onClick={() => onNavigate(AppScreen.REPORTS_CENTER)}
          className="bg-white/10 hover:bg-white/25 text-white border border-white/20 px-4 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-sm">close</span>
          <span>Cerrar Vista Previa</span>
        </button>
      </header>

      {/* Main container with white paper background */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-6 md:p-12 print:p-0 print:bg-white">
        <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden p-8 md:p-12 space-y-8 relative print:shadow-none print:border-none print:p-0 print:max-w-full">
          
          {/* Aesthetic technical frame header */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#ffb800] no-print"></div>
          
          {/* Title details */}
          <div className="pb-6 border-b border-gray-150 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 text-[9px] font-bold border rounded uppercase tracking-widest ${
                  project.status === "Completado" ? "bg-green-50 text-green-800 border-green-200" :
                  project.status === "Retrasado" || project.status === "Atrasado" ? "bg-red-50 text-red-800 border-red-200" :
                  "bg-blue-50 text-blue-800 border-blue-200"
                }`}>
                  ESTADO: {project.status?.toUpperCase() || "EN CURSO"}
                </span>
                <span className="text-gray-400 font-mono text-[10px]">CÓDIGO: {project.code || "S/C"}</span>
              </div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">{project.name}</h2>
              <p className="text-gray-400 text-xs mt-1 font-mono uppercase">Reporte de Seguimiento del Proyecto</p>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-bold text-gray-800 leading-none">{project.responsible || "Sin Asignar"}</p>
                <p className="text-[10px] text-gray-400 uppercase font-black mt-1">Líder de Proyecto</p>
              </div>
              {project.responsibleAvatar && (
                <img 
                  className="w-10 h-10 rounded-full object-cover border border-gray-200 no-print"
                  alt={project.responsible} 
                  src={project.responsibleAvatar}
                  referrerPolicy="no-referrer"
                />
              )}
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-500 font-medium italic">
              Cargando información del proyecto desde el servidor...
            </div>
          ) : !stats ? (
            <div className="py-12 text-center text-gray-500 font-medium italic">
              No se pudo obtener información detallada del proyecto.
            </div>
          ) : (
            <div className="space-y-8">
              
              {/* Información General */}
              <div className="border border-gray-150 rounded-xl p-6">
                <h3 className="font-bold text-sm tracking-wider uppercase text-gray-800 flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
                  <span className="material-symbols-outlined text-[#7c5800] text-lg font-bold">info</span>
                  <span>Información General</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-xs">
                  <div>
                    <p className="text-gray-400 uppercase font-bold text-[9px]">Código del Proyecto</p>
                    <p className="text-sm font-semibold text-[#181c1e] mt-0.5">{project.code || "Sin especificar"}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 uppercase font-bold text-[9px]">Nombre del Proyecto</p>
                    <p className="text-sm font-semibold text-[#181c1e] mt-0.5">{project.name}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-gray-400 uppercase font-bold text-[9px]">Descripción</p>
                    <p className="text-sm font-semibold text-[#181c1e] mt-0.5 leading-relaxed">{project.description || "Sin descripción disponible."}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 uppercase font-bold text-[9px]">Responsable</p>
                    <p className="text-sm font-semibold text-[#181c1e] mt-0.5">{project.responsible || "Sin asignar"}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 uppercase font-bold text-[9px]">Estado de Gestión</p>
                    <p className="text-sm font-semibold text-[#181c1e] mt-0.5">{project.status || "En Curso"}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 uppercase font-bold text-[9px]">Fecha de Inicio</p>
                    <p className="text-sm font-semibold text-[#181c1e] mt-0.5">{project.startDate || "No disponible"}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 uppercase font-bold text-[9px]">Fecha de Finalización</p>
                    <p className="text-sm font-semibold text-[#181c1e] mt-0.5">{project.dueDate || "No disponible"}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-gray-400 uppercase font-bold text-[9px] mb-1">Progreso Fásico</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-100 h-2.5 rounded-full overflow-hidden print:border print:border-gray-200">
                        <div className="bg-[#ffb800] h-full rounded-full" style={{ width: `${project.progress}%` }}></div>
                      </div>
                      <span className="font-mono font-bold text-sm text-[#7c5800]">{project.progress}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fases registradas */}
              <div className="border border-gray-150 rounded-xl p-6">
                <h3 className="font-bold text-sm tracking-wider uppercase text-gray-800 flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
                  <span className="material-symbols-outlined text-[#7c5800] text-lg font-bold">layers</span>
                  <span>Fases Constructivas Registradas</span>
                </h3>
                {(!stats.phases || stats.phases.length === 0) ? (
                  <p className="text-xs text-gray-400 italic">No hay fases constructivas registradas en este proyecto.</p>
                ) : (
                  <div className="space-y-3">
                    {stats.phases.map((ph: any, i: number) => (
                      <div key={ph.id || i} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between text-xs border border-gray-100 print:bg-white print:border-gray-200">
                        <div>
                          <p className="font-bold text-gray-800">{ph.name}</p>
                          <p className="text-gray-400 text-[10px] mt-0.5 font-mono">FECHA LÍMITE: {ph.dueDate || "No especificada"}</p>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                          ph.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                          ph.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-700" :
                          "bg-gray-150 text-gray-600"
                        }`}>
                          {ph.status === "COMPLETED" ? "Completado" : ph.status === "IN_PROGRESS" ? "En Curso" : "Pendiente"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Grid for Tasks and Deliverables by status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Resumen de tareas */}
                <div className="border border-gray-150 rounded-xl p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm tracking-wider uppercase text-gray-800 flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
                      <span className="material-symbols-outlined text-[#7c5800] text-lg font-bold">playlist_add_check</span>
                      <span>Tareas por Estado</span>
                    </h3>
                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                        <span className="text-gray-500">Pendientes (Pending)</span>
                        <span className="font-bold font-mono text-gray-800">{stats.tasksByStatus.Pending}</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                        <span className="text-gray-500">En Ejecución (Execution)</span>
                        <span className="font-bold font-mono text-blue-600">{stats.tasksByStatus.Execution}</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                        <span className="text-gray-500">En Revisión (Review)</span>
                        <span className="font-bold font-mono text-amber-600">{stats.tasksByStatus.Review}</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                        <span className="text-gray-500">Atrasadas (Overdue)</span>
                        <span className="font-bold font-mono text-red-600">{stats.tasksByStatus.Overdue}</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5">
                        <span className="text-gray-500 font-semibold">Completadas (Completed)</span>
                        <span className="font-bold font-mono text-green-600">{stats.tasksByStatus.Completed}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mt-4 text-[11px] font-semibold text-gray-500 text-center print:bg-white print:border-gray-200">
                    Total de tareas del proyecto: {stats.totalTasks}
                  </div>
                </div>

                {/* Resumen de entregables */}
                <div className="border border-gray-150 rounded-xl p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm tracking-wider uppercase text-gray-800 flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
                      <span className="material-symbols-outlined text-[#7c5800] text-lg font-bold">task</span>
                      <span>Entregables por Estado</span>
                    </h3>
                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                        <span className="text-gray-500">Pendientes de Aprobación</span>
                        <span className="font-bold font-mono text-amber-600">{stats.deliverablesByStatus.PENDIENTE}</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                        <span className="text-gray-500 font-semibold text-green-700">Aprobados exitosamente</span>
                        <span className="font-bold font-mono text-green-600">{stats.deliverablesByStatus.APROBADO}</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5">
                        <span className="text-gray-500 text-red-700">Rechazados / En Corrección</span>
                        <span className="font-bold font-mono text-red-600">{stats.deliverablesByStatus.RECHAZADO}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mt-4 text-[11px] font-semibold text-gray-500 text-center print:bg-white print:border-gray-200">
                    Total de entregables técnicos: {stats.totalDeliverables}
                  </div>
                </div>

              </div>

              {/* Archivos Registrados */}
              <div className="border border-gray-150 rounded-xl p-6">
                <h3 className="font-bold text-sm tracking-wider uppercase text-gray-800 flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
                  <span className="material-symbols-outlined text-[#7c5800] text-lg font-bold">cloud_done</span>
                  <span>Archivos Registrados en el Servidor</span>
                </h3>
                {(!stats.files || stats.files.length === 0) ? (
                  <p className="text-xs text-gray-400 italic">No se han cargado archivos ni planos digitales en este proyecto todavía.</p>
                ) : (
                  <div className="overflow-x-auto font-sans">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-gray-100 text-gray-400 uppercase text-[9px] font-bold">
                          <th className="py-2">Nombre del Archivo</th>
                          <th className="py-2">Tamaño</th>
                          <th className="py-2">Subido Por</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 text-gray-700">
                        {stats.files.map((f: any, idx: number) => (
                          <tr key={idx} className="hover:bg-gray-50/50">
                            <td className="py-2 font-mono font-bold text-gray-800 text-[11px] truncate max-w-xs" title={f.name}>{f.name}</td>
                            <td className="py-2 text-gray-500">{f.size || "S/N"}</td>
                            <td className="py-2 text-gray-600">{f.uploadedBy || "Sistema"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* Action row buttons */}
          <div className="flex justify-end gap-2 pt-6 border-t border-gray-150 no-print">
            <button 
              onClick={() => onNavigate(AppScreen.REPORTS_CENTER)}
              className="px-5 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 font-bold text-xs text-gray-600 transition-colors cursor-pointer bg-white"
            >
              Cerrar Vista Previa
            </button>
            <button 
              onClick={handlePrint}
              className="px-5 py-2.5 bg-gray-100 text-[#181c1e] hover:bg-gray-200 font-bold text-xs rounded-lg transition-all flex items-center gap-2 cursor-pointer border border-gray-200"
            >
              <span className="material-symbols-outlined text-base">print</span>
              <span>Imprimir Reporte</span>
            </button>
            <button 
              onClick={handleExportPDF}
              className="px-5 py-2.5 bg-[#ffb800] text-[#6d4c00] font-black text-xs rounded-lg hover:brightness-105 transition-all shadow-sm flex items-center gap-2 cursor-pointer border-none"
            >
              <span className="material-symbols-outlined text-base">picture_as_pdf</span>
              <span>Exportar PDF</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
