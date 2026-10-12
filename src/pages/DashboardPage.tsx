import { useEffect, useState } from "react";
import {
  BookOpen,
  ClipboardList,
  GraduationCap,
  NotebookPen,
  School,
  Users,
  UserRoundCheck,
  FileText,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDashboardSummaryService } from "@/services/dashboard.service";
import type { DashboardSummary } from "@/types/dashboard";

const initialSummary: DashboardSummary = {
  alumnos: "0",
  profesores: "0",
  encargados: "0",
  grados: "0",
  secciones: "0",
  asignaturas: "0",
  inscripciones: "0",
  notas: "0",
};

export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary>(initialSummary);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadSummary() {
      try {
        const data = await getDashboardSummaryService();

        if (active) {
          setSummary(data);
        }
      } catch (error) {
        if (active) {
          setError(
            error instanceof Error
              ? error.message
              : "Error al cargar resumen del dashboard.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadSummary();

    return () => {
      active = false;
    };
  }, []);

  const summaryCards = [
    {
      title: "Alumnos",
      value: summary.alumnos,
      description: "Alumnos activos registrados",
      icon: GraduationCap,
      color: "from-blue-600 to-indigo-600",
      bgIcon: "bg-blue-100 text-blue-700",
    },
    {
      title: "Profesores",
      value: summary.profesores,
      description: "Docentes activos registrados",
      icon: UserRoundCheck,
      color: "from-indigo-600 to-violet-600",
      bgIcon: "bg-indigo-100 text-indigo-700",
    },
    {
      title: "Encargados",
      value: summary.encargados,
      description: "Padres o encargados activos",
      icon: Users,
      color: "from-sky-500 to-blue-600",
      bgIcon: "bg-sky-100 text-sky-700",
    },
    {
      title: "Grados",
      value: summary.grados,
      description: "Grados académicos activos",
      icon: School,
      color: "from-emerald-500 to-teal-600",
      bgIcon: "bg-emerald-100 text-emerald-700",
    },
    {
      title: "Secciones",
      value: summary.secciones,
      description: "Secciones activas registradas",
      icon: ClipboardList,
      color: "from-teal-500 to-cyan-600",
      bgIcon: "bg-teal-100 text-teal-700",
    },
    {
      title: "Asignaturas",
      value: summary.asignaturas,
      description: "Cursos activos registrados",
      icon: BookOpen,
      color: "from-violet-500 to-purple-600",
      bgIcon: "bg-purple-100 text-purple-700",
    },
    {
      title: "Inscripciones",
      value: summary.inscripciones,
      description: "Alumnos inscritos actualmente",
      icon: NotebookPen,
      color: "from-amber-500 to-orange-600",
      bgIcon: "bg-amber-100 text-amber-700",
    },
    {
      title: "Notas",
      value: summary.notas,
      description: "Notas activas registradas",
      icon: FileText,
      color: "from-rose-500 to-pink-600",
      bgIcon: "bg-rose-100 text-rose-700",
    },
  ];

  const projectFeatures = [
    "Frontend configurado con React, Vite, Tailwind CSS y shadcn/ui.",
    "Backend configurado con Node.js, Express y PostgreSQL.",
    "Autenticación mediante login y token JWT.",
    "Rutas protegidas en frontend y backend.",
    "CRUD de alumnos, profesores, encargados, grados, secciones y asignaturas.",
    "Asignación de profesores por asignatura, grado y sección.",
    "Control de inscripciones de alumnos.",
    "Registro, edición y anulación de notas.",
    "Dashboard conectado a PostgreSQL.",
  ];

  return (
    <div className="space-y-8">
      {/* Banner de Bienvenida */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 p-6 text-white shadow-lg md:p-8">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md mb-3 text-blue-100">
            <Sparkles className="h-3.5 w-3.5 text-blue-200" />
            Panel General
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">
            Resumen Académico
          </h2>
          <p className="mt-2 text-sm text-blue-100 md:text-base">
            Bienvenido al Sistema Web de Gestión Académica. Aquí tienes un vistazo en tiempo real sobre los registros y métricas clave del colegio.
          </p>
        </div>
        <div className="absolute -right-8 -bottom-8 h-48 w-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      </div>

      {/* Alerta de Error */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 shadow-xs">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
          <p>{error}</p>
        </div>
      )}

      {/* Tarjetas de Métricas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <Card
              key={card.title}
              className="relative overflow-hidden border-slate-200/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold text-slate-600">
                  {card.title}
                </CardTitle>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.bgIcon}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </CardHeader>

              <CardContent>
                <div className="flex items-baseline gap-2">
                  {loading ? (
                    <div className="h-9 w-16 animate-pulse rounded-lg bg-slate-200" />
                  ) : (
                    <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                      {card.value}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-500 font-medium">
                  {card.description}
                </p>
              </CardContent>
              <div className={`h-1 w-full bg-gradient-to-r ${card.color}`} />
            </Card>
          );
        })}
      </div>

      {/* Card de Estado del Proyecto */}
      <Card className="border-slate-200/80 shadow-xs">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-slate-800">
                Estado del Proyecto
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Módulos y capacidades operativas integradas en esta versión.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {projectFeatures.map((feature, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/40 p-3.5 transition-colors hover:bg-slate-100/60"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span className="text-xs font-medium text-slate-700 leading-relaxed">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}