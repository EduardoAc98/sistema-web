import React, { useState } from "react";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSupport: () => void;
}

export default function HelpModal({ isOpen, onClose, onOpenSupport }: HelpModalProps) {
  const [activeTab, setActiveTab] = useState<"manual" | "faq" | "resources">("manual");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const faqs = [
    {
      q: "¿Cómo se calcula el progreso global del proyecto?",
      a: "El progreso global se deriva algorítmicamente en tiempo real dividiendo el total de tareas operativas con el estado 'Completado' entre la suma total de tareas registradas para dicho proyecto, multiplicándolo por 100."
    },
    {
      q: "¿Cómo se almacena un archivo BIM y por qué dice Google Drive?",
      a: "Los modelos federados de construcción en formato IFC, RVT, NWD o DWG se procesan de forma segura a través de nuestra API local, que simula el almacenamiento redundante persistente en Google Drive Enterprise y registra la metadata en el servidor de base de datos."
    },
    {
      q: "¿Quién puede invitar integrantes o cambiar roles de usuario?",
      a: "Únicamente el usuario con rol de 'Administrador' (nivel auditoría) posee permisos de control de acceso para registrar nuevos colaboradores, actualizar disciplinas, modificar roles o eliminar registros de personal."
    },
    {
      q: "¿Cuáles son las diferencias entre los distintos niveles de LOD?",
      a: "LOD 100 y 200 corresponden a volumetrías conceptuales y pre-diseño. LOD 300 e IFC representan diseño geométrico específico. LOD 350-400 integra interferencias multidisciplinarias y especificaciones precisas de fabricación."
    }
  ];

  return (
    <div className="fixed inset-0 bg-[#181c1e]/70 backdrop-blur-xs flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-2xl overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-[#181c1e] text-white px-6 py-5 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#ffb800] text-2xl font-bold">help_center</span>
            <div>
              <h3 className="font-bold text-base leading-none">Centro de Ayuda y Documentación</h3>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Manuales de usuario y recursos técnicos GMP BIM</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-[#ffb800] p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-gray-200 bg-gray-50 shrink-0">
          <button
            onClick={() => setActiveTab("manual")}
            className={`flex-1 py-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === "manual" ? "border-[#ffb800] text-[#181c1e]" : "border-transparent text-gray-400 hover:text-gray-700"
            }`}
          >
            Manual de Usuario
          </button>
          <button
            onClick={() => setActiveTab("faq")}
            className={`flex-1 py-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === "faq" ? "border-[#ffb800] text-[#181c1e]" : "border-transparent text-gray-400 hover:text-gray-700"
            }`}
          >
            Preguntas Frecuentes
          </button>
          <button
            onClick={() => setActiveTab("resources")}
            className={`flex-1 py-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === "resources" ? "border-[#ffb800] text-[#181c1e]" : "border-transparent text-gray-400 hover:text-gray-700"
            }`}
          >
            Contacto & Recursos
          </button>
        </div>

        {/* Modal Scrollable viewport content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {activeTab === "manual" && (
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-sm text-gray-800 mb-2">1. Primeros Pasos & Navegación</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  La plataforma GMP BIM centraliza la administración de activos de ingeniería y el control del estado BIM de múltiples obras cooperativas. En el panel de navegación izquierdo encontrará accesos rápidos a módulos de proyectos, gestión de usuarios, generación de reportes específicos bajo norma ISO 19650 y configuraciones.
                </p>
              </div>

              <div className="border-t border-gray-150 pt-4">
                <h4 className="font-bold text-sm text-gray-800 mb-2">2. Gestión de Tareas Operativas</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Para que un proyecto incremente su porcentaje de avance, registre sus entregas o tareas asociadas. Los líderes o gestores del proyecto pueden presionar el botón 'Nueva Tarea', asignar responsables específicos de su disciplina, y definir cronogramas límites. En las tareas, los revisores pueden comentar o adjuntar feedback detallado en tiempo real.
                </p>
              </div>

              <div className="border-t border-gray-150 pt-4">
                <h4 className="font-bold text-sm text-gray-800 mb-2">3. Matrices de Coordinación de Modelos (BIM)</h4>
                <p className="text-xs text-gray-500 leading-relaxed text-slate-600">
                  El sistema soporta subida de archivos de diseño multidisciplinarios. Utilice el botón flotante (+) para cargar modelos en el servidor del proyecto. Al subir el modelo, el sistema asocia el nivel LOD necesario (LOD 300, 350 o 400), de modo que los coordinadores de proyectos puedan certificar y aprobar o rechazar cada hito antes de la entrega formal.
                </p>
              </div>
            </div>
          )}

          {activeTab === "faq" && (
            <div className="space-y-4">
              {faqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div key={index} className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200">
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer text-left font-bold text-xs text-gray-700"
                    >
                      <span>{faq.q}</span>
                      <span className="material-symbols-outlined text-gray-400 select-none">
                        {isOpen ? "expand_less" : "expand_more"}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="p-4 bg-white border-t border-gray-250">
                        <p className="text-xs text-slate-500 leading-relaxed font-normal">{faq.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "resources" && (
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                <p className="text-xs font-bold text-amber-800 mb-1 leading-snug flex items-center gap-1.5">
                  <span className="material-symbols-outlined font-bold text-sm">info</span>
                  <span>Línea Telefónica de Soporte Directo</span>
                </p>
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  Si cuenta con alguna duda que no pueda resolverse en esta documentación o manual de usuario de la plataforma, por favor use el canal rápido telefónico de soporte para atención inmediata por auditores coordinadores de sistemas.
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={onOpenSupport}
                    className="bg-[#181c1e] text-white hover:bg-gray-800 px-3.5 py-1.5 rounded-md font-bold text-[10px] tracking-wider uppercase transition-all cursor-pointer"
                  >
                    Abrir Soporte Directo
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-medium">
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 flex flex-col justify-between">
                  <div>
                    <h5 className="font-bold text-gray-800 uppercase text-[10px] tracking-widest mb-1">Políticas del Sistema</h5>
                    <p className="text-[11px] text-gray-400">Terminos de licencias de almacenamiento federado con Autodesk Construction ACC.</p>
                  </div>
                  <a href="#" className="text-xs text-[#7c5800] hover:underline font-bold mt-2.5 flex items-center gap-1">
                    <span>Descargar PDF</span>
                    <span className="material-symbols-outlined text-xs">open_in_new</span>
                  </a>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 flex flex-col justify-between">
                  <div>
                    <h5 className="font-bold text-gray-800 uppercase text-[10px] tracking-widest mb-1">Última Sincronización</h5>
                    <p className="text-[11px] text-gray-400">Estado de copias y respaldos persistentes hacia base de datos JSON securizada.</p>
                  </div>
                  <p className="text-[11px] font-mono text-emerald-600 font-bold mt-2.5 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>ONLINE Y RESPALDADO</span>
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#181c1e] text-white font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
}
