import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Pencil,
  Plus,
  XCircle,
  AlertCircle,
  CheckCircle2,
  FileCheck2,
  Award,
  BookOpen,
  Sparkles,
  Search,
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
import { getStoredUser } from "@/services/auth.service";
import { getEnrollmentsService } from "@/services/enrollments.service";
import {
  annulNoteService,
  createNoteService,
  getNotesService,
  updateNoteService,
} from "@/services/notes.service";
import { getTeacherAssignmentsService } from "@/services/teacherAssignments.service";
import type { Enrollment } from "@/types/enrollment";
import type { AcademicNote, NoteFormData } from "@/types/note";
import type { TeacherAssignment } from "@/types/teacherAssignment";

const initialFormData: NoteFormData = {
  alumnoId: "",
  asignacionId: "",
  asignaturaId: "",
  profesorId: "",
  unidad: "",
  nota: "",
};

const units = ["Unidad 1", "Unidad 2", "Unidad 3", "Unidad 4", "Recuperación"];

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

export function NotesPage() {
  const [notes, setNotes] = useState<AcademicNote[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingNote, setEditingNote] = useState<AcademicNote | null>(null);
  const [formData, setFormData] = useState<NoteFormData>(initialFormData);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const user = getStoredUser();
  const userRole = user?.rol ?? "";
  const canManageNotes = userRole === "ADMIN" || userRole === "PROFESOR_DIRECTOR";

  const activeEnrollments = useMemo(
    () => enrollments.filter((e) => e.estado === "INSCRITO"),
    [enrollments],
  );

  const selectedEnrollment = useMemo(
    () => activeEnrollments.find((e) => String(e.alumnoId) === formData.alumnoId),
    [activeEnrollments, formData.alumnoId],
  );

  const filteredAssignments = useMemo(() => {
    if (!selectedEnrollment) return [];
    return assignments.filter(
      (a) =>
        a.estado === "ACTIVO" &&
        a.gradoId === selectedEnrollment.gradoId &&
        a.seccionId === selectedEnrollment.seccionId,
    );
  }, [assignments, selectedEnrollment]);

  useEffect(() => {
    let active = true;

    async function loadInitialData() {
      try {
        if (canManageNotes) {
          const [notesData, enrollmentsData, assignmentsData] = await Promise.all([
            getNotesService(),
            getEnrollmentsService(),
            getTeacherAssignmentsService(),
          ]);
          if (active) {
            setNotes(Array.isArray(notesData) ? notesData : []);
            setEnrollments(Array.isArray(enrollmentsData) ? enrollmentsData : []);
            setAssignments(Array.isArray(assignmentsData) ? assignmentsData : []);
          }
        } else {
          const notesData = await getNotesService();
          if (active) setNotes(Array.isArray(notesData) ? notesData : []);
        }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Error al cargar notas.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadInitialData();
    return () => { active = false; };
  }, [canManageNotes]);

  async function reloadNotes() {
    const data = await getNotesService();
    setNotes(Array.isArray(data) ? data : []);
  }

  const filteredNotes = useMemo(() => {
    if (!searchTerm.trim()) return notes;
    const term = searchTerm.toLowerCase();
    return notes.filter(
      (n) =>
        (n.alumnoNombre ?? "").toLowerCase().includes(term) ||
        (n.alumnoCodigo ?? "").toLowerCase().includes(term) ||
        (n.asignaturaNombre ?? "").toLowerCase().includes(term) ||
        (n.unidad ?? "").toLowerCase().includes(term)
    );
  }, [notes, searchTerm]);

  const stats = useMemo(() => {
    const total = notes.length;
    const activas = notes.filter((n) => n.estado === "ACTIVO");
    const promedio = activas.length
      ? (activas.reduce((acc, curr) => acc + Number(curr.nota), 0) / activas.length).toFixed(1)
      : "0";
    const aprobadas = activas.filter((n) => Number(n.nota) >= 60).length;
    return { total, promedio, aprobadas };
  }, [notes]);

  function resetForm() {
    setFormData(initialFormData);
    setEditingNote(null);
  }

  function openCreateDialog() {
    resetForm();
    setError("");
    setSuccessMessage("");
    setOpenDialog(true);
  }

  function openEditDialog(note: AcademicNote) {
    setEditingNote(note);
    setError("");
    setSuccessMessage("");

    const assignment = assignments.find(
      (item) => item.profesorId === note.profesorId && item.asignaturaId === note.asignaturaId,
    );

    setFormData({
      alumnoId: String(note.alumnoId),
      asignacionId: assignment ? String(assignment.id) : "",
      asignaturaId: String(note.asignaturaId),
      profesorId: String(note.profesorId),
      unidad: note.unidad,
      nota: String(note.nota),
    });

    setOpenDialog(true);
  }

  function handleSelectChange(field: keyof NoteFormData, value: string) {
    setFormData((current) => {
      if (field === "alumnoId") {
        return { ...current, alumnoId: value, asignacionId: "", asignaturaId: "", profesorId: "" };
      }
      if (field === "asignacionId") {
        const selectedAssignment = assignments.find((a) => String(a.id) === value);
        return {
          ...current,
          asignacionId: value,
          asignaturaId: selectedAssignment ? String(selectedAssignment.asignaturaId) : "",
          profesorId: selectedAssignment ? String(selectedAssignment.profesorId) : "",
        };
      }
      return { ...current, [field]: value };
    });
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      if (editingNote) {
        await updateNoteService(editingNote.id, formData);
        setSuccessMessage("Nota actualizada correctamente.");
      } else {
        await createNoteService(formData);
        setSuccessMessage("Nota registrada correctamente.");
      }

      await reloadNotes();
      setOpenDialog(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar nota.");
    } finally {
      setSaving(false);
    }
  }

  async function handleAnnul(note: AcademicNote) {
    if (!window.confirm(`¿Deseas anular la nota de ${note.alumnoNombre}?`)) return;

    try {
      setError("");
      setSuccessMessage("");
      await annulNoteService(note.id);
      setSuccessMessage("Nota anulada correctamente.");
      await reloadNotes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al anular nota.");
    }
  }

  return (
    <div className="space-y-6 p-1">
      {/* Banner Principal Estilo Dashboard */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-500 via-pink-600 to-purple-600 p-6 text-white shadow-lg">
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" /> Calificaciones Académicas
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">Registro de Notas</h2>
            <p className="text-sm text-pink-100 max-w-xl">
              Control, ingreso y consulta detallada del rendimiento escolar por unidad evaluativa.
            </p>
          </div>
          {canManageNotes && (
            <Button
              onClick={openCreateDialog}
              className="bg-white text-pink-700 hover:bg-pink-50 font-semibold shadow-md transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="mr-2 h-4 w-4" /> Nueva Nota
            </Button>
          )}
        </div>
      </div>

      <FeedbackAlert error={error} success={successMessage} />

      {/* Tarjetas Resumen */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-0 shadow-sm relative overflow-hidden bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Evaluaciones</p>
              <h3 className="text-3xl font-bold mt-1">{stats.total}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Notas ingresadas</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
              <FileCheck2 className="h-6 w-6" />
            </div>
          </CardContent>
          <div className="h-1.5 w-full bg-rose-500" />
        </Card>

        <Card className="border-0 shadow-sm relative overflow-hidden bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Promedio General</p>
              <h3 className="text-3xl font-bold mt-1 text-indigo-600">{stats.promedio} pts</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Rendimiento activo global</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Award className="h-6 w-6" />
            </div>
          </CardContent>
          <div className="h-1.5 w-full bg-indigo-500" />
        </Card>

        <Card className="border-0 shadow-sm relative overflow-hidden bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Notas Aprobadas</p>
              <h3 className="text-3xl font-bold mt-1 text-emerald-600">{stats.aprobadas}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Punteos igual o mayor a 60</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <BookOpen className="h-6 w-6" />
            </div>
          </CardContent>
          <div className="h-1.5 w-full bg-emerald-500" />
        </Card>
      </div>

      {/* Tabla Principal */}
      <Card className="border shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="flex flex-col gap-4 space-y-0 md:flex-row md:items-center md:justify-between bg-card pb-4">
          <div>
            <CardTitle className="text-lg font-bold">Listado de Notas</CardTitle>
            <CardDescription>
              Mostrando {filteredNotes.length} calificación(es) registrada(s)
            </CardDescription>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por alumno, materia o unidad..."
              className="pl-9 rounded-xl border-muted bg-muted/30 focus-visible:bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              Cargando libreta de notas...
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              No hay calificaciones registradas que coincidan.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="font-semibold">Alumno</TableHead>
                    <TableHead className="font-semibold">Asignatura</TableHead>
                    <TableHead className="hidden md:table-cell font-semibold">Profesor</TableHead>
                    <TableHead className="font-semibold">Unidad</TableHead>
                    <TableHead className="font-semibold">Punteo</TableHead>
                    <TableHead className="hidden sm:table-cell font-semibold">Ciclo</TableHead>
                    <TableHead className="font-semibold">Estado</TableHead>
                    {canManageNotes && <TableHead className="text-right font-semibold">Acciones</TableHead>}
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredNotes.map((note) => {
                    const notaNum = Number(note.nota);
                    const esAprobada = notaNum >= 60;

                    return (
                      <TableRow key={note.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium text-foreground">
                          <div>{note.alumnoNombre}</div>
                          <div className="text-xs text-muted-foreground font-mono">{note.alumnoCodigo}</div>
                        </TableCell>

                        <TableCell>
                          <div className="font-medium">{note.asignaturaNombre}</div>
                          <div className="text-xs text-muted-foreground font-mono">{note.asignaturaCodigo}</div>
                        </TableCell>

                        <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                          {note.profesorNombre}
                        </TableCell>

                        <TableCell>
                          <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {note.unidad}
                          </span>
                        </TableCell>

                        <TableCell>
                          <span
                            className={`inline-flex items-center font-mono font-extrabold text-sm px-2.5 py-0.5 rounded-md ${
                              esAprobada
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                                : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
                            }`}
                          >
                            {notaNum.toFixed(2)} pts
                          </span>
                        </TableCell>

                        <TableCell className="hidden sm:table-cell text-xs font-medium text-muted-foreground">
                          {note.cicloEscolarAnio}
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant={note.estado === "ACTIVO" ? "default" : "secondary"}
                            className={
                              note.estado === "ACTIVO"
                                ? "bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200 dark:bg-blue-950 dark:text-blue-300"
                                : ""
                            }
                          >
                            {note.estado}
                          </Badge>
                        </TableCell>

                        {canManageNotes && (
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950"
                                onClick={() => openEditDialog(note)}
                                disabled={note.estado !== "ACTIVO"}
                              >
                                <Pencil className="mr-1 h-3.5 w-3.5" /> Editar
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950"
                                onClick={() => handleAnnul(note)}
                                disabled={note.estado !== "ACTIVO"}
                              >
                                <XCircle className="mr-1 h-3.5 w-3.5" /> Anular
                              </Button>
                            </div>
                          </TableCell>
                        )}
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
      {canManageNotes && (
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="sm:max-w-lg rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {editingNote ? "Editar Nota" : "Registrar Nota"}
              </DialogTitle>
              <DialogDescription>
                Selecciona al estudiante, la asignatura y la unidad evaluada.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Alumno *</Label>
                <Select
                  value={formData.alumnoId}
                  onValueChange={(value) => handleSelectChange("alumnoId", value)}
                >
                  <SelectTrigger className="w-full rounded-xl">
                    <SelectValue placeholder="Selecciona un alumno" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeEnrollments.map((enrollment) => (
                      <SelectItem key={enrollment.id} value={String(enrollment.alumnoId)}>
                        {enrollment.alumnoCodigo} - {enrollment.alumnoNombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Asignatura / Profesor *</Label>
                <Select
                  value={formData.asignacionId}
                  onValueChange={(value) => handleSelectChange("asignacionId", value)}
                  disabled={!formData.alumnoId}
                >
                  <SelectTrigger className="w-full rounded-xl">
                    <SelectValue
                      placeholder={
                        formData.alumnoId
                          ? "Selecciona asignatura y profesor"
                          : "Primero selecciona un alumno"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredAssignments.map((assignment) => (
                      <SelectItem key={assignment.id} value={String(assignment.id)}>
                        {assignment.asignaturaCodigo} - {assignment.asignaturaNombre} | {assignment.profesorNombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Unidad *</Label>
                <Select
                  value={formData.unidad}
                  onValueChange={(value) => handleSelectChange("unidad", value)}
                >
                  <SelectTrigger className="w-full rounded-xl">
                    <SelectValue placeholder="Selecciona una unidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nota">Calificación / Nota *</Label>
                <Input
                  id="nota"
                  name="nota"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.nota}
                  onChange={handleInputChange}
                  placeholder="Ej: 85"
                  className="rounded-xl font-mono text-base"
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

                <Button type="submit" disabled={saving} className="rounded-xl bg-pink-600 hover:bg-pink-700">
                  {saving ? "Guardando..." : "Guardar Nota"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}