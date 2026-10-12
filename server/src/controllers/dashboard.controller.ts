import { Response } from "express";
import pool from "../db/pool";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export async function getDashboardSummary(
  _req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const result = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM alumnos WHERE estado = 'ACTIVO') AS alumnos,
        (SELECT COUNT(*) FROM profesores WHERE estado = 'ACTIVO') AS profesores,
        (SELECT COUNT(*) FROM encargados) AS encargados,
        (SELECT COUNT(*) FROM grados WHERE estado = 'ACTIVO') AS grados,
        (SELECT COUNT(*) FROM secciones WHERE estado = 'ACTIVO') AS secciones,
        (SELECT COUNT(*) FROM asignaturas WHERE estado = 'ACTIVO') AS asignaturas,
        (SELECT COUNT(*) FROM inscripciones WHERE estado = 'INSCRITO') AS inscripciones,
        (SELECT COUNT(*) FROM notas) AS notas
    `);

    return res.json({
      success: true,
      message: "Resumen del dashboard obtenido correctamente.",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error al obtener resumen del dashboard:", error);

    return res.status(500).json({
      success: false,
      message: "Error al obtener resumen del dashboard.",
    });
  }
}
