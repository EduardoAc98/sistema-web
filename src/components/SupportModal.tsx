import React from "react";

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SupportModal({ isOpen, onClose }: SupportModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#181c1e]/70 backdrop-blur-xs flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
        
        {/* Banner header colored with black slate */}
        <div className="bg-[#181c1e] text-white px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#ffb800] text-2xl font-bold">contact_support</span>
            <div>
              <h3 className="font-bold text-base leading-none">Soporte Técnico</h3>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Canal de Coordinación Directo</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-[#ffb800] p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Content details with dynamic grid items */}
        <div className="p-6 space-y-6">
          <div className="text-center">
            <p className="text-xs text-gray-500 leading-relaxed">
              Comuníquese con el equipo de TI o GMP Support para resolver problemas de accesibilidad del sistema o sincronización de licencias.
            </p>
          </div>

          <div className="space-y-4">
            {/* Email Support Card */}
            <div className="flex items-center gap-4 bg-gray-50 p-3.5 rounded-lg border border-gray-100 hover:border-[#ffb800]/50 transition-colors">
              <div className="w-10 h-10 bg-[#ffb800]/10 text-amber-600 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined font-semibold text-lg">mail</span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Correo Electrónico</p>
                <a 
                  href="mailto:soporte@gmpbim.com"
                  className="text-sm font-bold text-gray-900 hover:text-[#7c5800] underline"
                >
                  soporte@gmpbim.com
                </a>
              </div>
            </div>

            {/* Phone Support Card */}
            <div className="flex items-center gap-4 bg-gray-50 p-3.5 rounded-lg border border-gray-100 hover:border-[#ffb800]/50 transition-colors">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined font-semibold text-lg">call</span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Teléfono de Soporte</p>
                <a 
                  href="tel:+51913660258"
                  className="text-sm font-bold text-gray-905 hover:text-[#7c5800]"
                >
                  +51 913 660 258
                </a>
              </div>
            </div>

            {/* Operational hours */}
            <div className="flex items-center gap-4 bg-gray-50 p-3.5 rounded-lg border border-gray-100">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined font-semibold text-lg">schedule</span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Horario de Atención</p>
                <p className="text-xs font-bold text-gray-700">Lunes a Viernes 8:00 AM - 6:00 PM</p>
              </div>
            </div>
          </div>

          {/* Slogan */}
          <div className="text-center pt-2 border-t border-gray-100">
            <span className="bg-gray-100 text-gray-500 text-[9px] font-mono font-bold tracking-widest px-2.5 py-1 rounded">
              SYSTEM LEVEL GMP SUPPORT ACTIVE
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
