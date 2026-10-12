import { Response } from "express";
import pool from "../db/pool";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

async function getActiveSchoolYearId() {
  const result = await pool.query(
    "SELECT id FROM ciclos_escolares WHERE estado = 'ACTIVO' ORDER BY anio DESC LIMIT 1",
  );

  if (result.rowCount === 0) {
    throw new Error("No existe un ciclo escolar activo.");
  }

  return result.rows[0].id as number;
}

async function validateNoteContext(
  alumnoId: number,
  asignaturaId: number,
  profesorId: number,
  cicloEscolarId: number,
) {
  const enrollmentResult = await pool.query(
    `
    SELECT grado_id, seccion_id
    FROM inscripciones
    WHERE alumno_id = $1
    AND ciclo_escolar_id = $2
    AND estado = 'INSCRITO'
    `,
    [alumnoId, cicloEscolarId],
  );

  if (enrollmentResult.rowCount === 0) {
    return {
      valid: false,
      message: "El alumno no se encuentra inscrito en el ciclo escolar activo.",
    };
  }

  const enrollment = enrollmentResult.rows[0];

  const assignmentResult = await pool.query(
    `
    SELECT id
    FROM asignaciones_profesor
    WHERE profesor_id = $1
    AND asignatura_id = $2
    AND grado_id = $3
    AND seccion_id = $4
    AND ciclo_escolar_id = $5
    AND estado = 'ACTIVO'
    `,
    [
      profesorId,
      asignaturaId,
      enrollment.grado_id,
      enrollment.seccion_id,
      cicloEscolarId,
    ],
  );

  if (assignmentResult.rowCount === 0) {
    return {
      valid: false,
      message:
        "El profesor no tiene asignada esa asignatura para el grado y sección del alumno.",
    };
  }

  return {
    valid: true,
    message: "Contexto válido.",
  };
}

export async function getNotes(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.rol;

    if (!userId || !userRole) {
      return res.status(401).json({
        success: false,
        message: "Usuario no autenticado.",
      });
    }

    let extraJoin = "";
    let whereClause = "";
    const params: unknown[] = [];

    if (userRole === "ALUMNO") {
      whereClause = `WHERE al.usuario_id = $1`;
      params.push(userId);
    }

    if (userRole === "PADRE_ENCARGADO") {
      extraJoin = `
        INNER JOIN alumno_encargado ae ON ae.alumno_id = al.id
        INNER JOIN encargados e ON e.id = ae.encargado_id
      `;
      whereClause = `WHERE e.usuario_id = $1`;
      params.push(userId);
    }

    const result = await pool.query(
      `
      SELECT DISTINCT
        n.id,
        n.alumno_id AS "alumnoId",
        al.codigo AS "alumnoCodigo",
        al.nombres || ' ' || al.apellidos AS "alumnoNombre",
        n.asignatura_id AS "asignaturaId",
        a.codigo AS "asignaturaCodigo",
        a.nombre AS "asignaturaNombre",
        n.profesor_id AS "profesorId",
        p.nombres || ' ' || p.apellidos AS "profesorNombre",
        n.ciclo_escolar_id AS "cicloEscolarId",
        ce.anio AS "cicloEscolarAnio",
        n.unidad,
        n.nota,
        n.fecha_registro AS "fechaRegistro"
      FROM notas n
      INNER JOIN alumnos al ON al.id = n.alumno_id
      INNER JOIN asignaturas a ON a.id = n.asignatura_id
      INNER JOIN profesores p ON p.id = n.profesor_id
      INNER JOIN ciclos_escolares ce ON ce.id = n.ciclo_escolar_id
      ${extraJoin}
      ${whereClause}
      ORDER BY n.id DESC
      `,
      params,
    );

    return res.json({
      success: true,
      message: "Notas obtenidas correctamente.",
      data: result.rows,
    });
  } catch (error) {
    console.error("Error al obtener notas:", error);

    return res.status(500).json({
      success: false,
      message: "Error al obtener notas.",
    });
  }
}

export async function createNote(req: AuthenticatedRequest, res: Response) {
  try {
    const { alumnoId, asignaturaId, profesorId, unidad, nota } = req.body;

    if (!alumnoId || !asignaturaId || !profesorId || !unidad || nota === "") {
      return res.status(400).json({
        success: false,
        message:
          "Alumno, asignatura, profesor, unidad y nota son obligatorios.",
      });
    }

    const notaNumerica = Number(nota);

    if (Number.isNaN(notaNumerica) || notaNumerica < 0 || notaNumerica > 100) {
      return res.status(400).json({
        success: false,
        message: "La nota debe estar en el rango de 0 a 100.",
      });
    }

    const cicloEscolarId = await getActiveSchoolYearId();

    const validation = await validateNoteContext(
      Number(alumnoId),
      Number(asignaturaId),
      Number(profesorId),
      cicloEscolarId,
    );

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    const result = await pool.query(
      `
      INSERT INTO notas
      (alumno_id, asignatura_id, profesor_id, ciclo_escolar_id, unidad, nota)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id,
        alumno_id AS "alumnoId",
        asignatura_id AS "asignaturaId",
        profesor_id AS "profesorId",
        ciclo_escolar_id AS "cicloEscolarId",
        unidad,
        nota,
        fecha_registro AS "fechaRegistro"
      `,
      [
        Number(alumnoId),
        Number(asignaturaId),
        Number(profesorId),
        cicloEscolarId,
        String(unidad).trim(),
        notaNumerica,
      ],
    );

    return res.status(201).json({
      success: true,
      message: "Nota registrada correctamente.",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error al crear nota:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Ya existe una nota para ese alumno, asignatura, unidad y ciclo escolar.",
      });
    }

    if (
      error instanceof Error &&
      error.message === "No existe un ciclo escolar activo."
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al registrar nota.",
    });
  }
}

export async function updateNote(req: AuthenticatedRequest, res: Response) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de nota inválido.",
      });
    }

    const { alumnoId, asignaturaId, profesorId, unidad, nota } = req.body;

    if (!alumnoId || !asignaturaId || !profesorId || !unidad || nota === "") {
      return res.status(400).json({
        success: false,
        message:
          "Alumno, asignatura, profesor, unidad y nota son obligatorios.",
      });
    }

    const notaNumerica = Number(nota);

    if (Number.isNaN(notaNumerica) || notaNumerica < 0 || notaNumerica > 100) {
      return res.status(400).json({
        success: false,
        message: "La nota debe estar en el rango de 0 a 100.",
      });
    }

    const cicloEscolarId = await getActiveSchoolYearId();

    const validation = await validateNoteContext(
      Number(alumnoId),
      Number(asignaturaId),
      Number(profesorId),
      cicloEscolarId,
    );

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    const result = await pool.query(
      `
      UPDATE notas
      SET
        alumno_id = $1,
        asignatura_id = $2,
        profesor_id = $3,
        unidad = $4,
        nota = $5
      WHERE id = $6
      RETURNING
        id,
        alumno_id AS "alumnoId",
        asignatura_id AS "asignaturaId",
        profesor_id AS "profesorId",
        ciclo_escolar_id AS "cicloEscolarId",
        unidad,
        nota,
        fecha_registro AS "fechaRegistro"
      `,
      [
        Number(alumnoId),
        Number(asignaturaId),
        Number(profesorId),
        String(unidad).trim(),
        notaNumerica,
        id,
      ],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Nota no encontrada.",
      });
    }

    return res.json({
      success: true,
      message: "Nota actualizada correctamente.",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error al actualizar nota:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Ya existe una nota para ese alumno, asignatura, unidad y ciclo escolar.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al actualizar nota.",
    });
  }
}

export async function annulNote(req: AuthenticatedRequest, res: Response) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de nota inválido.",
      });
    }

    const result = await pool.query(
      `
      DELETE FROM notas
      WHERE id = $1
      RETURNING
        id,
        alumno_id AS "alumnoId",
        asignatura_id AS "asignaturaId",
        profesor_id AS "profesorId",
        ciclo_escolar_id AS "cicloEscolarId",
        unidad,
        nota,
        fecha_registro AS "fechaRegistro"
      `,
      [id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Nota no encontrada.",
      });
    }

    return res.json({
      success: true,
      message: "Nota eliminada correctamente.",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error al anular nota:", error);

    return res.status(500).json({
      success: false,
      message: "Error al anular nota.",
    });
  }
}