import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from "react";
import {
  Pencil,
  Plus,
  UserX,
  Search,
  Users,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Phone,
  Calendar,
  MapPin,
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
import { Textarea } from "@/components/ui/textarea";
import {
  createStudentService,
  deactivateStudentService,
  getStudentsService,
  updateStudentService,
} from "@/services/students.service";
import type { Student, StudentFormData } from "@/types/student";

const initialFormData: StudentFormData = {
  codigo: "",
  nombres: "",
  apellidos: "",
  fechaNacimiento: "",
  direccion: "",
  telefono: "",
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

export function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState<StudentFormData>(initialFormData);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function loadStudents() {
    try {
      setLoading(true);
      setError("");

      const data = await getStudentsService();
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error al cargar alumnos.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    getStudentsService()
      .then((data) => {
        if (cancelled) return;

        setStudents(Array.isArray(data) ? data : []);
        setError("");
      })
      .catch((err: unknown) => {
        if (cancelled) return;

        setError(
          err instanceof Error ? err.message : "Error al cargar alumnos.",
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

  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) return students;
    const term = searchTerm.toLowerCase();
    return students.filter(
      (s) =>
        (s.nombres ?? "").toLowerCase().includes(term) ||
        (s.apellidos ?? "").toLowerCase().includes(term) ||
        (s.codigo ?? "").toLowerCase().includes(term) ||
        (s.telefono ?? "").toLowerCase().includes(term)
    );
  }, [students, searchTerm]);

  const stats = useMemo(() => {
    const total = students.length;
    const activos = students.filter((s) => s.estado === "ACTIVO").length;
    const inactivos = total - activos;
    return { total, activos, inactivos };
  }, [students]);

  function resetForm() {
    setFormData(initialFormData);
    setEditingStudent(null);
  }

  function openCreateDialog() {
    resetForm();
    setError("");
    setSuccessMessage("");
    setOpenDialog(true);
  }

  function openEditDialog(student: Student) {
    setEditingStudent(student);
    setError("");
    setSuccessMessage("");

    setFormData({
      codigo: student.codigo,
      nombres: student.nombres,
      apellidos: student.apellidos,
      fechaNacimiento: student.fechaNacimiento
        ? student.fechaNacimiento.slice(0, 10)
        : "",
      direccion: student.direccion || "",
      telefono: student.telefono || "",
    });

    setOpenDialog(true);
  }

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      if (editingStudent) {
        await updateStudentService(editingStudent.id, formData);
        setSuccessMessage("Alumno actualizado correctamente.");
      } else {
        await createStudentService(formData);
        setSuccessMessage("Alumno registrado correctamente.");
      }

      await loadStudents();
      setOpenDialog(false);
      resetForm();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error al guardar alumno.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(student: Student) {
    const confirmed = window.confirm(
      `¿Deseas desactivar al alumno ${student.nombres} ${student.apellidos}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccessMessage("");

      await deactivateStudentService(student.id);
      setSuccessMessage("Alumno desactivado correctamente.");
      await loadStudents();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error al desactivar alumno.");
      }
    }
  }

  return (
    <div className="space-y-6 p-1">
      {/* Banner Principal Estilo Dashboard */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-700 p-6 text-white shadow-lg">
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" /> Expediente Estudiantil
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">Gestión de Alumnos</h2>
            <p className="text-sm text-blue-100 max-w-xl">
              Administración de expedientes personales, datos de contacto y estado académico del alumnado.
            </p>
          </div>
          <Button
            onClick={openCreateDialog}
            className="bg-white text-blue-700 hover:bg-blue-50 font-semibold shadow-md transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="mr-2 h-4 w-4" /> Nuevo Alumno
          </Button>
        </div>
      </div>

      <FeedbackAlert error={error} success={successMessage} />

      {/* Tarjetas de Métricas Rápidas */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-0 shadow-sm relative overflow-hidden bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Alumnos</p>
              <h3 className="text-3xl font-bold mt-1">{stats.total}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Estudiantes registrados</p>
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
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Activos</p>
              <h3 className="text-3xl font-bold mt-1 text-emerald-600">{stats.activos}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">En expediente activo</p>
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
              <p className="text-xs text-muted-foreground mt-0.5">Expedientes desactivados</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              <UserX className="h-6 w-6" />
            </div>
          </CardContent>
          <div className="h-1.5 w-full bg-slate-400" />
        </Card>
      </div>

      {/* Tabla de Resultados */}
      <Card className="border shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="flex flex-col gap-4 space-y-0 md:flex-row md:items-center md:justify-between bg-card pb-4">
          <div>
            <CardTitle className="text-lg font-bold">Listado de Alumnos</CardTitle>
            <CardDescription>
              Mostrando {filteredStudents.length} alumno(s)
            </CardDescription>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por código, nombre o teléfono..."
              className="pl-9 rounded-xl border-muted bg-muted/30 focus-visible:bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              Cargando alumnos...
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              No se encontraron alumnos registrados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="font-semibold">Código</TableHead>
                    <TableHead className="font-semibold">Nombre Completo</TableHead>
                    <TableHead className="hidden md:table-cell font-semibold">Fecha Nacimiento</TableHead>
                    <TableHead className="hidden sm:table-cell font-semibold">Teléfono</TableHead>
                    <TableHead className="font-semibold">Estado</TableHead>
                    <TableHead className="text-right font-semibold">Acciones</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredStudents.map((student) => {
                    const initials = `${student.nombres?.[0] || ""}${student.apellidos?.[0] || ""}`.toUpperCase();
                    return (
                      <TableRow key={student.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
                          {student.codigo}
                        </TableCell>

                        <TableCell className="font-medium text-foreground">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-xs text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                              {initials || <GraduationCap className="h-4 w-4" />}
                            </div>
                            <div>
                              <div className="font-semibold">{student.nombres} {student.apellidos}</div>
                              {student.direccion && (
                                <div className="text-xs text-muted-foreground flex items-center gap-1 line-clamp-1">
                                  <MapPin className="h-3 w-3 shrink-0" />
                                  {student.direccion}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                          {student.fechaNacimiento ? (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                              {student.fechaNacimiento.slice(0, 10)}
                            </div>
                          ) : (
                            "-"
                          )}
                        </TableCell>

                        <TableCell className="hidden sm:table-cell text-xs">
                          {student.telefono ? (
                            <div className="flex items-center gap-1 font-mono text-muted-foreground">
                              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                              {student.telefono}
                            </div>
                          ) : (
                            "-"
                          )}
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant={student.estado === "ACTIVO" ? "default" : "secondary"}
                            className={
                              student.estado === "ACTIVO"
                                ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
                                : ""
                            }
                          >
                            {student.estado}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950"
                              onClick={() => openEditDialog(student)}
                              title="Editar"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950"
                              onClick={() => handleDeactivate(student)}
                              disabled={student.estado !== "ACTIVO"}
                              title="Desactivar"
                            >
                              <UserX className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal / Diálogo Formulario */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingStudent ? "Editar Alumno" : "Registrar Alumno"}
            </DialogTitle>
            <DialogDescription>
              Completa los datos solicitados para guardar el expediente del alumno.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="codigo">Código *</Label>
                <Input
                  id="codigo"
                  name="codigo"
                  value={formData.codigo}
                  onChange={handleChange}
                  placeholder="Ej: A-001"
                  className="rounded-xl font-mono"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaNacimiento">Fecha de nacimiento</Label>
                <Input
                  id="fechaNacimiento"
                  name="fechaNacimiento"
                  type="date"
                  value={formData.fechaNacimiento}
                  onChange={handleChange}
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
                  placeholder="Juan Carlos"
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
                  placeholder="Pérez López"
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
                  placeholder="5555-5555"
                  className="rounded-xl font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Textarea
                id="direccion"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                placeholder="Dirección domiciliar del alumno"
                className="rounded-xl resize-none"
                rows={3}
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

              <Button type="submit" disabled={saving} className="rounded-xl bg-blue-600 hover:bg-blue-700">
                {saving ? "Guardando..." : "Guardar Alumno"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}