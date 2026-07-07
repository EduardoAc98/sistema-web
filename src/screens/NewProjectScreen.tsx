import React, { useState, useEffect } from "react";
import { AppScreen, Project } from "../types";
import { getSavedUser } from "../api";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ProjectForm from "../components/ProjectForm";

interface NewProjectScreenProps {
  onNavigate: (screen: AppScreen) => void;
  onRegisterSubmit: (project: Omit<Project, "id" | "progress">) => Promise<Project>;
}

export default function NewProjectScreen({
  onNavigate,
  onRegisterSubmit
}: NewProjectScreenProps) {
  const [loggedUser, setLoggedUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setLoggedUser(getSavedUser());
  }, []);

  const handleFormSubmit = async (projectData: any) => {
    try {
      setIsSubmitting(true);
      setErrorMsg("");
      await onRegisterSubmit(projectData);
      onNavigate(AppScreen.PROJECT_DETAIL);
    } catch (err: any) {
      setErrorMsg(err.message || "Error al registrar el proyecto en la base de datos.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7fafc] text-[#181c1e] font-sans selection:bg-[#ffb800] selection:text-[#6d4c00]">
      {/* Sidebar Navigation */}
      <Sidebar currentScreen={AppScreen.PROJECTS_LIST} onNavigate={onNavigate} />

      {/* Header element */}
      <Header 
        userName={loggedUser?.name || "Arq. Javier Solis"} 
        userRole={loggedUser?.role || "Project Manager"} 
        onNavigate={onNavigate}
      />

      {/* Main Panel Content */}
      <main className="ml-[240px] pt-24 px-8 pb-12 transition-soft">
        
        {/* Breadcrumb path */}
        <div className="flex items-center gap-2 text-gray-400 mb-6 uppercase text-[10px] tracking-widest font-bold">
          <button onClick={() => onNavigate(AppScreen.DASHBOARD)} className="hover:text-[#7c5800] cursor-pointer bg-transparent border-0 font-bold">
            Dashboard
          </button>
          <span className="material-symbols-outlined text-xs select-none">chevron_right</span>
          <button onClick={() => onNavigate(AppScreen.PROJECTS_LIST)} className="hover:text-[#7c5800] cursor-pointer bg-transparent border-0 font-bold">
            Proyectos
          </button>
          <span className="material-symbols-outlined text-xs select-none">chevron_right</span>
          <span className="text-[#7c5800]">Registro de Proyecto</span>
        </div>

        {/* Header content section */}
        <div className="mb-8">
          <span className="text-[10px] bg-[#ffb800]/15 text-[#7c5800] px-3 py-1 rounded font-black uppercase tracking-widest mb-2 block w-fit">
            NUEVO EXPEDIENTE TÉCNICO
          </span>
          <h3 className="text-3xl font-bold tracking-tight text-[#181c1e]">Registro de Nuevo Proyecto BIM</h3>
          <p className="text-gray-550 text-sm mt-1">
            Complete el expediente técnico estratégico estructurado en Secciones de Identidad, Ejecución y Gobernanza.
          </p>
        </div>

        {/* Main interactive form card */}
        <div className="max-w-4xl bg-white border border-gray-200 rounded-2xl shadow-sm p-8 md:p-10 relative">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#ffb800]"></div>
          
          {errorMsg && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 text-xs font-bold text-red-700 mb-6">
              {errorMsg}
            </div>
          )}

          <ProjectForm 
            mode="create"
            onSubmit={handleFormSubmit}
            onCancel={() => onNavigate(AppScreen.PROJECTS_LIST)}
            isSubmitting={isSubmitting}
          />
        </div>

      </main>
    </div>
  );
}
