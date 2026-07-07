import React, { useState } from "react";
import { toast } from "./Toast";
import { getSavedUser } from "../api";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<"prefs" | "notifs" | "seq">("prefs");
  
  const loggedUser = getSavedUser();

  if (!isOpen) return null;

  const handleSaveAll = () => {
    toast.success("Configuraciones del sistema guardadas y aplicadas de forma exitosa.");
    onClose();
  };

  return (
    <div id="settings_modal_overlay" className="fixed inset-0 bg-[#181c1e]/70 backdrop-blur-xs flex items-center justify-center z-[100] p-4">
      <div id="settings_modal_content" className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-xl overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        
        {/* Header banner */}
        <div className="bg-[#181c1e] text-white px-6 py-5 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#ffb800] text-2xl font-bold">settings</span>
            <div>
              <h3 className="font-bold text-base leading-none">Configuraciones del Sistema</h3>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Ajuste técnico del entorno de trabajo</p>
            </div>
          </div>
          <button 
            id="settings_close_btn"
            onClick={onClose}
            className="text-gray-400 hover:text-[#ffb800] p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Outer body grid */}
        <div className="flex-1 flex overflow-hidden min-h-[300px]">
          
          {/* Tabs Menu Column (Left) */}
          <div className="w-48 bg-gray-50 border-r border-gray-200 py-4 px-2 flex flex-col gap-1 shrink-0">
            <button
              id="tab_prefs_btn"
              onClick={() => setActiveTab("prefs")}
              className={`flex items-center gap-2.5 px-3 py-2.5 font-bold text-xs uppercase tracking-wider rounded-lg transition-all text-left cursor-pointer ${
                activeTab === "prefs" ? "bg-[#ffb800]/10 text-[#7c5800]" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="material-symbols-outlined text-base">manage_accounts</span>
              <span>Preferencias</span>
            </button>
            <button
              id="tab_notifs_btn"
              onClick={() => setActiveTab("notifs")}
              className={`flex items-center gap-2.5 px-3 py-2.5 font-bold text-xs uppercase tracking-wider rounded-lg transition-all text-left cursor-pointer ${
                activeTab === "notifs" ? "bg-[#ffb800]/10 text-[#7c5800]" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="material-symbols-outlined text-base">notifications_active</span>
              <span>Notificaciones</span>
            </button>
            <button
              id="tab_seq_btn"
              onClick={() => setActiveTab("seq")}
              className={`flex items-center gap-2.5 px-3 py-2.5 font-bold text-xs uppercase tracking-wider rounded-lg transition-all text-left cursor-pointer ${
                activeTab === "seq" ? "bg-[#ffb800]/10 text-[#7c5800]" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="material-symbols-outlined text-base">security</span>
              <span>Seguridad</span>
            </button>
          </div>

          {/* Active Settings Panel Context View (Right scrollable viewport) */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">

            {activeTab === "prefs" && (
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-gray-800 uppercase tracking-wide border-b pb-2">Preferencias Generales de Usuario</h4>
                
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide">Idioma del Workspace</label>
                  <div className="text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-2.5">
                    Español (Predeterminado)
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-lg border border-gray-100 opacity-60">
                  <div>
                    <p className="text-xs font-bold text-gray-800">Auto Guardado Continuo</p>
                    <p className="text-[10px] text-gray-400">Disponible en una próxima versión.</p>
                  </div>
                  <input
                    type="checkbox"
                    disabled
                    checked={false}
                    className="w-4 h-4 text-amber-500 accent-[#ffb800] cursor-not-allowed"
                  />
                </div>
              </div>
            )}

            {activeTab === "notifs" && (
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-gray-800 uppercase tracking-wide border-b pb-2">Canales de Notificaciones Activas</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 opacity-60">
                    <div>
                      <p className="text-xs font-bold text-gray-850">Alertas de Vencimiento de Tareas</p>
                      <p className="text-[10px] text-gray-400">Disponible en una próxima versión.</p>
                    </div>
                    <input
                      type="checkbox"
                      disabled
                      checked={false}
                      className="w-4 h-4 accent-[#ffb800] cursor-not-allowed"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 opacity-60">
                    <div>
                      <p className="text-xs font-bold text-gray-850">Alertas de Entregables Próximos a Vencer</p>
                      <p className="text-[10px] text-gray-400">Disponible en una próxima versión.</p>
                    </div>
                    <input
                      type="checkbox"
                      disabled
                      checked={false}
                      className="w-4 h-4 accent-[#ffb800] cursor-not-allowed"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 opacity-60">
                    <div>
                      <p className="text-xs font-bold text-gray-850">Sonido de Notificaciones</p>
                      <p className="text-[10px] text-gray-400">Disponible en una próxima versión.</p>
                    </div>
                    <input
                      type="checkbox"
                      disabled
                      checked={false}
                      className="w-4 h-4 accent-[#ffb800] cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "seq" && (
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-gray-800 uppercase tracking-wide border-b pb-2">Seguridad de la Plataforma</h4>
                
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 space-y-3 text-xs">
                  <div>
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Usuario Actual</span>
                    <p className="font-bold text-gray-800 mt-0.5">{loggedUser?.name || "No identificado"}</p>
                    <p className="text-[10px] text-gray-500">{loggedUser?.email || ""}</p>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-2.5">
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Rol Actual</span>
                    <p className="font-bold text-gray-800 mt-0.5">{loggedUser?.role || "Colaborador"}</p>
                  </div>

                  <div className="border-t border-gray-200 pt-2.5">
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Estado de Sesión</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                      <span className="font-bold text-green-700">Activa (Segura)</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-2.5">
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Último Acceso</span>
                    <p className="font-semibold text-gray-600 mt-0.5">
                      {loggedUser?.lastConnection || "Hoy"}
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Footer actions */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end gap-3 shrink-0">
          <button
            id="settings_cancel_btn"
            onClick={onClose}
            className="px-4 py-2 border border-gray-250 text-gray-600 rounded-lg font-bold text-xs hover:bg-gray-100 transition-colors cursor-pointer bg-white"
          >
            Cancelar
          </button>
          
          <button
            id="settings_save_btn"
            onClick={handleSaveAll}
            className="px-5 py-2 bg-[#ffb800] text-[#6d4c00] font-black rounded-lg text-xs hover:brightness-105 transition-all cursor-pointer border-none"
          >
            Guardar Cambios
          </button>
        </div>

      </div>
    </div>
  );
}
