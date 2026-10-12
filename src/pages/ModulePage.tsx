import {
  Hammer,
  Sparkles,
  Layers,
  CheckCircle2,
  Database,
  ShieldCheck,
  Clock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ModulePageProps {
  title: string;
  description: string;
}

export function ModulePage({ title, description }: ModulePageProps) {
  return (
    <div className="space-y-6 p-1">
      {/* Banner Principal dinámico */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-800 via-indigo-950 to-slate-900 p-6 text-white shadow-lg border border-slate-800">
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-medium text-indigo-300 border border-indigo-500/30 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" /> Módulo del Sistema
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">{title}</h2>
            <p className="text-sm text-slate-300 max-w-xl">
              {description}
            </p>
          </div>

          <Badge
            variant="outline"
            className="w-fit bg-amber-500/10 text-amber-400 border-amber-500/30 px-3 py-1.5 text-xs font-semibold backdrop-blur-md flex items-center gap-1.5"
          >
            <Clock className="h-3.5 w-3.5" /> En Desarrollo
          </Badge>
        </div>
      </div>

      {/* Tarjeta de Estado de Desarrollo */}
      <Card className="border shadow-sm rounded-2xl overflow-hidden bg-card">
        <CardHeader className="bg-muted/20 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <Hammer className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">Módulo en Construcción</CardTitle>
              <CardDescription>
                Esta sección está siendo preparada para la siguiente fase del proyecto.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Actualmente nos encontramos trabajando en el diseño e implementación de las funcionalidades core de este módulo. 
            Próximamente contará con integración completa con el backend y base de datos.
          </p>

          <div className="grid gap-4 sm:grid-cols-3 pt-2">
            <div className="flex items-start gap-3 rounded-xl border p-4 bg-muted/10">
              <Layers className="h-5 w-5 text-indigo-500 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Formularios y Tablas</h4>
                <p className="text-xs text-muted-foreground mt-1">Interfaz interactiva con filtros y gestión de datos en tiempo real.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border p-4 bg-muted/10">
              <Database className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Persistencia PostgreSQL</h4>
                <p className="text-xs text-muted-foreground mt-1">Conexión con servicios API REST, modelos de datos y transacciones.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border p-4 bg-muted/10">
              <ShieldCheck className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Pruebas de Calidad</h4>
                <p className="text-xs text-muted-foreground mt-1">Validación de esquemas, auditorías y evidencias de QA.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}