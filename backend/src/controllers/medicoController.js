const prisma = require("../lib/prisma");

// Obtener todos los médicos
const obtenerMedicos = async (req, res) => {
  try {
    const medicos = await prisma.medico.findMany({
      orderBy: {
        nombre: "asc"
      }
    });

    res.status(200).json(medicos);

  } catch (error) {
    console.error("Error al obtener médicos:", error);

    res.status(500).json({
      mensaje: "Error al obtener los médicos"
    });
  }
};

// Obtener un médico
const obtenerMedicoPorId = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const medico = await prisma.medico.findUnique({
      where: {
        id
      }
    });

    if (!medico) {
      return res.status(404).json({
        mensaje: "Médico no encontrado"
      });
    }

    res.status(200).json(medico);

  } catch (error) {
    console.error("Error al obtener médico:", error);

    res.status(500).json({
      mensaje: "Error al obtener el médico"
    });
  }
};

// Crear médico
const crearMedico = async (req, res) => {
  try {
    const { nombre, telefono } = req.body;

    if (!nombre) {
      return res.status(400).json({
        mensaje: "El nombre es obligatorio"
      });
    }

    const medico = await prisma.medico.create({
      data: {
        nombre,
        telefono
      }
    });

    res.status(201).json({
      mensaje: "Médico creado correctamente",
      medico
    });

  } catch (error) {
    console.error("Error al crear médico:", error);

    res.status(500).json({
      mensaje: "Error al crear el médico"
    });
  }
};

// Actualizar médico
const actualizarMedico = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { nombre, telefono } = req.body;

    const medico = await prisma.medico.update({
      where: {
        id
      },
      data: {
        nombre,
        telefono
      }
    });

    res.status(200).json({
      mensaje: "Médico actualizado correctamente",
      medico
    });

  } catch (error) {
    console.error("Error al actualizar médico:", error);

    res.status(500).json({
      mensaje: "Error al actualizar el médico"
    });
  }
};

// Eliminar médico
const eliminarMedico = async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.medico.delete({
      where: {
        id
      }
    });

    res.status(200).json({
      mensaje: "Médico eliminado correctamente"
    });

  } catch (error) {
    console.error("Error al eliminar médico:", error);

    res.status(500).json({
      mensaje: "Error al eliminar el médico"
    });
  }
};

module.exports = {
  obtenerMedicos,
  obtenerMedicoPorId,
  crearMedico,
  actualizarMedico,
  eliminarMedico
};