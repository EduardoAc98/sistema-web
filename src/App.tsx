import React, { useState, useEffect } from "react";
import { AppScreen, Project, INITIAL_PROJECTS } from "./types";
import { api, getSavedUser } from "./api";
import LoginScreen from "./screens/LoginScreen";
import DashboardScreen from "./screens/DashboardScreen";
import ProjectsListScreen from "./screens/ProjectsListScreen";
import ProjectDetailScreen from "./screens/ProjectDetailScreen";
import UsersScreen from "./screens/UsersScreen";
import ReportsScreen from "./screens/ReportsScreen";
import GeneralReportPreview from "./screens/GeneralReportPreview";
import ProjectReportPreview from "./screens/ProjectReportPreview";
import NewProjectScreen from "./screens/NewProjectScreen";

import { ToastContainer } from "./components/Toast";

export default function App() {
  // Screen and data state with optional persistence to LocalStorage
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(() => {
    const saved = localStorage.getItem("gmp_bim_current_screen");
    return (saved as AppScreen) || AppScreen.LOGIN;
  });

  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);

  const [selectedProject, setSelectedProject] = useState<Project>(() => {
    const saved = localStorage.getItem("gmp_bim_selected_project");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    // Fallback default: PRJ-2410-08 Edificio Corporativo Central
    const central = INITIAL_PROJECTS.find(p => p.id === "corporativo-central");
    return central || INITIAL_PROJECTS[0];
  });

  const selectedProjectRef = React.useRef<Project>(selectedProject);
  useEffect(() => {
    selectedProjectRef.current = selectedProject;
  }, [selectedProject]);

  // Sync state to local storage to prevent loss during preview loads
  useEffect(() => {
    localStorage.setItem("gmp_bim_current_screen", currentScreen);
  }, [currentScreen]);

  useEffect(() => {
    localStorage.setItem("gmp_bim_selected_project", JSON.stringify(selectedProject));
  }, [selectedProject]);

  // Load projects from API on startup & on login/logout or screen change
  useEffect(() => {
    const user = getSavedUser();
    if (user && currentScreen !== AppScreen.LOGIN) {
      refreshProjects();
    }
  }, [currentScreen]);

  const refreshProjects = async () => {
    try {
      const data = await api.getProjects();
      if (data && data.length > 0) {
        setProjects(data);
        // Sync selectedProject using ref to prevent stale closures
        const currentId = selectedProjectRef.current?.id;
        const found = data.find(p => p.id === currentId);
        if (found) {
          setSelectedProject(found);
        } else {
          // If no current project is set, default to first item
          if (!currentId) {
            setSelectedProject(data[0]);
          }
        }
      }
    } catch (err) {
      console.error("Error loading projects from DB:", err);
    }
  };

  // Handler to register a new project from NewProjectScreen (integrating with DB)
  const handleRegisterProject = async (projectData: Omit<Project, "id" | "progress">): Promise<Project> => {
    try {
      const created = await api.createProject(projectData);
      
      // Update local state immediately so list is current
      setProjects(prev => {
        if (prev.some(p => p.id === created.id)) return prev;
        return [created, ...prev];
      });
      setSelectedProject(created);
      
      // Trigger a silent background fetch to keep everything matched
      api.getProjects().then(data => {
        if (data && data.length > 0) {
          setProjects(data);
          const found = data.find(p => p.id === created.id);
          if (found) {
            setSelectedProject(found);
          }
        }
      }).catch(err => console.error("Error background projects refresh:", err));

      return created;
    } catch (err) {
      console.error("Error registering project in DB:", err);
      // Fallback local memory save to avoid breaking UI flow
      const newId = projectData.name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "") || `prj-${Date.now()}`;
      const fallbackProject: Project = {
        ...projectData,
        id: newId,
        progress: 0
      };
      setProjects(prev => [fallbackProject, ...prev]);
      setSelectedProject(fallbackProject);
      return fallbackProject;
    }
  };

  // Safe logout handler
  const handleLogout = () => {
    setCurrentScreen(AppScreen.LOGIN);
    localStorage.removeItem("gmp_bim_current_screen");
  };

  // Navigates directly with a small transition indicator
  const handleNavigation = (screen: AppScreen) => {
    setCurrentScreen(screen);
  };

  // Screen Dispatcher template
  const renderActiveScreen = () => {
    switch (currentScreen) {
      case AppScreen.LOGIN:
        return (
          <LoginScreen 
            onLoginSuccess={() => setCurrentScreen(AppScreen.DASHBOARD)} 
          />
        );
      
      case AppScreen.DASHBOARD:
        return (
          <DashboardScreen
            projects={projects}
            onNavigate={handleNavigation}
            onSelectProject={setSelectedProject}
          />
        );

      case AppScreen.PROJECTS_LIST:
        return (
          <ProjectsListScreen
            projects={projects}
            onNavigate={handleNavigation}
            onSelectProject={setSelectedProject}
            onRefresh={refreshProjects}
          />
        );

      case AppScreen.PROJECT_DETAIL:
        return (
          <ProjectDetailScreen
            project={selectedProject}
            onNavigate={handleNavigation}
            onRefresh={refreshProjects}
            onSelectProject={setSelectedProject}
          />
        );

      case AppScreen.USERS_AND_ROLES:
        return (
          <UsersScreen
            onNavigate={handleNavigation}
          />
        );

      case AppScreen.REPORTS_CENTER:
        return (
          <ReportsScreen
            onNavigate={handleNavigation}
            onSelectProject={setSelectedProject}
          />
        );

      case AppScreen.PREVIEW_GENERAL_REPORT:
        return (
          <GeneralReportPreview
            onNavigate={handleNavigation}
          />
        );

      case AppScreen.PREVIEW_PROJECT_REPORT:
        return (
          <ProjectReportPreview
            project={selectedProject}
            onNavigate={handleNavigation}
          />
        );

      case AppScreen.REGISTER_PROJECT:
        return (
          <NewProjectScreen
            onNavigate={handleNavigation}
            onRegisterSubmit={handleRegisterProject}
          />
        );

      default:
        return (
          <LoginScreen 
            onLoginSuccess={() => setCurrentScreen(AppScreen.DASHBOARD)} 
          />
        );
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50 flex flex-col transition-all duration-300">
      {/* Screen Render Stage */}
      {renderActiveScreen()}
      <ToastContainer />
    </div>
  );
}
