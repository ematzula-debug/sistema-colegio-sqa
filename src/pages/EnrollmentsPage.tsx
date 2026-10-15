import { type FormEvent, useEffect, useMemo, useState } from "react";
import {
  Pencil,
  Plus,
  UserX,
  Search,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  GraduationCap,
  Calendar,
  Layers,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createEnrollmentService,
  getEnrollmentsService,
  updateEnrollmentService,
  withdrawEnrollmentService,
} from "@/services/enrollments.service";
import { getGradesService } from "@/services/grades.service";
import { getSectionsService } from "@/services/sections.service";
import { getStudentsService } from "@/services/students.service";
import type { Enrollment, EnrollmentFormData } from "@/types/enrollment";
import type { Grade } from "@/types/grade";
import type { Section } from "@/types/section";
import type { Student } from "@/types/student";

const initialFormData: EnrollmentFormData = {
  alumnoId: "",
  gradoId: "",
  seccionId: "",
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

export function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEnrollment, setEditingEnrollment] = useState<Enrollment | null>(null);
  const [formData, setFormData] = useState<EnrollmentFormData>(initialFormData);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const activeStudents = useMemo(
    () => students.filter((student) => student.estado === "ACTIVO"),
    [students],
  );

  const activeGrades = useMemo(
    () => grades.filter((grade) => grade.estado === "ACTIVO"),
    [grades],
  );

  const filteredSections = useMemo(
    () =>
      sections.filter(
        (section) =>
          section.estado === "ACTIVO" &&
          String(section.gradoId) === formData.gradoId,
      ),
    [sections, formData.gradoId],
  );

  useEffect(() => {
    let active = true;

    async function loadInitialData() {
      try {
        const [enrollmentsData, studentsData, gradesData, sectionsData] =
          await Promise.all([
            getEnrollmentsService(),
            getStudentsService(),
            getGradesService(),
            getSectionsService(),
          ]);

        if (active) {
          setEnrollments(Array.isArray(enrollmentsData) ? enrollmentsData : []);
          setStudents(Array.isArray(studentsData) ? studentsData : []);
          setGrades(Array.isArray(gradesData) ? gradesData : []);
          setSections(Array.isArray(sectionsData) ? sectionsData : []);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Error al cargar inscripciones.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadInitialData();

    return () => {
      active = false;
    };
  }, []);

  async function reloadEnrollments() {
    const data = await getEnrollmentsService();
    setEnrollments(Array.isArray(data) ? data : []);
  }

  const filteredEnrollments = useMemo(() => {
    if (!searchTerm.trim()) return enrollments;
    const term = searchTerm.toLowerCase();
    return enrollments.filter(
      (e) =>
        (e.alumnoNombre ?? "").toLowerCase().includes(term) ||
        (e.alumnoCodigo ?? "").toLowerCase().includes(term) ||
        (e.gradoNombre ?? "").toLowerCase().includes(term) ||
        (e.seccionNombre ?? "").toLowerCase().includes(term)
    );
  }, [enrollments, searchTerm]);

  const stats = useMemo(() => {
    const total = enrollments.length;
    const inscritos = enrollments.filter((e) => e.estado === "INSCRITO").length;
    const retirados = total - inscritos;
    return { total, inscritos, retirados };
  }, [enrollments]);

  function resetForm() {
    setFormData(initialFormData);
    setEditingEnrollment(null);
  }

  function openCreateDialog() {
    resetForm();
    setError("");
    setSuccessMessage("");
    setOpenDialog(true);
  }

  function openEditDialog(enrollment: Enrollment) {
    setEditingEnrollment(enrollment);
    setError("");
    setSuccessMessage("");

    setFormData({
      alumnoId: String(enrollment.alumnoId),
      gradoId: String(enrollment.gradoId),
      seccionId: String(enrollment.seccionId),
    });

    setOpenDialog(true);
  }

  function handleSelectChange(
    field: keyof EnrollmentFormData,
    value: string,
  ) {
    setFormData((current) => {
      if (field === "gradoId") {
        return {
          ...current,
          gradoId: value,
          seccionId: "",
        };
      }

      return {
        ...current,
        [field]: value,
      };
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      if (editingEnrollment) {
        await updateEnrollmentService(editingEnrollment.id, formData);
        setSuccessMessage("Inscripción actualizada correctamente.");
      } else {
        await createEnrollmentService(formData);
        setSuccessMessage("Inscripción registrada correctamente.");
      }

      await reloadEnrollments();
      setOpenDialog(false);
      resetForm();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al guardar inscripción.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleWithdraw(enrollment: Enrollment) {
    const confirmed = window.confirm(
      `¿Deseas retirar la inscripción de ${enrollment.alumnoNombre}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccessMessage("");

      await withdrawEnrollmentService(enrollment.id);
      setSuccessMessage("Inscripción retirada correctamente.");
      await reloadEnrollments();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al retirar inscripción.",
      );
    }
  }

  return (
    <div className="space-y-6 p-1">
      {/* Banner Principal Estilo Dashboard */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-orange-600 to-amber-700 p-6 text-white shadow-lg">
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" /> Matrícula Escolar
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">Gestión de Inscripciones</h2>
            <p className="text-sm text-amber-100 max-w-xl">
              Asignación y matriculación de estudiantes en grados y secciones para el ciclo activo.
            </p>
          </div>
          <Button
            onClick={openCreateDialog}
            className="bg-white text-orange-700 hover:bg-orange-50 font-semibold shadow-md transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="mr-2 h-4 w-4" /> Nueva Inscripción
          </Button>
        </div>
      </div>

      <FeedbackAlert error={error} success={successMessage} />

      {/* Tarjetas de Métricas Rápidas */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-0 shadow-sm relative overflow-hidden bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Inscripciones</p>
              <h3 className="text-3xl font-bold mt-1">{stats.total}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Matrículas en historial</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <GraduationCap className="h-6 w-6" />
            </div>
          </CardContent>
          <div className="h-1.5 w-full bg-amber-500" />
        </Card>

        <Card className="border-0 shadow-sm relative overflow-hidden bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Alumnos Inscritos</p>
              <h3 className="text-3xl font-bold mt-1 text-emerald-600">{stats.inscritos}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Matrícula activa vigente</p>
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
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Retirados</p>
              <h3 className="text-3xl font-bold mt-1 text-slate-500">{stats.retirados}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Inscripciones canceladas</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400">
              <UserX className="h-6 w-6" />
            </div>
          </CardContent>
          <div className="h-1.5 w-full bg-orange-500" />
        </Card>
      </div>

      {/* Tabla de Resultados */}
      <Card className="border shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="flex flex-col gap-4 space-y-0 md:flex-row md:items-center md:justify-between bg-card pb-4">
          <div>
            <CardTitle className="text-lg font-bold">Listado de Inscripciones</CardTitle>
            <CardDescription>
              Mostrando {filteredEnrollments.length} registro(s)
            </CardDescription>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por alumno, grado o sección..."
              className="pl-9 rounded-xl border-muted bg-muted/30 focus-visible:bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              Cargando inscripciones...
            </div>
          ) : filteredEnrollments.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              No se encontraron inscripciones registradas.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="font-semibold">Alumno</TableHead>
                    <TableHead className="font-semibold">Grado</TableHead>
                    <TableHead className="font-semibold">Sección</TableHead>
                    <TableHead className="hidden sm:table-cell font-semibold">Ciclo</TableHead>
                    <TableHead className="hidden md:table-cell font-semibold">Fecha Inscripción</TableHead>
                    <TableHead className="font-semibold">Estado</TableHead>
                    <TableHead className="text-right font-semibold">Acciones</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredEnrollments.map((enrollment) => (
                    <TableRow key={enrollment.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium text-foreground">
                        <div>{enrollment.alumnoNombre}</div>
                        <div className="text-xs text-muted-foreground font-mono">{enrollment.alumnoCodigo}</div>
                      </TableCell>

                      <TableCell className="font-medium">
                        <div className="flex items-center gap-1.5">
                          <GraduationCap className="h-4 w-4 text-amber-600" />
                          <span>
                            {enrollment.gradoNombre}
                            {enrollment.gradoNivel ? ` (${enrollment.gradoNivel})` : ""}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <span className="inline-flex items-center gap-1 rounded-lg bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                          <Layers className="h-3 w-3" />
                          Sección {enrollment.seccionNombre}
                        </span>
                      </TableCell>

                      <TableCell className="hidden sm:table-cell text-xs font-mono">
                        {enrollment.cicloEscolarAnio}
                      </TableCell>

                      <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                        {enrollment.fechaInscripcion ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            {enrollment.fechaInscripcion.slice(0, 10)}
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={enrollment.estado === "INSCRITO" ? "default" : "secondary"}
                          className={
                            enrollment.estado === "INSCRITO"
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 gap-1"
                              : "gap-1"
                          }
                        >
                          {enrollment.estado === "INSCRITO" ? (
                            <UserCheck className="h-3 w-3" />
                          ) : (
                            <UserX className="h-3 w-3" />
                          )}
                          {enrollment.estado}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-950"
                            onClick={() => openEditDialog(enrollment)}
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950"
                            onClick={() => handleWithdraw(enrollment)}
                            disabled={enrollment.estado !== "INSCRITO"}
                            title="Retirar"
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

      {/* Modal / Diálogo Formulario */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingEnrollment ? "Editar Inscripción" : "Registrar Inscripción"}
            </DialogTitle>
            <DialogDescription>
              Selecciona el alumno, grado y sección. El ciclo escolar activo se asigna automáticamente.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Alumno *</Label>
              <Select
                value={formData.alumnoId}
                onValueChange={(value) => handleSelectChange("alumnoId", value ?? "")}
              >
                <SelectTrigger className="w-full rounded-xl">
                  <SelectValue placeholder="Selecciona un alumno" />
                </SelectTrigger>

                <SelectContent className="rounded-xl">
                  {activeStudents.map((student) => (
                    <SelectItem key={student.id} value={String(student.id)}>
                      {student.codigo} - {student.nombres} {student.apellidos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Grado *</Label>
              <Select
                value={formData.gradoId}
                onValueChange={(value) => handleSelectChange("gradoId", value ?? "")}
              >
                <SelectTrigger className="w-full rounded-xl">
                  <SelectValue placeholder="Selecciona un grado" />
                </SelectTrigger>

                <SelectContent className="rounded-xl">
                  {activeGrades.map((grade) => (
                    <SelectItem key={grade.id} value={String(grade.id)}>
                      {grade.nombre}
                      {grade.nivel ? ` - ${grade.nivel}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Sección *</Label>
              <Select
                value={formData.seccionId}
                onValueChange={(value) => handleSelectChange("seccionId", value ?? "")}
                disabled={!formData.gradoId}
              >
                <SelectTrigger className="w-full rounded-xl">
                  <SelectValue
                    placeholder={
                      formData.gradoId
                        ? "Selecciona una sección"
                        : "Primero selecciona un grado"
                    }
                  />
                </SelectTrigger>

                <SelectContent className="rounded-xl">
                  {filteredSections.map((section) => (
                    <SelectItem key={section.id} value={String(section.id)}>
                      Sección {section.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

              <Button type="submit" disabled={saving} className="rounded-xl bg-amber-600 hover:bg-amber-700">
                {saving ? "Guardando..." : "Guardar Inscripción"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}