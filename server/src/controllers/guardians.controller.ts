import { Response } from "express";
import pool from "../db/pool";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

function cleanOptional(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const cleaned = value.trim();
  return cleaned === "" ? null : cleaned;
}

export async function getGuardians(_req: AuthenticatedRequest, res: Response) {
  try {
    const result = await pool.query(`
      SELECT
        id,
        dpi,
        nombres,
        apellidos,
        telefono,
        direccion,
        correo,
        usuario_id AS "usuarioId"
      FROM encargados
      ORDER BY id DESC
    `);

    return res.json({
      success: true,
      message: "Encargados obtenidos correctamente.",
      data: result.rows,
    });
  } catch (error) {
    console.error("Error al obtener encargados:", error);

    return res.status(500).json({
      success: false,
      message: "Error al obtener encargados.",
    });
  }
}

export async function createGuardian(req: AuthenticatedRequest, res: Response) {
  try {
    const { dpi, nombres, apellidos, telefono, direccion, correo } = req.body;

    if (!nombres || !apellidos) {
      return res.status(400).json({
        success: false,
        message: "Nombres y apellidos son obligatorios.",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO encargados
      (dpi, nombres, apellidos, telefono, direccion, correo)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id,
        dpi,
        nombres,
        apellidos,
        telefono,
        direccion,
        correo,
        usuario_id AS "usuarioId"
      `,
      [
        cleanOptional(dpi),
        nombres.trim(),
        apellidos.trim(),
        cleanOptional(telefono),
        cleanOptional(direccion),
        cleanOptional(correo),
      ],
    );

    return res.status(201).json({
      success: true,
      message: "Encargado registrado correctamente.",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error al crear encargado:", error);

    return res.status(500).json({
      success: false,
      message: "Error al registrar encargado.",
    });
  }
}

export async function updateGuardian(req: AuthenticatedRequest, res: Response) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de encargado inválido.",
      });
    }

    const { dpi, nombres, apellidos, telefono, direccion, correo } = req.body;

    if (!nombres || !apellidos) {
      return res.status(400).json({
        success: false,
        message: "Nombres y apellidos son obligatorios.",
      });
    }

    const result = await pool.query(
      `
      UPDATE encargados
      SET
        dpi = $1,
        nombres = $2,
        apellidos = $3,
        telefono = $4,
        direccion = $5,
        correo = $6
      WHERE id = $7
      RETURNING
        id,
        dpi,
        nombres,
        apellidos,
        telefono,
        direccion,
        correo,
        usuario_id AS "usuarioId"
      `,
      [
        cleanOptional(dpi),
        nombres.trim(),
        apellidos.trim(),
        cleanOptional(telefono),
        cleanOptional(direccion),
        cleanOptional(correo),
        id,
      ],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Encargado no encontrado.",
      });
    }

    return res.json({
      success: true,
      message: "Encargado actualizado correctamente.",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error al actualizar encargado:", error);

    return res.status(500).json({
      success: false,
      message: "Error al actualizar encargado.",
    });
  }
}

export async function deactivateGuardian(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de encargado inválido.",
      });
    }

    const result = await pool.query(
      `
      DELETE FROM encargados
      WHERE id = $1
      RETURNING
        id,
        dpi,
        nombres,
        apellidos,
        telefono,
        direccion,
        correo,
        usuario_id AS "usuarioId"
      `,
      [id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Encargado no encontrado.",
      });
    }

    return res.json({
      success: true,
      message: "Encargado eliminado correctamente.",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error al eliminar encargado:", error);

    return res.status(500).json({
      success: false,
      message: "Error al eliminar encargado.",
    });
  }
}