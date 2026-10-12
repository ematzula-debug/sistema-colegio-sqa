import { NavLink, Outlet } from "react-router-dom";
import {
  BookOpen,
  ClipboardList,
  GraduationCap,
  LogOut,
  NotebookPen,
  School,
  Users,
  UserRoundCheck,
  LinkIcon,
  LayoutDashboard,
  FileText,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AuthUser } from "@/types/auth";

interface MainLayoutProps {
  user: AuthUser;
  onLogout: () => void;
}

const menuItems = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "PROFESOR_DIRECTOR"],
  },
  {
    title: "Alumnos",
    path: "/alumnos",
    icon: GraduationCap,
    roles: ["ADMIN", "PROFESOR_DIRECTOR"],
  },
  {
    title: "Profesores",
    path: "/profesores",
    icon: UserRoundCheck,
    roles: ["ADMIN"],
  },
  {
    title: "Padres/Encargados",
    path: "/encargados",
    icon: Users,
    roles: ["ADMIN"],
  },
  {
    title: "Grados",
    path: "/grados",
    icon: School,
    roles: ["ADMIN", "PROFESOR_DIRECTOR"],
  },
  {
    title: "Secciones",
    path: "/secciones",
    icon: ClipboardList,
    roles: ["ADMIN", "PROFESOR_DIRECTOR"],
  },
  {
    title: "Asignaturas",
    path: "/asignaturas",
    icon: BookOpen,
    roles: ["ADMIN", "PROFESOR_DIRECTOR"],
  },
  {
    title: "Asignaciones",
    path: "/asignaciones",
    icon: LinkIcon,
    roles: ["ADMIN", "PROFESOR_DIRECTOR"],
  },
  {
    title: "Inscripciones",
    path: "/inscripciones",
    icon: NotebookPen,
    roles: ["ADMIN", "PROFESOR_DIRECTOR"],
  },
  {
    title: "Notas",
    path: "/notas",
    icon: FileText,
    roles: ["ADMIN", "PROFESOR_DIRECTOR", "PADRE_ENCARGADO", "ALUMNO"],
  },
];

export function MainLayout({ user, onLogout }: MainLayoutProps) {
  const visibleMenuItems = menuItems.filter((item) =>
    item.roles.includes(user.rol),
  );

  return (
    <div className="flex min-h-screen bg-slate-50/80">
      {/* Sidebar Escritorio */}
      <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col shadow-sm">
        {/* Cabecera con degradado */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 p-6 text-white shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md">
              <School className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">Sistema Colegio</h1>
              <p className="text-xs text-blue-100 font-medium">Gestión Académica</p>
            </div>
          </div>
        </div>

        {/* Navegación principal */}
        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 font-semibold translate-x-1"
                      : "text-slate-600 hover:bg-blue-50 hover:text-blue-700 hover:translate-x-1"
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.title}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Perfil de Usuario y Logout */}
        <div className="border-t border-slate-200 p-4 bg-slate-50/50">
          <div className="mb-3 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                <User className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate text-slate-900">
                  {user.nombreUsuario}
                </p>
                <p className="text-xs text-slate-500 truncate">{user.correo}</p>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
              <span className="text-[11px] font-medium text-slate-500">Rol activo:</span>
              <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-200/60">
                {user.rol}
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full justify-center gap-2 rounded-xl border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors"
            onClick={onLogout}
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </Button>
        </div>
      </aside>

      {/* Vista Móvil y Contenido Principal */}
      <main className="min-w-0 flex-1 overflow-x-hidden">
        {/* Header Móvil */}
        <header className="border-b border-slate-200 bg-gradient-to-r from-blue-700 to-indigo-600 p-4 text-white lg:hidden">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 backdrop-blur-md">
                <School className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold leading-tight">Sistema Colegio</h1>
                <p className="text-xs text-blue-100">
                  {user.nombreUsuario} ({user.rol})
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white"
              onClick={onLogout}
            >
              <LogOut className="mr-1.5 h-3.5 w-3.5" />
              Salir
            </Button>
          </div>
        </header>

        {/* Navegación Horizontal Móvil */}
        <nav className="border-b border-slate-200 bg-white p-2.5 lg:hidden">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {visibleMenuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex min-w-max items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                      isActive
                        ? "bg-blue-600 text-white font-semibold"
                        : "text-slate-600 hover:bg-slate-100"
                    }`
                  }
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.title}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Area del Contenido */}
        <div className="w-full max-w-full overflow-x-hidden p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}