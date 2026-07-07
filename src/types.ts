export enum AppScreen {
  LOGIN = "LOGIN",
  DASHBOARD = "DASHBOARD",
  PROJECTS_LIST = "PROJECTS_LIST",
  PROJECT_DETAIL = "PROJECT_DETAIL",
  USERS_AND_ROLES = "USERS_AND_ROLES",
  REPORTS_CENTER = "REPORTS_CENTER",
  PREVIEW_GENERAL_REPORT = "PREVIEW_GENERAL_REPORT",
  PREVIEW_PROJECT_REPORT = "PREVIEW_PROJECT_REPORT",
  REGISTER_PROJECT = "REGISTER_PROJECT",
  CONFIGURE_PHASES = "CONFIGURE_PHASES"
}

export interface Task {
  id: string;
  projectId?: string;
  name: string;
  category: string;
  assignedTo: string;
  assignedUserId?: string;
  assignedAvatar?: string;
  status: "Completed" | "Review" | "Overdue" | "Pending" | "Execution";
  dueDate: string;
  phaseId: number;
  priority?: string;
}

export interface ProjectPhase {
  id: number;
  name: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  dueDate: string;
  tasks: Task[];
}

export interface Project {
  id: string;
  code: string;
  name: string;
  description: string;
  phaseName: string;
  responsible: string;
  responsibleUserId?: string;
  responsibleAvatar: string;
  status: "En Curso" | "Pendiente Approval" | "Completado" | "Retrasado" | "Ejecución" | "Revisión" | "Atrasado" | "En Pausa";
  progress: number;
  dueDate: string;
  tasks?: Task[];
  phases?: ProjectPhase[];
  team?: { userId: string; name: string; role: string; email?: string }[];
  startDate?: string;
}

export interface User {
  id: string;
  name: string;
  discipline: string;
  email: string;
  role: "Administrador" | "Gestor" | "Colaborador";
  status: "Activo" | "Inactivo";
  lastConnection: string;
  avatarInitials: string;
  avatarBg: string;
  hasRelations?: boolean;
  projectAssociations?: {
    projectId: string;
    projectName: string;
    type: "Responsable" | "Tarea" | "Entregable" | "Archivo";
    count: number;
  }[];
  relationsCount?: {
    projects: number;
    tasks: number;
    deliverables: number;
    comments: number;
    audit: number;
  };
}

export interface Log {
  id: string;
  time: string;
  user: string;
  action: string;
  detail: string;
  ip: string;
  type: "info" | "success" | "error";
}

// Initial Mock Datasets
export const INITIAL_PROJECTS: Project[] = [
  {
    id: "las-palmas",
    code: "PRJ-2024-001",
    name: "Residencial Las Palmas",
    description: "Complejo habitacional multifamiliar de 12 niveles con certificación sostenible.",
    phaseName: "MODELADO BIM",
    responsible: "Ing. Roberto M.",
    responsibleAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuA42xkQ1p_SfauuMQMZ-5sApYo-GHB0fZk2cxivGVw-WqTCu_R5h3YHhacPfGm8703X6U6WRVnf0TXKW11n4psNiemQ0m2r99RjZ_R9X69b4GnZoqM5e09r6deOkY6dWZwOps6CgskbLhSNZDRKlMx3p1g-l6rq27SEPb016Gnqx2zvCNAjBfJ710etUPdt_VEu5BDYj26CrHSqPgEOv0gDhN8ZjjjF23QEunM3dYa541PbAFEZoGxNX3MO2sOhSL_2jxNFsnz1XTe8",
    status: "En Curso",
    progress: 65,
    dueDate: "24/11/2024"
  },
  {
    id: "el-faro",
    code: "PRJ-2024-023",
    name: "Centro Comercial El Faro",
    description: "Ampliación del ala norte del mall comercial, integrando sistemas MEP inteligentes.",
    phaseName: "REVISIÓN",
    responsible: "Arq. Elena P.",
    responsibleAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuC6I5XiGm6PBR_nsL4AWD9iZ7UtRs7cXYZKxB3nHU59Zz2DtQoqkffviU1nvWLcr-QyFKMNKPagvJBmX7ehGAUqF00gAf0Uw-J8lNA--ZBFKwHABh9WeJHQOCdKrqPivTTKstCXZip6k4RqXFT4YLmrOIhLSHKDrWNt-1JRRdp-t2AftT0kOvepxCMmoIPBNR2PhDo5DJxvw3j-t0O3hRMWp6Bau8jPUxsmdCA9SDUmwY_3nZ54ya7cDRdmKJVWdnJF42Lj0Ay4rGtB",
    status: "Pendiente Approval",
    progress: 88,
    dueDate: "15/12/2024"
  },
  {
    id: "sigma",
    code: "PRJ-2023-118",
    name: "Torre Empresarial Sigma",
    description: "Estructura rascacielos corporativo con disipadores sísmicos adaptativos.",
    phaseName: "CIERRE",
    responsible: "Ing. Carlos T.",
    responsibleAvatar: "https://lh3.googleusercontent.com/v1/placeholder-user-1.jpg",
    status: "Completado",
    progress: 100,
    dueDate: "30/10/2023"
  },
  {
    id: "interconector-norte",
    code: "PRJ-2024-045",
    name: "Puente Interconector Norte",
    description: "Infraestructura vial de conexión metropolitana modelada íntegramente con gemelo digital.",
    phaseName: "LEVANTAMIENTO",
    responsible: "Alex Rivera",
    responsibleAvatar: "https://lh3.googleusercontent.com/v1/placeholder-user-2.jpg",
    status: "Retrasado",
    progress: 12,
    dueDate: "10/10/2024"
  },
  {
    id: "los-sauces",
    code: "PRJ-2410-09",
    name: "Residencial Los Sauces - Fase II",
    description: "Prototipo habitacional modular prefabricado de alta eficiencia térmica y acústica.",
    phaseName: "EJECUCIÓN",
    responsible: "Ing. Marta Sánchez",
    responsibleAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuC2xquz1NdZOS3p7rcgzjuV-MHeSXZJ4bQ--ZQqLMRu2Aoztaortg4QpB49ApSBlrx_Cjz-JN1Zx6KfaI_EWy_m28myxdi_wz82QFnYgCK-97XfqvInmGmYalHMkaDGY4P23Gx7VToat0gmxnq9TbmvyvDDhMvM3z_IXOaxNwA7zXKNTpbNAcFWqixayLt-eTtyO6lLLwPMc0oJV4vGWcWi1P12sxtEosW70fol7mO7CAoJWUTWkGXJpUQncK0Egm-p1rnOR2Msui4X",
    status: "Ejecución",
    progress: 65,
    dueDate: "24/11/2024"
  },
  {
    id: "callao-modulo-a",
    code: "PRJ-2024-78",
    name: "Centro Logístico Callao - Módulo A",
    description: "Instalación industrial para almacenamiento y distribución de carga internacional con portales robotizados.",
    phaseName: "REVISIÓN",
    responsible: "Arq. Roberto Gómez",
    responsibleAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDKlb9_70e9FgiiQBM9_wQSJoKLmAxyaY2KRFAPYBbh6D3g5CMyU7oFNlFVI1OtVmQsg78oeAV5Uglet4sDMgVtMWmqKSaGyUpGomzDUV6N8cwXoq8iCxlySPkQHKR9QlvLu-nJV3354b41sWelRt04BizjuHtNhBUi7iE0gPuLV17Ebf2MGD8jQsE-9DK50qLK7TCsaF_IzRunTrZQu16euYiUg-6dQOnycfZ-_sfiQF-cHacj17A_He4XzSF7l9zZO6ExdI1QZn0A",
    status: "Revisión",
    progress: 92,
    dueDate: "15/12/2024"
  },
  {
    id: "el-golf",
    code: "PRJ-2024-99",
    name: "Edificio Corporativo \"El Golf\"",
    description: "Oficinas gerenciales de alta gama con fachada de vidrio estructural doble ventilada.",
    phaseName: "PLANIFICACIÓN",
    responsible: "Ing. Lucía Méndez",
    responsibleAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDslQSDdf1t1Znj8B2daIMZ3r3oYGOF95uUBJfWjfo77KIS6icLd4Nyvvoud_Ix2eIF2vbd0AjX176SvH85f4c46YypBCBH5-IlZg6r07b1rQclXtwgCPvNYaMFvbmf6c3SckTOWWV1tPYka8nDlERFYYPzOw88bMny8fzoQWkKceVDzFgy64cZB9QC53N5FChww4Z5mBgGDu_CzQktw5YQQQIDToAId9oRKYlpguwvhjW_e8i5hg7y5omFFSh_Dp8og-NJqRDvPuiQ",
    status: "Atrasado",
    progress: 35,
    dueDate: "02/11/2024"
  },
  {
    id: "corporativo-central",
    code: "PRJ-2410-08",
    name: "Edificio Corporativo Central",
    description: "Sede central corporativa con modelado BIM avanzado y coordinación de ingenierías complejas.",
    phaseName: "MODELADO BIM",
    responsible: "Ing. Carlos Mendoza",
    responsibleAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDTceCXAtSFa46_KRpSleU_45xWgHkOqwwbbBSjqUMIaNcfJ2HH_2ad1ty_EUGvzpWvM3W1pNJlvGqKd4QQwiMCRdlCYLPWxS3c3YSEpgjWRbIlttn0LHqO05Cr0Sr0c-eBdB6TL4HPY4ddqk3vlxp9UWNXoobV_NBVi46VVz26CtOhU5FuSNeZV6p5TWsCYJ0AVWyOSYdTc1RHXr7ao6EHonvDZe-Xu-W5MAB9roitdBw-5io9buuh_5H5JgrSyVa2dXyJih4xCOlZ",
    status: "Ejecución",
    progress: 85,
    dueDate: "15/12/2024"
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: "usr-1",
    name: "Alejandro Arango",
    discipline: "Ingeniería Civil",
    email: "a.arango@gmpbim.com",
    role: "Administrador",
    status: "Activo",
    lastConnection: "Hace 12 min",
    avatarInitials: "AA",
    avatarBg: "bg-amber-500"
  },
  {
    id: "usr-2",
    name: "Lucía Mendoza",
    discipline: "Gestión de Proyectos",
    email: "l.mendoza@gmpbim.com",
    role: "Gestor",
    status: "Activo",
    lastConnection: "Hace 3 horas",
    avatarInitials: "LM",
    avatarBg: "bg-blue-600"
  },
  {
    id: "usr-3",
    name: "Carlos Vargas",
    discipline: "Modelado BIM",
    email: "c.vargas@gmpbim.com",
    role: "Colaborador",
    status: "Inactivo",
    lastConnection: "Ayer",
    avatarInitials: "CV",
    avatarBg: "bg-slate-400"
  },
  {
    id: "usr-4",
    name: "Elena Rojas",
    discipline: "Arquitectura",
    email: "e.rojas@gmpbim.com",
    role: "Colaborador",
    status: "Activo",
    lastConnection: "Hace 45 min",
    avatarInitials: "ER",
    avatarBg: "bg-emerald-500"
  }
];

export const INITIAL_LOG_AUDIT: Log[] = [
  {
    id: "log-1",
    time: "14:22",
    user: "Alejandro Arango",
    action: "cambió el rol de Lucía Mendoza a Gestor",
    detail: "Origen: IP 192.168.1.45 (Lima, PE)",
    ip: "192.168.1.45",
    type: "info"
  },
  {
    id: "log-2",
    time: "13:05",
    user: "Sistema",
    action: "Nuevo usuario Elena Rojas registrado en el sistema",
    detail: "Método: Invitación vía Email por Admin.",
    ip: "192.168.1.4",
    type: "success"
  },
  {
    id: "log-3",
    time: "11:50",
    user: "Desconocido",
    action: "Intento de acceso fallido: user_unknown_01",
    detail: "Origen: IP 45.230.12.1 (Moscú, RU) - Bloqueado automáticamente.",
    ip: "45.230.12.1",
    type: "error"
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: "TSK-042",
    name: "Modelado de Estructuras Nivel 4",
    category: "Componente Estructural",
    assignedTo: "Roberto M.",
    status: "Review",
    dueDate: "24 Oct 2024",
    phaseId: 1
  },
  {
    id: "TSK-045",
    name: "Cálculo de Cargas MEP",
    category: "Ingeniería",
    assignedTo: "Elena P.",
    status: "Overdue",
    dueDate: "12 Oct 2024",
    phaseId: 1
  },
  {
    id: "TSK-048",
    name: "Interferencias Arquitectónicas",
    category: "Coordinación",
    assignedTo: "User Manager",
    status: "Completed",
    dueDate: "28 Oct 2024",
    phaseId: 1
  }
];

export const ACTIVE_REPORT_PROJECTS = [
  {
    id: "PROJ-8821",
    name: "Torre Corporativa Norte",
    phase: "Coordinación MEP",
    status: "Atrasado",
    progress: 32,
    color: "error"
  },
  {
    id: "PROJ-9012",
    name: "Puente Atirantado San José",
    phase: "Modelado BIM LOD 350",
    status: "A Tiempo",
    progress: 85,
    color: "primary"
  },
  {
    id: "PROJ-7742",
    name: "Centro Logístico Aeropuerto",
    phase: "Revisión de Interferencias",
    status: "Crítico",
    progress: 54,
    color: "warning"
  },
  {
    id: "PROJ-1234",
    name: "Residencial Vista Mar",
    phase: "Documentación Ejecutiva",
    status: "En Pausa",
    progress: 12,
    color: "neutral"
  }
];
