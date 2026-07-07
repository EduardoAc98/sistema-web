import React, { useState, useEffect } from "react";
import { AppScreen } from "../types";
import { api } from "../api";
import { toast } from "../components/Toast";

interface GeneralReportPreviewProps {
  onNavigate: (screen: AppScreen) => void;
}

export default function GeneralReportPreview({ onNavigate }: GeneralReportPreviewProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getGeneralReportStats()
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading general stats:", err);
        setLoading(false);
      });
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    toast.info("Use la opción 'Guardar como PDF' en el menú de impresión de su navegador.");
    setTimeout(() => {
      window.print();
    }, 500);
  };

  return (
    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-xs min-h-screen z-[100] flex flex-col font-sans text-[#181c1e]">
      
      {/* Dark elegant top bar */}
      <header className="bg-[#181c1e] border-b border-gray-800 text-white h-16 px-8 flex items-center justify-between shadow-md shrink-0 no-print">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#ffb800] rounded flex items-center justify-center text-[#181c1e]">
            <span className="material-symbols-outlined font-bold text-sm">analytics</span>
          </div>
          <div>
            <h1 
              onClick={() => onNavigate(AppScreen.DASHBOARD)}
              className="text-sm md:text-base font-black text-[#ffb800] tracking-tight cursor-pointer hover:underline"
              title="Volver al Dashboard Principal"
            >
              Reporte General de Gestión de Proyectos BIM
            </h1>
            <p className="text-[9px] text-gray-400 font-mono uppercase tracking-widest leading-none mt-0.5">GMP ECOSISTEMA AUDITORÍA</p>
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
          
          {/* Report Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-gray-150">
            <div>
              <p className="text-[10px] text-[#7c5800] font-black uppercase tracking-widest mb-1">Auditoría General de Gestión</p>
              <h2 className="text-3xl font-black text-[#181c1e] tracking-tight">Reporte General de Gestión de Proyectos BIM</h2>
              <p className="text-gray-400 text-xs mt-1 font-mono">FECHA DE GENERACIÓN: {new Date().toLocaleDateString("es-PE")} | SOLICITANTE: DIRECCIÓN GMP S.A.</p>
            </div>
            
            <div className="bg-[#ffb800]/10 border border-[#ffb800]/30 px-4 py-3 rounded-xl text-center select-none print:bg-gray-100 print:border-gray-300">
              <p className="text-[9px] text-[#7c5800] font-black uppercase tracking-widest mt-0.5">AVANCE PROMEDIO GENERAL</p>
              <p className="text-xl font-bold text-[#7c5800] leading-none mt-1">{loading ? "Cargando..." : stats ? `${stats.averageProgress}%` : "0%"}</p>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-500 font-medium italic">
              Cargando estadísticas reales desde la base de datos...
            </div>
          ) : !stats ? (
            <div className="py-12 text-center text-gray-500 font-medium italic">
              Sin datos disponibles en este momento.
            </div>
          ) : (
            <div className="space-y-8">
              {/* Resumen de proyectos */}
              <div className="border border-gray-150 rounded-xl p-6">
                <h3 className="font-bold text-sm tracking-wider uppercase text-gray-800 flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
                  <span className="material-symbols-outlined text-[#7c5800] text-lg">folder_open</span>
                  <span>Resumen de Proyectos</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-[10px] text-gray-400 uppercase font-black">Proyectos Registrados</p>
                    <p className="text-xl font-bold text-[#181c1e] mt-1">{stats.totalProjects}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-[10px] text-gray-400 uppercase font-black">Proyectos Activos</p>
                    <p className="text-xl font-bold text-amber-600 mt-1">{stats.activeProjects}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-[10px] text-gray-400 uppercase font-black">Proyectos Completados</p>
                    <p className="text-xl font-bold text-green-600 mt-1">{stats.completedProjects}</p>
                  </div>
                </div>
              </div>

              {/* Resumen de tareas */}
              <div className="border border-gray-150 rounded-xl p-6">
                <h3 className="font-bold text-sm tracking-wider uppercase text-gray-800 flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
                  <span className="material-symbols-outlined text-[#7c5800] text-lg">playlist_add_check</span>
                  <span>Resumen de Tareas</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-[10px] text-gray-400 uppercase font-black">Total de Tareas</p>
                    <p className="text-xl font-bold text-[#181c1e] mt-1">{stats.totalTasks}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-[10px] text-gray-400 uppercase font-black">Tareas Pendientes</p>
                    <p className="text-xl font-bold text-gray-600 mt-1">{stats.pendingTasks}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-[10px] text-gray-400 uppercase font-black">Tareas en Progreso</p>
                    <p className="text-xl font-bold text-blue-600 mt-1">{stats.inProgressTasks}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-[10px] text-gray-400 uppercase font-black">Tareas Completadas</p>
                    <p className="text-xl font-bold text-green-600 mt-1">{stats.completedTasks}</p>
                  </div>
                </div>
              </div>

              {/* Resumen de entregables */}
              <div className="border border-gray-150 rounded-xl p-6">
                <h3 className="font-bold text-sm tracking-wider uppercase text-gray-800 flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
                  <span className="material-symbols-outlined text-[#7c5800] text-lg">task</span>
                  <span>Resumen de Entregables</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-[10px] text-gray-400 uppercase font-black">Total Entregables</p>
                    <p className="text-xl font-bold text-[#181c1e] mt-1">{stats.totalDeliverables}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-[10px] text-gray-400 uppercase font-black">Entregables Pendientes</p>
                    <p className="text-xl font-bold text-amber-600 mt-1">{stats.pendingDeliverables}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-[10px] text-gray-400 uppercase font-black">Entregables Aprobados</p>
                    <p className="text-xl font-bold text-green-600 mt-1">{stats.approvedDeliverables}</p>
                  </div>
                </div>
              </div>

              {/* Resumen de archivos */}
              <div className="border border-gray-150 rounded-xl p-6">
                <h3 className="font-bold text-sm tracking-wider uppercase text-gray-800 flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
                  <span className="material-symbols-outlined text-[#7c5800] text-lg">description</span>
                  <span>Resumen de Archivos</span>
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-gray-50 p-5 rounded-lg flex justify-between items-center print:bg-white print:border print:border-gray-200">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-black">Total de Archivos Compartidos en el Servidor</p>
                      <p className="text-2xl font-black text-[#181c1e] mt-1">{stats.totalFiles}</p>
                    </div>
                    <span className="material-symbols-outlined text-4xl text-gray-300 no-print">cloud_done</span>
                  </div>
                </div>
              </div>

              {/* Indicadores de rendimiento del portafolio */}
              <div className="border border-gray-150 rounded-xl p-6">
                <h3 className="font-bold text-sm tracking-wider uppercase text-gray-800 flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
                  <span className="material-symbols-outlined text-[#7c5800] text-lg">trending_up</span>
                  <span>Avance Promedio General</span>
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold text-gray-700 font-mono">
                    <span>PROGRESO DE PORTAFOLIO</span>
                    <span className="text-[#7c5800]">{stats.averageProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden print:border print:border-gray-200">
                    <div 
                      className="bg-[#ffb800] h-full rounded-full transition-all duration-500" 
                      style={{ width: `${stats.averageProgress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 justify-end pt-4 border-t border-gray-150 no-print">
            <button 
              onClick={handlePrint}
              className="px-5 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors text-gray-600 bg-white"
            >
              <span className="material-symbols-outlined text-base">print</span>
              <span>Imprimir Reporte</span>
            </button>
            <button 
              onClick={handleExportPDF}
              className="px-5 py-2.5 bg-[#ffb800] text-[#6d4c00] font-black text-xs rounded-lg hover:brightness-105 flex items-center gap-2 cursor-pointer transition-all border-none"
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
