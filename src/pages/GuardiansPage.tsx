import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from "react";
import {
  Pencil,
  Plus,
  Power,
  Search,
  UserCheck,
  UserX,
  Users,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Mail,
  Phone,
  MapPin,
  CreditCard,
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
  createGuardianService,
  deactivateGuardianService,
  getGuardiansService,
  updateGuardianService,
} from "@/services/guardians.service";
import type { Guardian, GuardianFormData } from "@/types/guardian";

const initialFormData: GuardianFormData = {
  dpi: "",
  nombres: "",
  apellidos: "",
  telefono: "",
  direccion: "",
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

export function GuardiansPage() {
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingGuardian, setEditingGuardian] = useState<Guardian | null>(null);
  const [formData, setFormData] = useState<GuardianFormData>(initialFormData);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function loadGuardians() {
    try {
      const data = await getGuardiansService();
      setGuardians(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar encargados.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    async function loadInitialGuardians() {
      try {
        const data = await getGuardiansService();
        if (active) {
          setGuardians(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Error al cargar encargados.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadInitialGuardians();

    return () => {
      active = false;
    };
  }, []);

  const filteredGuardians = useMemo(() => {
    if (!searchTerm.trim()) return guardians;
    const term = searchTerm.toLowerCase();
    return guardians.filter(
      (g) =>
        (g.nombres ?? "").toLowerCase().includes(term) ||
        (g.apellidos ?? "").toLowerCase().includes(term) ||
        (g.dpi ?? "").toLowerCase().includes(term) ||
        (g.correo ?? "").toLowerCase().includes(term) ||
        (g.telefono ?? "").toLowerCase().includes(term)
    );
  }, [guardians, searchTerm]);

  const stats = useMemo(() => {
    const total = guardians.length;
    const activos = guardians.filter((g) => g.estado === "ACTIVO").length;
    const inactivos = total - activos;
    return { total, activos, inactivos };
  }, [guardians]);

  function resetForm() {
    setFormData(initialFormData);
    setEditingGuardian(null);
  }

  function openCreateDialog() {
    resetForm();
    setError("");
    setSuccessMessage("");
    setOpenDialog(true);
  }

  function openEditDialog(guardian: Guardian) {
    setEditingGuardian(guardian);
    setError("");
    setSuccessMessage("");

    setFormData({
      dpi: guardian.dpi || "",
      nombres: guardian.nombres,
      apellidos: guardian.apellidos,
      telefono: guardian.telefono || "",
      direccion: guardian.direccion || "",
      correo: guardian.correo || "",
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

      if (editingGuardian) {
        await updateGuardianService(editingGuardian.id, formData);
        setSuccessMessage("Encargado actualizado correctamente.");
      } else {
        await createGuardianService(formData);
        setSuccessMessage("Encargado registrado correctamente.");
      }

      await loadGuardians();
      setOpenDialog(false);
      resetForm();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al guardar encargado.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(guardian: Guardian) {
    const confirmed = window.confirm(
      `¿Deseas desactivar a ${guardian.nombres} ${guardian.apellidos}?`,
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccessMessage("");
      await deactivateGuardianService(guardian.id);
      setSuccessMessage("Encargado desactivado correctamente.");
      await loadGuardians();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al desactivar encargado.",
      );
    }
  }

  return (
    <div className="space-y-6 p-1">
      {/* Banner Principal */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-700 p-6 text-white shadow-lg">
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" /> Comunidad Educativa
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">Padres y Encargados</h2>
            <p className="text-sm text-cyan-100 max-w-xl">
              Administración de información de contacto, identificación (DPI) y vinculación con los estudiantes.
            </p>
          </div>
          <Button
            onClick={openCreateDialog}
            className="bg-white text-teal-800 hover:bg-cyan-50 font-semibold shadow-md transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="mr-2 h-4 w-4" /> Nuevo Encargado
          </Button>
        </div>
      </div>

      <FeedbackAlert error={error} success={successMessage} />

      {/* Tarjetas de Métricas Rápidas */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-0 shadow-sm relative overflow-hidden bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Encargados</p>
              <h3 className="text-3xl font-bold mt-1">{stats.total}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Padres o tutores registrados</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400">
              <Users className="h-6 w-6" />
            </div>
          </CardContent>
          <div className="h-1.5 w-full bg-teal-500" />
        </Card>

        <Card className="border-0 shadow-sm relative overflow-hidden bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Activos</p>
              <h3 className="text-3xl font-bold mt-1 text-emerald-600">{stats.activos}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">En comunicación activa</p>
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
              <p className="text-xs text-muted-foreground mt-0.5">Sin estudiantes asociados</p>
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
            <CardTitle className="text-lg font-bold">Listado de Encargados</CardTitle>
            <CardDescription>
              Mostrando {filteredGuardians.length} encargado(s)
            </CardDescription>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nombre, DPI, teléfono..."
              className="pl-9 rounded-xl border-muted bg-muted/30 focus-visible:bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              Cargando encargados...
            </div>
          ) : filteredGuardians.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              No se encontraron encargados registrados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="font-semibold">DPI</TableHead>
                    <TableHead className="font-semibold">Nombre Completo</TableHead>
                    <TableHead className="font-semibold">Contacto</TableHead>
                    <TableHead className="font-semibold">Dirección</TableHead>
                    <TableHead className="font-semibold">Estado</TableHead>
                    <TableHead className="text-right font-semibold">Acciones</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredGuardians.map((guardian) => (
                    <TableRow key={guardian.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium text-foreground">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <CreditCard className="h-3.5 w-3.5" />
                          <span>{guardian.dpi || "-"}</span>
                        </div>
                      </TableCell>

                      <TableCell className="font-semibold">
                        {guardian.nombres} {guardian.apellidos}
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col gap-1 text-xs">
                          {guardian.telefono && (
                            <span className="flex items-center gap-1 text-foreground">
                              <Phone className="h-3 w-3 text-teal-600" />
                              {guardian.telefono}
                            </span>
                          )}
                          {guardian.correo && (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Mail className="h-3 w-3 text-cyan-600" />
                              {guardian.correo}
                            </span>
                          )}
                          {!guardian.telefono && !guardian.correo && (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                        {guardian.direccion ? (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                            <span className="truncate">{guardian.direccion}</span>
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={guardian.estado === "ACTIVO" ? "default" : "secondary"}
                          className={
                            guardian.estado === "ACTIVO"
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
                              : ""
                          }
                        >
                          {guardian.estado}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-teal-50 hover:text-teal-600 dark:hover:bg-teal-950"
                            onClick={() => openEditDialog(guardian)}
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950"
                            onClick={() => handleDeactivate(guardian)}
                            disabled={guardian.estado !== "ACTIVO"}
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

      {/* Modal Formulario */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingGuardian ? "Editar Encargado" : "Registrar Encargado"}
            </DialogTitle>
            <DialogDescription>
              Completa los datos personales y de contacto del tutor legal.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dpi">DPI / Documento de Identificación</Label>
                <Input
                  id="dpi"
                  name="dpi"
                  value={formData.dpi}
                  onChange={handleChange}
                  placeholder="0000 00000 0000"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono de Contacto</Label>
                <Input
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="5555-5555"
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
                  placeholder="Carlos Antonio"
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

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="correo">Correo Electrónico</Label>
                <Input
                  id="correo"
                  name="correo"
                  type="email"
                  value={formData.correo}
                  onChange={handleChange}
                  placeholder="encargado@correo.com"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="direccion">Dirección Domiciliar</Label>
                <Textarea
                  id="direccion"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  placeholder="Dirección del encargado"
                  className="rounded-xl min-h-[80px]"
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

              <Button type="submit" disabled={saving} className="rounded-xl bg-teal-600 hover:bg-teal-700">
                {saving ? "Guardando..." : "Guardar Encargado"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}