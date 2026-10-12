import {
  GraduationCap,
  LogOut,
  ShieldCheck,
  Sparkles,
  User,
  Mail,
  Award,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AuthUser } from "@/types/auth";

interface HomePageProps {
  user: AuthUser;
  onLogout: () => void;
}

export function HomePage({ user, onLogout }: HomePageProps) {
  return (
    <main className="min-h-screen bg-slate-50/50 p-4 md:p-8 dark:bg-slate-950">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Banner Principal */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 p-8 text-white shadow-xl">
          <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5" /> Portal Institucional
              </div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Sistema Colegio
              </h1>
              <p className="max-w-md text-sm text-blue-100">
                Aseguramiento de la Calidad del Software — Control integral de inscripciones, calificaciones y docentes.
              </p>
            </div>

            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-inner">
              <GraduationCap className="h-10 w-10 text-white" />
            </div>
          </div>
        </div>

        {/* Tarjeta de Perfil de Usuario */}
        <Card className="border-0 shadow-md rounded-2xl overflow-hidden bg-card">
          <CardHeader className="border-b bg-muted/20 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Perfil de Usuario
                </CardTitle>
                <CardDescription>
                  Información de la sesión actual y credenciales del sistema.
                </CardDescription>
              </div>

              <Badge
                variant="outline"
                className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900"
              >
                Sesión Activa
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border bg-slate-50/50 p-4 dark:bg-slate-900/50">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">
                  Usuario
                </span>
                <p className="font-bold text-base text-foreground flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-500" />
                  {user.nombreUsuario}
                </p>
              </div>

              <div className="rounded-xl border bg-slate-50/50 p-4 dark:bg-slate-900/50">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">
                  Correo Electrónico
                </span>
                <p className="font-semibold text-sm text-foreground flex items-center gap-2 truncate">
                  <Mail className="h-4 w-4 text-slate-500 shrink-0" />
                  <span className="truncate">{user.correo}</span>
                </p>
              </div>

              <div className="rounded-xl border bg-slate-50/50 p-4 dark:bg-slate-900/50">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">
                  Rol / Permisos
                </span>
                <p className="font-semibold text-sm text-foreground flex items-center gap-2">
                  <Award className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <Badge variant="secondary" className="font-bold">
                    {user.rol}
                  </Badge>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Autenticación de sesión cifrada por JWT</span>
              </div>

              <Button
                variant="destructive"
                onClick={onLogout}
                className="rounded-xl shadow-sm transition-all hover:scale-105 active:scale-95"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar sesión
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}