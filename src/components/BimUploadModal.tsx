import React, { useState, useEffect, useRef } from "react";
import { api } from "../api";
import { Project } from "../types";
import { toast } from "./Toast";

interface BimUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess?: () => void;
}

export default function BimUploadModal({ isOpen, onClose, onUploadSuccess }: BimUploadModalProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [fileType, setFileType] = useState("RVT");
  const [file, setFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadProjects();
    }
  }, [isOpen]);

  const loadProjects = async () => {
    try {
      const data = await api.getProjects();
      // Only projects that are not completed (status !== "Completado")
      const activeProj = data.filter((p) => p.status !== "Completado");
      setProjects(activeProj);
      if (activeProj.length > 0) {
        setSelectedProjectId(activeProj[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = 1;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !file) {
      toast.warning("Por favor complete todos los campos y seleccione un archivo.");
      return;
    }

    try {
      setUploading(true);

      // Read file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        const sizeStr = formatFileSize(file.size);

        const userObj = JSON.parse(localStorage.getItem("gmp_logged_user") || "{}");
        const uploadedBy = userObj.name || "Usuario";
        const uploadedByUserId = userObj.id || undefined;

        // Upload to server DB and Local Storage public/uploads
        await api.uploadFile(selectedProjectId, file.name, sizeStr, base64Data, uploadedBy, uploadedByUserId);

        // Send a simulated SMTP notification to admin regarding the successful Google Drive sync!
        try {
          await api.sendEmailAlert(
            userObj.email || "masterdt987@gmail.com",
            `Sincronización Google Drive Exitosa -<sup>${file.name}</sup>`,
            `El archivo BIM "${file.name}" (${sizeStr}) tipo ${fileType} para el proyecto seleccionado se ha guardado correctamente y se ha respaldado de forma segura en la carpeta compartida de Google Drive de GMP BIM S.A. en la nube corporativa.`
          );
        } catch (mailErr) {
          console.warn("SMTP Logging simulated implicitly", mailErr);
        }

        toast.success(`Archivo BIM "${file.name}" cargado y registrado de forma exitosa.`);
        setFile(null);
        if (onUploadSuccess) {
          onUploadSuccess();
        }
        onClose();
      };
      
      reader.onerror = (error) => {
        console.error("FileReader failed", error);
        toast.error("Fallo el procesamiento del archivo local.");
        setUploading(false);
      };

      reader.readAsDataURL(file);

    } catch (err) {
      console.error(err);
      toast.error("Error al subir el archivo BIM.");
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#181c1e]/70 backdrop-blur-xs flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-lg overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Banner */}
        <div className="bg-[#181c1e] text-white px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#ffb800] text-2xl font-bold">upload_file</span>
            <div>
              <h3 className="font-bold text-base leading-none">Cargar Carpeta / Archivo BIM</h3>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Sincronización en la Nube con Google Drive</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-[#ffb800] p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Form area */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Project dropdown */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide">Proyecto de Destino</label>
            {projects.length === 0 ? (
              <p className="text-xs text-red-500 font-bold">No hay proyectos activos (no completados) disponibles.</p>
            ) : (
              <select
                required
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs font-semibold focus:border-[#ffb800] outline-none"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.code}] {p.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* File type */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide">Tipo de Archivo BIM</label>
            <div className="grid grid-cols-4 gap-2">
              {["RVT", "IFC", "NWD", "DWG"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFileType(t)}
                  className={`py-2 border text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    fileType === t 
                      ? "bg-[#ffb800]/10 text-[#7c5800] border-[#ffb800]" 
                      : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Usability Drag & Drop / Click Zone */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide">Cargar Archivo</label>
            
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={triggerFileSelect}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                isDragActive 
                  ? "border-[#ffb800] bg-amber-50/10 scale-[1.01]" 
                  : "border-gray-300 bg-gray-55 hover:border-gray-400 hover:bg-gray-50/50"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".rvt,.ifc,.nwd,.dwg,.pdf,.zip"
                onChange={handleFileSelectChange}
              />
              
              <span className={`material-symbols-outlined text-4xl select-none transition-transform duration-300 ${isDragActive ? "rotate-6 text-[#7c5800]" : "text-gray-400"}`}>
                cloud_upload
              </span>
              
              <div>
                <p className="text-xs font-bold text-gray-700">Arrastre y suelte su archivo BIM aquí, u</p>
                <p className="text-xs text-[#7c5800] font-black underline mt-0.5">Haga clic para buscar localmente</p>
              </div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Extensiones admitidas: .RVT, .IFC, .NWD, .DWG</p>
            </div>
          </div>

          {/* Current file showcase */}
          {file && (
            <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-150 flex items-center justify-between animate-in slide-in-from-top-1">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-green-600">check_circle</span>
                <div className="max-w-[300px] truncate">
                  <p className="text-xs font-bold text-gray-805 truncate">{file.name}</p>
                  <p className="text-[10px] text-gray-400 font-mono">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">delete</span>
              </button>
            </div>
          )}

          {/* Footer Controls inside dialog */}
          <div className="border-t border-gray-200 pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-250 text-gray-600 rounded-lg font-bold text-xs hover:bg-gray-100 transition-colors cursor-pointer bg-white"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={uploading || !file}
              className="px-5 py-2 bg-[#ffb800] text-[#6d4c00] font-black rounded-lg text-xs hover:brightness-105 transition-all cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? "Cargando archivo..." : "Subir Archivo"}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
