import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  FolderTree,
  Layers,
  Loader2,
  Pencil,
  Plus,
  Search,
  Sparkles,
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
import {
  createSectionService,
  deactivateSectionService,
  getSectionsService,
  updateSectionService,
} from "@/services/sections.service";
import type { Grade } from "@/types/grade";
import type { Section, SectionFormData } from "@/types/section";

const initialFormData: SectionFormData = {
  nombre: "",
  gradoId: "",
};

export function SectionsPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [formData, setFormData] = useState<SectionFormData>(initialFormData);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadInitialData() {
      try {
        const [sectionsData, gradesData] = await Promise.all([
          getSectionsService(),
          getGradesService(),
        ]);

        if (active) {
          setSections(sectionsData);
          setGrades(gradesData);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Error al cargar secciones."
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

  async function reloadSections() {
    const data = await getSectionsService();
    setSections(data);
  }

  function resetForm() {
    setFormData(initialFormData);
    setEditingSection(null);
  }

  function openCreateDialog() {
    resetForm();
    setError("");
    setSuccessMessage("");
    setOpenDialog(true);
  }

  function openEditDialog(section: Section) {
    setEditingSection(section);
    setError("");
    setSuccessMessage("");

    setFormData({
      nombre: section.nombre,
      gradoId: String(section.gradoId),
    });

    setOpenDialog(true);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleGradeChange(value: string | null) {
    setFormData((current) => ({
      ...current,
      gradoId: value ?? "",
    }));
  }

  function getSelectedGradeLabel() {
    const selectedGrade = grades.find(
      (grade) => String(grade.id) === formData.gradoId
    );

    if (!selectedGrade) {
      return "Selecciona un grado";
    }

    return `${selectedGrade.nombre}${selectedGrade.nivel ? ` - ${selectedGrade.nivel}` : ""}`;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      if (editingSection) {
        await updateSectionService(editingSection.id, formData);
        setSuccessMessage("Sección actualizada correctamente.");
      } else {
        await createSectionService(formData);
        setSuccessMessage("Sección registrada correctamente.");
      }

      await reloadSections();
      setOpenDialog(false);
      resetForm();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al guardar sección."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(section: Section) {
    const confirmed = window.confirm(
      `¿Deseas desactivar la sección ${section.nombre}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccessMessage("");

      await deactivateSectionService(section.id);
      setSuccessMessage("Sección desactivada correctamente.");
      await reloadSections();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al desactivar sección."
      );
    }
  }

  // Filtrado reactivo de secciones
  const filteredSections = sections.filter((sec) => {
    const search = searchTerm.toLowerCase();
    const nombre = sec.nombre?.toLowerCase() || "";
    const grado = sec.gradoNombre?.toLowerCase() || "";
    const nivel = sec.gradoNivel?.toLowerCase() || "";
    return (
      nombre.includes(search) ||
      grado.includes(search) ||
      nivel.includes(search)
    );
  });

  return (
    <div className="space-y-6 p-1">
      {/* Banner Principal */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 text-white shadow-lg border border-slate-800">
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-medium text-indigo-300 border border-indigo-500/30 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" /> Estructura Académica
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">
              Gestión de Secciones
            </h2>
            <p className="text-sm text-slate-300 max-w-xl">
              Administración de secciones asociadas a cada grado del colegio.
            </p>
          </div>

          <Button
            onClick={openCreateDialog}
            className="w-full md:w-auto rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nueva Sección
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
                <FolderTree className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Listado de Secciones
              </CardTitle>
              <CardDescription>
                Consulta, edición y desactivación de secciones registradas en el sistema.
              </CardDescription>
            </div>

            {/* Buscador Rápido */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar sección o grado..."
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
              <p className="text-sm font-medium">Cargando secciones...</p>
            </div>
          ) : filteredSections.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Layers className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700 mb-3" />
              <p className="text-base font-semibold text-foreground">No se encontraron secciones</p>
              <p className="text-xs mt-1">
                {searchTerm
                  ? "Intenta buscar con otros términos."
                  : "Presiona el botón de 'Nueva Sección' para crear la primera."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/10">
                  <TableRow>
                    <TableHead className="font-semibold">Sección</TableHead>
                    <TableHead className="font-semibold">Grado</TableHead>
                    <TableHead className="font-semibold">Nivel</TableHead>
                    <TableHead className="font-semibold">Estado</TableHead>
                    <TableHead className="text-right font-semibold">Acciones</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredSections.map((section) => (
                    <TableRow key={section.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-bold text-foreground">
                        <span className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-extrabold text-sm mr-2">
                          {section.nombre}
                        </span>
                      </TableCell>

                      <TableCell className="font-medium text-foreground">
                        {section.gradoNombre || "-"}
                      </TableCell>

                      <TableCell className="text-muted-foreground">
                        {section.gradoNivel || "-"}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            section.estado === "ACTIVO"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900"
                              : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                          }
                        >
                          {section.estado}
                        </Badge>
                      </TableCell>

                      <TableCell className="space-x-2 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(section)}
                          className="rounded-xl border-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Pencil className="mr-1.5 h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                          Editar
                        </Button>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeactivate(section)}
                          disabled={section.estado !== "ACTIVO"}
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
              <FolderTree className="h-5 w-5 text-indigo-600" />
              {editingSection ? "Editar Sección" : "Registrar Sección"}
            </DialogTitle>
            <DialogDescription>
              Selecciona el grado y define el identificador o nombre de la sección.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5 pt-2">
            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Nombre o Identificador de la Sección
              </Label>
              <Input
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej. A, B, C o Única"
                className="rounded-xl"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Grado Académico
              </Label>
              <Select
                value={formData.gradoId}
                onValueChange={handleGradeChange}
              >
                <SelectTrigger className="w-full justify-between rounded-xl">
                  <span
                    className={
                      formData.gradoId
                        ? "truncate font-medium"
                        : "truncate text-muted-foreground"
                    }
                  >
                    {getSelectedGradeLabel()}
                  </span>
                </SelectTrigger>

                <SelectContent
                  side="bottom"
                  align="start"
                  sideOffset={4}
                  className="z-[9999] rounded-xl shadow-xl"
                >
                  {grades
                    .filter(
                      (grade) =>
                        grade.estado === "ACTIVO" ||
                        String(grade.id) === formData.gradoId
                    )
                    .map((grade) => (
                      <SelectItem key={grade.id} value={String(grade.id)}>
                        {grade.nombre}
                        {grade.nivel ? ` - ${grade.nivel}` : ""}
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
                  "Guardar Sección"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}