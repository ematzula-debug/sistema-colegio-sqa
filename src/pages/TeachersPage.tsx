import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from "react";
import {
  Pencil,
  Plus,
  Search,
  UserCheck,
  UserX,
  AlertCircle,
  CheckCircle2,
  Users,
  GraduationCap,
  Mail,
  Phone,
  Sparkles,
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
  createTeacherService,
  deactivateTeacherService,
  getTeachersService,
  updateTeacherService,
} from "@/services/teachers.service";
import type { Teacher, TeacherFormData } from "@/types/teacher";

const initialFormData: TeacherFormData = {
  codigo: "",
  nombres: "",
  apellidos: "",
  telefono: "",
  correo: "",
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

export function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState<TeacherFormData>(initialFormData);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadInitialTeachers() {
      try {
        const data = await getTeachersService();
        if (active) setTeachers(Array.isArray(data) ? data : []);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Error al cargar profesores.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadInitialTeachers();
    return () => { active = false; };
  }, []);

  async function reloadTeachers() {
    const data = await getTeachersService();
    setTeachers(Array.isArray(data) ? data : []);
  }

  const filteredTeachers = useMemo(() => {
    if (!searchTerm.trim()) return teachers;
    const term = searchTerm.toLowerCase();
    return teachers.filter(
      (t) =>
        (t.nombres ?? "").toLowerCase().includes(term) ||
        (t.apellidos ?? "").toLowerCase().includes(term) ||
        (t.codigo ?? "").toLowerCase().includes(term) ||
        (t.correo ?? "").toLowerCase().includes(term)
    );
  }, [teachers, searchTerm]);

  const stats = useMemo(() => {
    const total = teachers.length;
    const activos = teachers.filter((t) => t.estado === "ACTIVO").length;
    const inactivos = total - activos;
    return { total, activos, inactivos };
  }, [teachers]);

  function resetForm() {
    setFormData(initialFormData);
    setEditingTeacher(null);
  }

  function openCreateDialog() {
    resetForm();
    setError("");
    setSuccessMessage("");
    setOpenDialog(true);
  }

  function openEditDialog(teacher: Teacher) {
    setEditingTeacher(teacher);
    setError("");
    setSuccessMessage("");
    setFormData({
      codigo: teacher.codigo ?? "",
      nombres: teacher.nombres ?? "",
      apellidos: teacher.apellidos ?? "",
      telefono: teacher.telefono ?? "",
      correo: teacher.correo ?? "",
    });
    setOpenDialog(true);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      if (editingTeacher) {
        await updateTeacherService(editingTeacher.id, formData);
        setSuccessMessage("Profesor actualizado correctamente.");
      } else {
        await createTeacherService(formData);
        setSuccessMessage("Profesor registrado correctamente.");
      }

      await reloadTeachers();
      setOpenDialog(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar profesor.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(teacher: Teacher) {
    if (!window.confirm(`¿Deseas desactivar a ${teacher.nombres} ${teacher.apellidos}?`)) return;

    try {
      setError("");
      setSuccessMessage("");
      await deactivateTeacherService(teacher.id);
      setSuccessMessage("Profesor desactivado correctamente.");
      await reloadTeachers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al desactivar profesor.");
    }
  }

  return (
    <div className="space-y-6 p-1">
      {/* Banner Principal Estilo Dashboard */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 text-white shadow-lg">
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" /> Cuerpo Docente
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">Profesores y Personal</h2>
            <p className="text-sm text-blue-100 max-w-xl">
              Administración centralizada de docentes, directores y equipo académico de la institución.
            </p>
          </div>
          <Button
            onClick={openCreateDialog}
            className="bg-white text-indigo-700 hover:bg-blue-50 font-semibold shadow-md transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="mr-2 h-4 w-4" /> Nuevo Profesor
          </Button>
        </div>
      </div>

      <FeedbackAlert error={error} success={successMessage} />

      {/* Tarjetas de Métricas Rápidas */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-0 shadow-sm relative overflow-hidden bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Profesores</p>
              <h3 className="text-3xl font-bold mt-1">{stats.total}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Registrados en el sistema</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Users className="h-6 w-6" />
            </div>
          </CardContent>
          <div className="h-1.5 w-full bg-blue-500" />
        </Card>

        <Card className="border-0 shadow-sm relative overflow-hidden bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Docentes Activos</p>
              <h3 className="text-3xl font-bold mt-1 text-emerald-600">{stats.activos}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Asignables a cursos</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <UserCheck className="h-6 w-6" />
            </div>
          </CardContent>
          <div className="h-1.5 w-full bg-emerald-500" />
        </Card>

        <Card className="border-0 shadow-sm relative overflow-hidden bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Inactivos</p>
              <h3 className="text-3xl font-bold mt-1 text-slate-500">{stats.inactivos}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Sin asignación actual</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
              <GraduationCap className="h-6 w-6" />
            </div>
          </CardContent>
          <div className="h-1.5 w-full bg-purple-500" />
        </Card>
      </div>

      {/* Tabla de Resultados */}
      <Card className="border shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="flex flex-col gap-4 space-y-0 md:flex-row md:items-center md:justify-between bg-card pb-4">
          <div>
            <CardTitle className="text-lg font-bold">Listado de Profesores</CardTitle>
            <CardDescription>
              Mostrando {filteredTeachers.length} docente(s)
            </CardDescription>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por código, nombre o correo..."
              className="pl-9 rounded-xl border-muted bg-muted/30 focus-visible:bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              Cargando información del personal docente...
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              No se encontraron profesores coincidentes.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="font-semibold">Código</TableHead>
                    <TableHead className="font-semibold">Nombre Completo</TableHead>
                    <TableHead className="hidden sm:table-cell font-semibold">Teléfono</TableHead>
                    <TableHead className="hidden md:table-cell font-semibold">Correo Electrónico</TableHead>
                    <TableHead className="font-semibold">Estado</TableHead>
                    <TableHead className="text-right font-semibold">Acciones</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredTeachers.map((teacher) => (
                    <TableRow key={teacher.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        {teacher.codigo ?? "S/C"}
                      </TableCell>

                      <TableCell className="font-medium text-foreground">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 font-bold text-indigo-700 text-xs dark:bg-indigo-950 dark:text-indigo-300">
                            {teacher.nombres.charAt(0)}{teacher.apellidos.charAt(0)}
                          </div>
                          <span>{teacher.nombres} {teacher.apellidos}</span>
                        </div>
                      </TableCell>

                      <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                        {teacher.telefono ? (
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                            {teacher.telefono}
                          </div>
                        ) : (
                          <span className="italic">Sin teléfono</span>
                        )}
                      </TableCell>

                      <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                        {teacher.correo ? (
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                            {teacher.correo}
                          </div>
                        ) : (
                          <span className="italic">Sin correo</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={teacher.estado === "ACTIVO" ? "default" : "secondary"}
                          className={
                            teacher.estado === "ACTIVO"
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 gap-1"
                              : "gap-1"
                          }
                        >
                          {teacher.estado === "ACTIVO" ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                          {teacher.estado ?? "INACTIVO"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950"
                            onClick={() => openEditDialog(teacher)}
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950"
                            onClick={() => handleDeactivate(teacher)}
                            disabled={teacher.estado !== "ACTIVO"}
                            title="Desactivar"
                          >
                            <UserX className="h-4 w-4" />
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

      {/* Modal / Diálogo */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingTeacher ? "Editar Profesor" : "Registrar Profesor"}
            </DialogTitle>
            <DialogDescription>
              Ingresa los datos personales y de contacto del docente.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="codigo">Código *</Label>
                <Input
                  id="codigo"
                  name="codigo"
                  value={formData.codigo}
                  onChange={handleChange}
                  placeholder="Ej: P-001"
                  className="rounded-xl"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="Ej: 5555-5555"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nombres">Nombres *</Label>
                <Input
                  id="nombres"
                  name="nombres"
                  value={formData.nombres}
                  onChange={handleChange}
                  placeholder="Ej: María Fernanda"
                  className="rounded-xl"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apellidos">Apellidos *</Label>
                <Input
                  id="apellidos"
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleChange}
                  placeholder="Ej: García López"
                  className="rounded-xl"
                  required
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="correo">Correo Electrónico</Label>
                <Input
                  id="correo"
                  name="correo"
                  type="email"
                  value={formData.correo}
                  onChange={handleChange}
                  placeholder="ejemplo@colegio.com"
                  className="rounded-xl"
                />
              </div>
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

              <Button type="submit" disabled={saving} className="rounded-xl bg-indigo-600 hover:bg-indigo-700">
                {saving ? "Guardando..." : "Guardar Profesor"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}