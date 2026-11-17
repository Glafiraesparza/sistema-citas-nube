const prisma = require("../lib/prisma");

// Obtener todos los horarios
const obtenerHorarios = async (req, res) => {
  try {
    const horarios = await prisma.horario.findMany({
      include: {
        medico: true
      },
      orderBy: [
        {
          medicoId: "asc"
        },
        {
          diaSemana: "asc"
        },
        {
          horaInicio: "asc"
        }
      ]
    });

    res.status(200).json(horarios);

  } catch (error) {
    console.error("Error al obtener horarios:", error);

    res.status(500).json({
      mensaje: "Error al obtener los horarios"
    });
  }
};

// Obtener un horario por ID
const obtenerHorarioPorId = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const horario = await prisma.horario.findUnique({
      where: {
        id
      },
      include: {
        medico: true
      }
    });

    if (!horario) {
      return res.status(404).json({
        mensaje: "Horario no encontrado"
      });
    }

    res.status(200).json(horario);

  } catch (error) {
    console.error("Error al obtener horario:", error);

    res.status(500).json({
      mensaje: "Error al obtener el horario"
    });
  }
};

// Crear horario
const crearHorario = async (req, res) => {
  try {
    const { medicoId, diaSemana, horaInicio, horaFin } = req.body;

    if (
      !medicoId ||
      diaSemana === undefined ||
      !horaInicio ||
      !horaFin
    ) {
      return res.status(400).json({
        mensaje: "Todos los datos del horario son obligatorios"
      });
    }

    const medico = await prisma.medico.findUnique({
      where: {
        id: Number(medicoId)
      }
    });

    if (!medico) {
      return res.status(404).json({
        mensaje: "El médico no existe"
      });
    }

    const horario = await prisma.horario.create({
      data: {
        medicoId: Number(medicoId),
        diaSemana: Number(diaSemana),
        horaInicio,
        horaFin
      },
      include: {
        medico: true
      }
    });

    res.status(201).json({
      mensaje: "Horario creado correctamente",
      horario
    });

  } catch (error) {
    console.error("Error al crear horario:", error);

    res.status(500).json({
      mensaje: "Error al crear el horario"
    });
  }
};

// Actualizar horario
const actualizarHorario = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { diaSemana, horaInicio, horaFin } = req.body;

    const horario = await prisma.horario.update({
      where: {
        id
      },
      data: {
        diaSemana: Number(diaSemana),
        horaInicio,
        horaFin
      },
      include: {
        medico: true
      }
    });

    res.status(200).json({
      mensaje: "Horario actualizado correctamente",
      horario
    });

  } catch (error) {
    console.error("Error al actualizar horario:", error);

    res.status(500).json({
      mensaje: "Error al actualizar el horario"
    });
  }
};

// Eliminar horario
const eliminarHorario = async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.horario.delete({
      where: {
        id
      }
    });

    res.status(200).json({
      mensaje: "Horario eliminado correctamente"
    });

  } catch (error) {
    console.error("Error al eliminar horario:", error);

    res.status(500).json({
      mensaje: "Error al eliminar el horario"
    });
  }
};

module.exports = {
  obtenerHorarios,
  obtenerHorarioPorId,
  crearHorario,
  actualizarHorario,
  eliminarHorario
};