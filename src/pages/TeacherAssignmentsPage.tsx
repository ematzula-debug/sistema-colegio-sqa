import { type FormEvent, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  GraduationCap,
  Loader2,
  Pencil,
  Plus,
  Search,
  Sparkles,
  UserCheck,
  UserX,
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
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getGradesService } from "@/services/grades.service";
import { getSectionsService } from "@/services/sections.service";
import { getSubjectsService } from "@/services/subjects.service";
import {
  createTeacherAssignmentService,
  deactivateTeacherAssignmentService,
  getTeacherAssignmentsService,
  updateTeacherAssignmentService,
} from "@/services/teacherAssignments.service";
import { getTeachersService } from "@/services/teachers.service";
import type { Grade } from "@/types/grade";
import type { Section } from "@/types/section";
import type { Subject } from "@/types/subject";
import type { Teacher } from "@/types/teacher";
import type {
  TeacherAssignment,
  TeacherAssignmentFormData,
} from "@/types/teacherAssignment";

const initialFormData: TeacherAssignmentFormData = {
  profesorId: "",
  asignaturaId: "",
  gradoId: "",
  seccionId: "",
};

export function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAssignment, setEditingAssignment] =
    useState<TeacherAssignment | null>(null);
  const [formData, setFormData] =
    useState<TeacherAssignmentFormData>(initialFormData);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const activeTeachers = useMemo(
    () => teachers.filter((teacher) => teacher.estado === "ACTIVO"),
    [teachers],
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

  const filteredSubjects = useMemo(
    () =>
      subjects.filter(
        (subject) =>
          subject.estado === "ACTIVO" &&
          String(subject.gradoId) === formData.gradoId,
      ),
    [subjects, formData.gradoId],
  );

  useEffect(() => {
    let active = true;

    async function loadInitialData() {
      try {
        const [
          assignmentsData,
          teachersData,
          gradesData,
          sectionsData,
          subjectsData,
        ] = await Promise.all([
          getTeacherAssignmentsService(),
          getTeachersService(),
          getGradesService(),
          getSectionsService(),
          getSubjectsService(),
        ]);

        if (active) {
          setAssignments(assignmentsData);
          setTeachers(teachersData);
          setGrades(gradesData);
          setSections(sectionsData);
          setSubjects(subjectsData);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Error al cargar asignaciones.",
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

  async function reloadAssignments() {
    const data = await getTeacherAssignmentsService();
    setAssignments(data);
  }

  function resetForm() {
    setFormData(initialFormData);
    setEditingAssignment(null);
  }

  function openCreateDialog() {
    resetForm();
    setError("");
    setSuccessMessage("");
    setOpenDialog(true);
  }

  function openEditDialog(assignment: TeacherAssignment) {
    setEditingAssignment(assignment);
    setError("");
    setSuccessMessage("");

    setFormData({
      profesorId: String(assignment.profesorId),
      asignaturaId: String(assignment.asignaturaId),
      gradoId: String(assignment.gradoId),
      seccionId: String(assignment.seccionId),
    });

    setOpenDialog(true);
  }

  function handleSelectChange(
    field: keyof TeacherAssignmentFormData,
    value: string | null,
  ) {
    if (value === null) {
      return;
    }

    setFormData((current) => {
      if (field === "gradoId") {
        return {
          ...current,
          gradoId: value,
          asignaturaId: "",
          seccionId: "",
        };
      }

      return {
        ...current,
        [field]: value,
      };
    });
  }

  function getTeacherLabel() {
    const teacher = teachers.find(
      (item) => String(item.id) === formData.profesorId,
    );

    if (!teacher) {
      return "Selecciona un profesor";
    }

    return `${teacher.nombres} ${teacher.apellidos}`;
  }

  function getGradeLabel() {
    const grade = grades.find((item) => String(item.id) === formData.gradoId);

    if (!grade) {
      return "Selecciona un grado";
    }

    const nivel = grade.nivel ?? "";

    return `${grade.nombre}${nivel ? ` - ${nivel}` : ""}`;
  }

  function getSubjectLabel() {
    const subject = subjects.find(
      (item) => String(item.id) === formData.asignaturaId,
    );

    if (!subject) {
      return "Selecciona una asignatura";
    }

    return `${subject.codigo} - ${subject.nombre}`;
  }

  function getSectionLabel() {
    const section = sections.find(
      (item) => String(item.id) === formData.seccionId,
    );

    if (!section) {
      return "Selecciona una sección";
    }

    return section.nombre;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      if (editingAssignment) {
        await updateTeacherAssignmentService(editingAssignment.id, formData);
        setSuccessMessage("Asignación actualizada correctamente.");
      } else {
        await createTeacherAssignmentService(formData);
        setSuccessMessage("Asignación registrada correctamente.");
      }

      await reloadAssignments();
      setOpenDialog(false);
      resetForm();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al guardar asignación.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(assignment: TeacherAssignment) {
    const confirmed = window.confirm(
      `¿Deseas desactivar la asignación de ${assignment.profesorNombre}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccessMessage("");

      await deactivateTeacherAssignmentService(assignment.id);
      setSuccessMessage("Asignación desactivada correctamente.");
      await reloadAssignments();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al desactivar asignación.",
      );
    }
  }

  const filteredAssignments = assignments.filter((item) => {
    const search = searchTerm.toLowerCase();
    const profesor = item.profesorNombre?.toLowerCase() || "";
    const asignatura = item.asignaturaNombre?.toLowerCase() || "";
    const codigo = item.asignaturaCodigo?.toLowerCase() || "";
    const grado = item.gradoNombre?.toLowerCase() || "";
    const seccion = item.seccionNombre?.toLowerCase() || "";

    return (
      profesor.includes(search) ||
      asignatura.includes(search) ||
      codigo.includes(search) ||
      grado.includes(search) ||
      seccion.includes(search)
    );
  });

  return (
    <div className="space-y-6 p-1">
      {/* Banner Principal */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 text-white shadow-lg border border-slate-800">
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-medium text-indigo-300 border border-indigo-500/30 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" /> Carga Docente
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">
              Asignaciones de Profesores
            </h2>
            <p className="text-sm text-slate-300 max-w-xl">
              Asociación de docentes con sus respectivas asignaturas, grados y secciones lectivas.
            </p>
          </div>

          <Button
            onClick={openCreateDialog}
            className="w-full md:w-auto rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nueva Asignación
          </Button>
        </div>
      </div>

      {/* Alertas */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300 shadow-sm animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300 shadow-sm animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Tarjeta de Tabla */}
      <Card className="border shadow-sm rounded-2xl overflow-hidden bg-card">
        <CardHeader className="bg-muted/20 pb-4 border-b">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Listado de Asignaciones
              </CardTitle>
              <CardDescription>
                Consulta, edición y desactivación de cargas docentes registradas.
              </CardDescription>
            </div>

            {/* Buscador Rápido */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por profesor, materia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 rounded-xl bg-background"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-3 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              <p className="text-sm font-medium">Cargando asignaciones...</p>
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <GraduationCap className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700 mb-3" />
              <p className="text-base font-semibold text-foreground">No se encontraron asignaciones</p>
              <p className="text-xs mt-1">
                {searchTerm
                  ? "Intenta buscar con otros términos."
                  : "Presiona 'Nueva Asignación' para crear la primera."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/10">
                  <TableRow>
                    <TableHead className="font-semibold">Profesor</TableHead>
                    <TableHead className="font-semibold">Asignatura</TableHead>
                    <TableHead className="font-semibold">Grado</TableHead>
                    <TableHead className="font-semibold">Sección</TableHead>
                    <TableHead className="font-semibold">Ciclo</TableHead>
                    <TableHead className="font-semibold">Estado</TableHead>
                    <TableHead className="text-right font-semibold">Acciones</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredAssignments.map((assignment) => (
                    <TableRow key={assignment.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-bold text-foreground">
                        {assignment.profesorNombre}
                      </TableCell>

                      <TableCell>
                        <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 mr-1.5">
                          [{assignment.asignaturaCodigo}]
                        </span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {assignment.asignaturaNombre}
                        </span>
                      </TableCell>

                      <TableCell className="font-medium text-foreground">
                        {assignment.gradoNombre}
                        {assignment.gradoNivel != null &&
                        assignment.gradoNivel !== ""
                          ? ` - ${assignment.gradoNivel}`
                          : ""}
                      </TableCell>

                      <TableCell>
                        <span className="inline-flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-semibold border border-slate-200 dark:border-slate-700">
                          Sección {assignment.seccionNombre}
                        </span>
                      </TableCell>

                      <TableCell className="text-xs font-medium text-muted-foreground">
                        {assignment.cicloEscolarAnio}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            assignment.estado === "ACTIVO"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900"
                              : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                          }
                        >
                          {assignment.estado}
                        </Badge>
                      </TableCell>

                      <TableCell className="space-x-2 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(assignment)}
                          className="rounded-xl border-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Pencil className="mr-1.5 h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                          Editar
                        </Button>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeactivate(assignment)}
                          disabled={assignment.estado !== "ACTIVO"}
                          className="rounded-xl disabled:opacity-40"
                        >
                          <UserX className="mr-1.5 h-3.5 w-3.5" />
                          Desactivar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo Modal de Registro/Edición */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-indigo-600" />
              {editingAssignment ? "Editar Asignación" : "Registrar Asignación"}
            </DialogTitle>
            <DialogDescription>
              Vincula un docente con su grado, asignatura y sección asignada.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {/* Campo Profesor */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Profesor
              </Label>
              <Select
                value={formData.profesorId}
                onValueChange={(value) =>
                  handleSelectChange("profesorId", value ?? "")
                }
              >
                <SelectTrigger className="w-full justify-between rounded-xl">
                  <span
                    className={
                      formData.profesorId
                        ? "truncate font-medium"
                        : "truncate text-muted-foreground"
                    }
                  >
                    {getTeacherLabel()}
                  </span>
                </SelectTrigger>

                <SelectContent
                  side="bottom"
                  align="start"
                  sideOffset={4}
                  className="z-[9999] rounded-xl shadow-xl max-h-60"
                >
                  {activeTeachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={String(teacher.id)}>
                      {teacher.nombres} {teacher.apellidos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Campo Grado */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Grado Académico
              </Label>
              <Select
                value={formData.gradoId}
                onValueChange={(value) => handleSelectChange("gradoId", value ?? "")}
              >
                <SelectTrigger className="w-full justify-between rounded-xl">
                  <span
                    className={
                      formData.gradoId
                        ? "truncate font-medium"
                        : "truncate text-muted-foreground"
                    }
                  >
                    {getGradeLabel()}
                  </span>
                </SelectTrigger>

                <SelectContent
                  side="bottom"
                  align="start"
                  sideOffset={4}
                  className="z-[9999] rounded-xl shadow-xl max-h-60"
                >
                  {activeGrades.map((grade) => (
                    <SelectItem key={grade.id} value={String(grade.id)}>
                      {grade.nombre}
                      {grade.nivel ? ` - ${grade.nivel}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Campo Asignatura */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Asignatura
              </Label>
              <Select
                value={formData.asignaturaId}
                onValueChange={(value) =>
                  handleSelectChange("asignaturaId", value ?? "")
                }
                disabled={!formData.gradoId}
              >
                <SelectTrigger className="w-full justify-between rounded-xl">
                  <span
                    className={
                      formData.asignaturaId
                        ? "truncate font-medium"
                        : "truncate text-muted-foreground"
                    }
                  >
                    {getSubjectLabel()}
                  </span>
                </SelectTrigger>

                <SelectContent
                  side="bottom"
                  align="start"
                  sideOffset={4}
                  className="z-[9999] rounded-xl shadow-xl max-h-60"
                >
                  {filteredSubjects.map((subject) => (
                    <SelectItem key={subject.id} value={String(subject.id)}>
                      {subject.codigo} - {subject.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Campo Sección */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Sección
              </Label>
              <Select
                value={formData.seccionId}
                onValueChange={(value) =>
                  handleSelectChange("seccionId", value ?? "")
                }
                disabled={!formData.gradoId}
              >
                <SelectTrigger className="w-full justify-between rounded-xl">
                  <span
                    className={
                      formData.seccionId
                        ? "truncate font-medium"
                        : "truncate text-muted-foreground"
                    }
                  >
                    {getSectionLabel()}
                  </span>
                </SelectTrigger>

                <SelectContent
                  side="bottom"
                  align="start"
                  sideOffset={4}
                  className="z-[9999] rounded-xl shadow-xl max-h-60"
                >
                  {filteredSections.map((section) => (
                    <SelectItem key={section.id} value={String(section.id)}>
                      Sección {section.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-3 gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenDialog(false)}
                className="rounded-xl"
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 font-semibold text-white shadow-md hover:from-blue-500 hover:to-indigo-500"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Guardando...
                  </span>
                ) : (
                  "Guardar Asignación"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}