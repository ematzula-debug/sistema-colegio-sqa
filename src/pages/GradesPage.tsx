import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from "react";
import {
  Pencil,
  Plus,
  Power,
  Search,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  GraduationCap,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createGradeService,
  deactivateGradeService,
  getGradesService,
  updateGradeService,
} from "@/services/grades.service";
import type { Grade, GradeFormData } from "@/types/grade";

const initialFormData: GradeFormData = {
  nombre: "",
  nivel: "",
};

function FeedbackAlert({ error, success }: { error?: string; success?: string }) {
  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-700 shadow-sm backdrop-blur-sm dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400">
        <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
        <span>{error}</span>
      </div>
    );
  }
  if (success) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-sm text-emerald-700 shadow-sm backdrop-blur-sm dark:border-emerald-900/50 dark:bg-emerald-950/50 dark:text-emerald-400">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
        <span>{success}</span>
      </div>
    );
  }
  return null;
}

export function GradesPage() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [formData, setFormData] = useState<GradeFormData>(initialFormData);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function loadGrades() {
    try {
      setLoading(true);
      setError("");
      const data = await getGradesService();
      setGrades(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar grados.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    getGradesService()
      .then((data) => {
        if (cancelled) return;
        setGrades(Array.isArray(data) ? data : []);
        setError("");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Error al cargar grados.",
        );
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredGrades = useMemo(() => {
    if (!searchTerm.trim()) return grades;
    const term = searchTerm.toLowerCase();
    return grades.filter(
      (g) =>
        (g.nombre ?? "").toLowerCase().includes(term) ||
        (g.nivel ?? "").toLowerCase().includes(term)
    );
  }, [grades, searchTerm]);

  const stats = useMemo(() => {
    const total = grades.length;
    const activos = grades.filter((g) => g.estado === "ACTIVO").length;
    const inactivos = total - activos;
    return { total, activos, inactivos };
  }, [grades]);

  function resetForm() {
    setFormData(initialFormData);
    setEditingGrade(null);
  }

  function openCreateDialog() {
    resetForm();
    setError("");
    setSuccessMessage("");
    setOpenDialog(true);
  }

  function openEditDialog(grade: Grade) {
    setEditingGrade(grade);
    setError("");
    setSuccessMessage("");

    setFormData({
      nombre: grade.nombre,
      nivel: grade.nivel || "",
    });

    setOpenDialog(true);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      if (editingGrade) {
        await updateGradeService(editingGrade.id, formData);
        setSuccessMessage("Grado actualizado correctamente.");
      } else {
        await createGradeService(formData);
        setSuccessMessage("Grado creado correctamente.");
      }

      await loadGrades();
      setOpenDialog(false);
      resetForm();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al guardar el grado.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(grade: Grade) {
    const confirmed = window.confirm(
      `¿Deseas cambiar el estado del grado "${grade.nombre}"?`,
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccessMessage("");
      await deactivateGradeService(grade.id);
      setSuccessMessage("Estado de grado modificado correctamente.");
      await loadGrades();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al actualizar estado del grado.",
      );
    }
  }

  return (
    <div className="space-y-6 p-1">
      {/* Banner Principal */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-700 p-6 text-white shadow-lg">
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" /> Nivel Académico
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">Gestión de Grados</h2>
            <p className="text-sm text-purple-100 max-w-xl">
              Configuración de niveles escolares (Primaria, Básico, Diversificado) y sus grados correspondientes.
            </p>
          </div>
          <Button
            onClick={openCreateDialog}
            className="bg-white text-purple-700 hover:bg-purple-50 font-semibold shadow-md transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="mr-2 h-4 w-4" /> Nuevo Grado
          </Button>
        </div>
      </div>

      <FeedbackAlert error={error} success={successMessage} />

      {/* Tarjetas de Métricas Rápidas */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-0 shadow-sm relative overflow-hidden bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Grados</p>
              <h3 className="text-3xl font-bold mt-1">{stats.total}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Grados configurados</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
              <GraduationCap className="h-6 w-6" />
            </div>
          </CardContent>
          <div className="h-1.5 w-full bg-purple-500" />
        </Card>

        <Card className="border-0 shadow-sm relative overflow-hidden bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Activos</p>
              <h3 className="text-3xl font-bold mt-1 text-emerald-600">{stats.activos}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Habilitados para matrícula</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <BookOpen className="h-6 w-6" />
            </div>
          </CardContent>
          <div className="h-1.5 w-full bg-emerald-500" />
        </Card>

        <Card className="border-0 shadow-sm relative overflow-hidden bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Inactivos</p>
              <h3 className="text-3xl font-bold mt-1 text-slate-500">{stats.inactivos}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Deshabilitados</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              <Power className="h-6 w-6" />
            </div>
          </CardContent>
          <div className="h-1.5 w-full bg-slate-400" />
        </Card>
      </div>

      {/* Tabla de Resultados */}
      <Card className="border shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="flex flex-col gap-4 space-y-0 md:flex-row md:items-center md:justify-between bg-card pb-4">
          <div>
            <CardTitle className="text-lg font-bold">Listado de Grados</CardTitle>
            <CardDescription>
              Mostrando {filteredGrades.length} grado(s)
            </CardDescription>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por grado o nivel..."
              className="pl-9 rounded-xl border-muted bg-muted/30 focus-visible:bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              Cargando grados...
            </div>
          ) : filteredGrades.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              No se encontraron grados registrados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="font-semibold">Grado / Nombre</TableHead>
                    <TableHead className="font-semibold">Nivel Educativo</TableHead>
                    <TableHead className="font-semibold">Estado</TableHead>
                    <TableHead className="text-right font-semibold">Acciones</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredGrades.map((grade) => (
                    <TableRow key={grade.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-semibold text-foreground">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                            <Layers className="h-4 w-4" />
                          </div>
                          <span>{grade.nombre}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {grade.nivel || "Sin especificación"}
                        </span>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={grade.estado === "ACTIVO" ? "default" : "secondary"}
                          className={
                            grade.estado === "ACTIVO"
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
                              : ""
                          }
                        >
                          {grade.estado}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-950"
                            onClick={() => openEditDialog(grade)}
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950"
                            onClick={() => handleDeactivate(grade)}
                            disabled={grade.estado !== "ACTIVO"}
                            title="Desactivar"
                          >
                            <Power className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Formulario */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingGrade ? "Editar Grado" : "Registrar Grado"}
            </DialogTitle>
            <DialogDescription>
              Define el nombre del grado escolar y el nivel educativo correspondiente.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del Grado *</Label>
              <Input
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej: Primero, Segundo, Tercero..."
                className="rounded-xl"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nivel">Nivel Educativo *</Label>
              <Input
                id="nivel"
                name="nivel"
                value={formData.nivel}
                onChange={handleChange}
                placeholder="Ej: Primaria, Básico, Diversificado"
                className="rounded-xl"
                required
              />
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => setOpenDialog(false)}
              >
                Cancelar
              </Button>

              <Button type="submit" disabled={saving} className="rounded-xl bg-purple-600 hover:bg-purple-700">
                {saving ? "Guardando..." : "Guardar Grado"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}