const prisma = require("../lib/prisma");

// Obtener todos los pacientes
const obtenerPacientes = async (req, res) => {
  try {
    let where = {};

    // Si es paciente, solo puede consultar su propio registro
    if (req.usuario.rol === "PACIENTE") {
      const paciente = await prisma.paciente.findUnique({
        where: {
          usuarioId: req.usuario.id
        }
      });

      if (!paciente) {
        return res.status(404).json({
          mensaje: "El paciente no está registrado"
        });
      }

      where = {
        id: paciente.id
      };
    }

    const pacientes = await prisma.paciente.findMany({
      where,
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true
          }
        }
      },
      orderBy: {
        id: "asc"
      }
    });

    res.status(200).json(pacientes);

  } catch (error) {
    console.error("Error al obtener pacientes:", error);

    res.status(500).json({
      mensaje: "Error al obtener los pacientes"
    });
  }
};

// Obtener un paciente por ID
const obtenerPacientePorId = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const paciente = await prisma.paciente.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true
          }
        }
      }
    });

    if (!paciente) {
      return res.status(404).json({
        mensaje: "Paciente no encontrado"
      });
    }

    // Un paciente solo puede consultar su propio registro
    if (
      req.usuario.rol === "PACIENTE" &&
      paciente.usuario.id !== req.usuario.id
    ) {
      return res.status(403).json({
        mensaje: "No puedes consultar los datos de otro paciente"
      });
    }

    res.status(200).json(paciente);

  } catch (error) {
    console.error("Error al obtener paciente:", error);

    res.status(500).json({
      mensaje: "Error al obtener el paciente"
    });
  }
};

// Crear paciente
const crearPaciente = async (req, res) => {
  try {
    const { usuarioId, telefono, fechaNacimiento } = req.body;

    if (!usuarioId) {
      return res.status(400).json({
        mensaje: "El usuarioId es obligatorio"
      });
    }

    const usuario = await prisma.usuario.findUnique({
      where: {
        id: Number(usuarioId)
      }
    });

    if (!usuario) {
      return res.status(404).json({
        mensaje: "El usuario no existe"
      });
    }

    const pacienteExistente = await prisma.paciente.findUnique({
      where: {
        usuarioId: Number(usuarioId)
      }
    });

    if (pacienteExistente) {
      return res.status(400).json({
        mensaje: "Este usuario ya tiene un paciente registrado"
      });
    }

    const paciente = await prisma.paciente.create({
      data: {
        usuarioId: Number(usuarioId),
        telefono,
        fechaNacimiento: fechaNacimiento
          ? new Date(fechaNacimiento)
          : null
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      mensaje: "Paciente creado correctamente",
      paciente
    });

  } catch (error) {
    console.error("Error al crear paciente:", error);

    res.status(500).json({
      mensaje: "Error al crear el paciente"
    });
  }
};

// Actualizar paciente
const actualizarPaciente = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { telefono, fechaNacimiento } = req.body;

    const paciente = await prisma.paciente.update({
      where: {
        id
      },
      data: {
        telefono,
        fechaNacimiento: fechaNacimiento
          ? new Date(fechaNacimiento)
          : null
      }
    });

    res.status(200).json({
      mensaje: "Paciente actualizado correctamente",
      paciente
    });

  } catch (error) {
    console.error("Error al actualizar paciente:", error);

    res.status(500).json({
      mensaje: "Error al actualizar el paciente"
    });
  }
};

// Eliminar paciente
const eliminarPaciente = async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.paciente.delete({
      where: {
        id
      }
    });

    res.status(200).json({
      mensaje: "Paciente eliminado correctamente"
    });

  } catch (error) {
    console.error("Error al eliminar paciente:", error);

    res.status(500).json({
      mensaje: "Error al eliminar el paciente"
    });
  }
};

module.exports = {
  obtenerPacientes,
  obtenerPacientePorId,
  crearPaciente,
  actualizarPaciente,
  eliminarPaciente
};