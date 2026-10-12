import { useState } from "react";
import {
  AlertCircle,
  Eye,
  EyeOff,
  GraduationCap,
  KeyRound,
  Lock,
  LogIn,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginService } from "@/services/auth.service";
import type { AuthUser } from "@/types/auth";

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [usuario, setUsuario] = useState("admin");
  const [contrasena, setContrasena] = useState("Admin123*");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await loginService({
        usuario,
        contrasena,
      });

      if (response.success && response.data) {
        onLoginSuccess(response.data.user);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocurrió un error al iniciar sesión.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-slate-900 p-4 sm:p-6 lg:p-8">
      {/* Fondo con luces de ambiente */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -left-1/4 -top-1/4 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute -right-1/4 -bottom-1/4 h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-[120px]" />
      </div>

      <div className="relative z-10 grid w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 shadow-2xl backdrop-blur-xl md:grid-cols-2">
        {/* Panel Izquierdo: Presentación */}
        <div className="hidden flex-col justify-between bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-8 text-white md:flex">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md border border-white/20">
              <Sparkles className="h-3.5 w-3.5" /> Portal Académico
            </div>
            <h1 className="text-3xl font-black tracking-tight">Sistema Colegio</h1>
            <p className="text-sm text-blue-100/90 leading-relaxed">
              Plataforma integral de gestión escolar, control de inscripciones y seguimiento académico de estudiantes.
            </p>
          </div>

          <div className="my-8 flex justify-center">
            <div className="flex h-32 w-32 items-center justify-center rounded-3xl bg-white/10 border border-white/20 backdrop-blur-md shadow-2xl">
              <GraduationCap className="h-16 w-16 text-white" />
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-blue-200/80">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-300" />
            <span>Aseguramiento de la Calidad del Software — Control de Acceso Cifrado</span>
          </div>
        </div>

        {/* Panel Derecho: Formulario */}
        <div className="flex flex-col justify-center p-6 sm:p-10">
          <Card className="border-0 bg-transparent shadow-none">
            <CardHeader className="p-0 pb-6 text-left">
              <div className="mb-2 inline-flex md:hidden items-center gap-1.5 text-blue-500 font-bold text-sm">
                <GraduationCap className="h-5 w-5" /> Sistema Colegio
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight text-slate-100">
                ¡Bienvenido de nuevo!
              </CardTitle>
              <CardDescription className="text-slate-400">
                Ingresa tus credenciales para acceder a la plataforma.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="usuario" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Usuario o Correo
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <Input
                      id="usuario"
                      type="text"
                      value={usuario}
                      onChange={(e) => setUsuario(e.target.value)}
                      placeholder="Ej. admin"
                      className="pl-9 rounded-xl border-slate-700 bg-slate-800/60 text-slate-100 placeholder:text-slate-500 focus-visible:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contrasena" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <Input
                      id="contrasena"
                      type={showPassword ? "text" : "password"}
                      value={contrasena}
                      onChange={(e) => setContrasena(e.target.value)}
                      placeholder="Ingresa tu contraseña"
                      className="pl-9 pr-10 rounded-xl border-slate-700 bg-slate-800/60 text-slate-100 placeholder:text-slate-500 focus-visible:ring-blue-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-950/40 p-3.5 text-xs text-red-300 backdrop-blur-sm">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                    <span>{error}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <KeyRound className="h-4 w-4 animate-spin" /> Ingresando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <LogIn className="h-4 w-4" /> Iniciar Sesión
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}