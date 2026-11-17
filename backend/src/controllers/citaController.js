const prisma = require("../lib/prisma");
const DURACION_CITA = 60;

const convertirMinutos = (hora) => {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
};

const horaValida = (hora) => {
  if (typeof hora !== "string" || !/^\d{2}:\d{2}$/.test(hora)) {
    return false;
  }

  const [h, m] = hora.split(":").map(Number);
  return h >= 0 && h <= 23 && m >= 0 && m <= 59;
};

// Obtener todas las citas
const obtenerCitas = async (req, res) => {
  try {
    let where = {};

    // Si es paciente, solo puede ver sus propias citas
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
        pacienteId: paciente.id
      };
    }

    const citas = await prisma.cita.findMany({
      where,
      include: {
        paciente: {
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true,
                email: true
              }
            }
          }
        },
        medico: true
      },
      orderBy: [
        { fecha: "asc" },
        { hora: "asc" }
      ]
    });

    res.status(200).json(citas);

  } catch (error) {
    console.error("Error al obtener citas:", error);

    res.status(500).json({
      mensaje: "Error al obtener las citas"
    });
  }
};

// Obtener una cita por ID
const obtenerCitaPorId = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const cita = await prisma.cita.findUnique({
      where: { id },
      include: {
        paciente: {
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true,
                email: true
              }
            }
          }
        },
        medico: true
      }
    });

    if (!cita) {
      return res.status(404).json({
        mensaje: "Cita no encontrada"
      });
    }

    // Un paciente solo puede consultar sus propias citas
    if (
      req.usuario.rol === "PACIENTE" &&
      cita.paciente.usuario.id !== req.usuario.id
    ) {
      return res.status(403).json({
        mensaje: "No puedes consultar la cita de otro paciente"
      });
    }

    res.status(200).json(cita);

  } catch (error) {
    console.error("Error al obtener cita:", error);

    res.status(500).json({
      mensaje: "Error al obtener la cita"
    });
  }
};

// Crear cita
const crearCita = async (req, res) => {
  try {
    const {
      pacienteId,
      medicoId,
      fecha,
      hora,
      motivo
    } = req.body;

    if (!pacienteId || !medicoId || !fecha || !hora) {
      return res.status(400).json({
        mensaje: "Paciente, médico, fecha y hora son obligatorios"
      });
    }

    if (!horaValida(hora)) {
  return res.status(400).json({
    mensaje: "La hora debe tener el formato HH:mm"
  });
}

  if (
    typeof fecha !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(fecha)
  ) {
    return res.status(400).json({
      mensaje: "La fecha debe tener el formato YYYY-MM-DD"
    });
  }

  const fechaConsulta = new Date(`${fecha}T00:00:00.000Z`);

  if (
    Number.isNaN(fechaConsulta.getTime()) ||
    fechaConsulta.toISOString().slice(0, 10) !== fecha
  ) {
    return res.status(400).json({
      mensaje: "La fecha proporcionada no es válida"
    });
  }

    const paciente = await prisma.paciente.findUnique({
      where: {
        id: Number(pacienteId)
      }
    });

    if (!paciente) {
      return res.status(404).json({
        mensaje: "El paciente no existe"
      });
    }

    // Un paciente solo puede crear citas para él mismo
    if (
      req.usuario.rol === "PACIENTE" &&
      paciente.usuarioId !== req.usuario.id
    ) {
      return res.status(403).json({
        mensaje: "No puedes crear una cita para otro paciente"
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

    const diaSemana = fechaConsulta.getUTCDay();

const horariosMedico = await prisma.horario.findMany({
  where: {
    medicoId: Number(medicoId),
    diaSemana
  }
});

const inicioCita = convertirMinutos(hora);
const finCita = inicioCita + DURACION_CITA;

const dentroDeHorario = horariosMedico.some((horario) => {
  const inicioAtencion = convertirMinutos(horario.horaInicio);
  const finAtencion = convertirMinutos(horario.horaFin);

  return (
    inicioCita >= inicioAtencion &&
    finCita <= finAtencion
  );
});

if (!dentroDeHorario) {
  return res.status(400).json({
    mensaje: "La cita está fuera del horario de atención del médico"
  });
}

    const citasExistentes = await prisma.cita.findMany({
      where: {
        medicoId: Number(medicoId),
        fecha: fechaConsulta,
        estado: {
          not: "CANCELADA"
        }
      }
    });

    const existeConflicto = citasExistentes.some((cita) => {
      const inicioExistente = convertirMinutos(cita.hora);
      const finExistente = inicioExistente + DURACION_CITA;

      return (
        inicioCita < finExistente &&
        finCita > inicioExistente
      );
    });

    if (existeConflicto) {
      return res.status(400).json({
        mensaje: "El médico ya tiene una cita en ese horario"
      });
    }

    const cita = await prisma.cita.create({
      data: {
        pacienteId: Number(pacienteId),
        medicoId: Number(medicoId),
        fecha: fechaConsulta,
        hora,
        motivo
      },
      include: {
        paciente: {
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true,
                email: true
              }
            }
          }
        },
        medico: true
      }
    });

    res.status(201).json({
      mensaje: "Cita creada correctamente",
      cita
    });

  } catch (error) {
    console.error("Error al crear cita:", error);

    if (error.code === "P2002") {
      return res.status(409).json({
        mensaje: "Ese horario acaba de ser reservado. Selecciona otro."
      });
    }

    res.status(500).json({
      mensaje: "Error al crear la cita"
    });
  }
};

// Actualizar cita
const actualizarCita = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { fecha, hora, estado, motivo } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        mensaje: "ID de cita inválido"
      });
    }

    const citaExistente = await prisma.cita.findUnique({
      where: { id }
    });

    if (!citaExistente) {
      return res.status(404).json({
        mensaje: "Cita no encontrada"
      });
    }

    // Las citas atendidas forman parte del historial
    if (citaExistente.estado === "ATENDIDA") {
      return res.status(400).json({
        mensaje: "Las citas atendidas no pueden modificarse"
      });
    }

    // Validar permisos del paciente
    if (req.usuario.rol === "PACIENTE") {
      const paciente = await prisma.paciente.findUnique({
        where: {
          usuarioId: req.usuario.id
        }
      });

      if (!paciente || citaExistente.pacienteId !== paciente.id) {
        return res.status(403).json({
          mensaje: "No puedes modificar una cita de otro paciente"
        });
      }

      const camposEnviados = Object.keys(req.body);

      if (
        camposEnviados.length !== 1 ||
        estado !== "CANCELADA"
      ) {
        return res.status(403).json({
          mensaje: "Los pacientes solamente pueden cancelar sus citas"
        });
      }

      if (citaExistente.estado === "CANCELADA") {
        return res.status(400).json({
          mensaje: "Esta cita ya está cancelada"
        });
      }

      const citaCancelada = await prisma.cita.update({
        where: { id },
        data: { estado: "CANCELADA" }
      });

      return res.status(200).json({
        mensaje: "Cita cancelada correctamente",
        cita: citaCancelada
      });
    }

    if (req.usuario.rol !== "ADMIN") {
      return res.status(403).json({
        mensaje: "No tienes permisos para modificar citas"
      });
    }

    // Validar estado
    const estadosValidos = [
      "PROGRAMADA",
      "CANCELADA",
      "ATENDIDA"
    ];

    if (estado !== undefined && !estadosValidos.includes(estado)) {
      return res.status(400).json({
        mensaje: "Estado de cita inválido"
      });
    }

    // Una cita cancelada no se puede marcar directamente como atendida
    if (
      citaExistente.estado === "CANCELADA" &&
      estado === "ATENDIDA"
    ) {
      return res.status(400).json({
        mensaje: "Una cita cancelada no puede marcarse como atendida"
      });
    }

    // Evitar modificar fecha u hora al marcar una cita como atendida
    if (
      estado === "ATENDIDA" &&
      (fecha !== undefined || hora !== undefined)
    ) {
      return res.status(400).json({
        mensaje: "No puedes reprogramar y atender una cita en la misma operación"
      });
    }

    // Validar fecha, si se proporciona
    let fechaConsulta = citaExistente.fecha;

    if (fecha !== undefined) {
      if (
        typeof fecha !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(fecha)
      ) {
        return res.status(400).json({
          mensaje: "La fecha debe tener el formato YYYY-MM-DD"
        });
      }

      fechaConsulta = new Date(`${fecha}T00:00:00.000Z`);

      if (
        Number.isNaN(fechaConsulta.getTime()) ||
        fechaConsulta.toISOString().slice(0, 10) !== fecha
      ) {
        return res.status(400).json({
          mensaje: "La fecha proporcionada no es válida"
        });
      }
    }

    const horaConsulta = hora !== undefined
      ? hora
      : citaExistente.hora;

    if (!horaValida(horaConsulta)) {
      return res.status(400).json({
        mensaje: "La hora debe tener el formato HH:mm"
      });
    }

    const estadoFinal = estado ?? citaExistente.estado;

    // No permitir reprogramar citas canceladas sin reactivarlas
    if (
      citaExistente.estado === "CANCELADA" &&
      (fecha !== undefined || hora !== undefined) &&
      estadoFinal === "CANCELADA"
    ) {
      return res.status(400).json({
        mensaje: "Debes reactivar la cita para poder reprogramarla"
      });
    }

    // Verificar disponibilidad si la cita quedará programada
    if (estadoFinal === "PROGRAMADA") {
      const diaSemana = fechaConsulta.getUTCDay();

      const horariosMedico = await prisma.horario.findMany({
        where: {
          medicoId: citaExistente.medicoId,
          diaSemana
        }
      });

      const inicioCita = convertirMinutos(horaConsulta);
      const finCita = inicioCita + DURACION_CITA;

      const dentroDeHorario = horariosMedico.some((horario) => {
        const inicio = convertirMinutos(horario.horaInicio);
        const fin = convertirMinutos(horario.horaFin);

        return inicioCita >= inicio && finCita <= fin;
      });

      if (!dentroDeHorario) {
        return res.status(400).json({
          mensaje: "La cita está fuera del horario de atención del médico"
        });
      }

      // Consultar otras citas que ocupan ese día
      const citasOcupadas = await prisma.cita.findMany({
        where: {
          medicoId: citaExistente.medicoId,
          fecha: fechaConsulta,
          id: { not: id },
          estado: {
            not: "CANCELADA"
          }
        }
      });

      const existeConflicto = citasOcupadas.some((cita) => {
        const inicioExistente = convertirMinutos(cita.hora);
        const finExistente = inicioExistente + DURACION_CITA;

        return (
          inicioCita < finExistente &&
          finCita > inicioExistente
        );
      });

      if (existeConflicto) {
        return res.status(400).json({
          mensaje: "El médico ya tiene una cita en ese horario"
        });
      }
    }

    // Actualizar la cita
    const cita = await prisma.cita.update({
      where: { id },
      data: {
        fecha: fecha !== undefined ? fechaConsulta : undefined,
        hora: hora !== undefined ? horaConsulta : undefined,
        estado: estado !== undefined ? estado : undefined,
        motivo: motivo !== undefined ? motivo : undefined
      },
      include: {
        paciente: {
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true,
                email: true
              }
            }
          }
        },
        medico: true
      }
    });

    res.status(200).json({
      mensaje: "Cita actualizada correctamente",
      cita
    });

  } catch (error) {
    console.error("Error al actualizar cita:", error);

    if (error.code === "P2002") {
      return res.status(409).json({
        mensaje: "Ese horario ya está reservado. Selecciona otro."
      });
    }

    res.status(500).json({
      mensaje: "Error al actualizar la cita"
    });
  }
};

// Eliminar cita (operación deshabilitada para conservar el historial)
const eliminarCita = async (req, res) => {
  return res.status(403).json({
    mensaje: "No se permite eliminar citas. Para cancelarlas, cambia su estado a CANCELADA."
  });
};

// Consultar horarios disponibles de un médico
const obtenerDisponibilidad = async (req, res) => {
  try {
    const medicoId = Number(req.query.medicoId);
    const fecha = req.query.fecha;

    if (
      !Number.isInteger(medicoId) ||
      medicoId <= 0 ||
      !fecha ||
      !/^\d{4}-\d{2}-\d{2}$/.test(fecha)
    ) {
      return res.status(400).json({
        mensaje: "Debes proporcionar un médico y una fecha válida"
      });
    }

    const fechaConsulta = new Date(`${fecha}T00:00:00.000Z`);

    if (
      Number.isNaN(fechaConsulta.getTime()) ||
      fechaConsulta.toISOString().slice(0, 10) !== fecha
    ) {
      return res.status(400).json({
        mensaje: "La fecha no es válida"
      });
    }

    const medico = await prisma.medico.findUnique({
      where: { id: medicoId }
    });

    if (!medico) {
      return res.status(404).json({
        mensaje: "El médico no existe"
      });
    }

    // JavaScript: domingo = 0, lunes = 1, ..., sábado = 6
    const diaSemana = fechaConsulta.getUTCDay();

    const horarios = await prisma.horario.findMany({
      where: {
        medicoId,
        diaSemana
      }
    });

    const citasOcupadas = await prisma.cita.findMany({
      where: {
        medicoId,
        fecha: fechaConsulta,
        estado: {
          not: "CANCELADA"
        }
      },
      select: {
        hora: true
      }
    });

    const convertirMinutos = (hora) => {
      const [h, m] = hora.split(":").map(Number);
      return h * 60 + m;
    };

    const formatearHora = (minutos) => {
      const h = Math.floor(minutos / 60);
      const m = minutos % 60;

      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    };

    const ocupadas = citasOcupadas.map((cita) =>
      convertirMinutos(cita.hora)
    );

    const disponibles = new Set();

    for (const horario of horarios) {
      const inicio = convertirMinutos(horario.horaInicio);
      const fin = convertirMinutos(horario.horaFin);

      // Cada consulta dura 60 minutos
      for (let hora = inicio; hora + 60 <= fin; hora += 60) {
        const tieneConflicto = ocupadas.some(
          (ocupada) =>
            hora < ocupada + 60 &&
            hora + 60 > ocupada
        );

        if (!tieneConflicto) {
          disponibles.add(formatearHora(hora));
        }
      }
    }

    res.status(200).json({
      medicoId,
      fecha,
      duracionMinutos: 60,
      horariosDisponibles: [...disponibles].sort()
    });

  } catch (error) {
    console.error("Error al obtener disponibilidad:", error);

    res.status(500).json({
      mensaje: "Error al consultar disponibilidad"
    });
  }
};

module.exports = {
  obtenerCitas,
  obtenerCitaPorId,
  obtenerDisponibilidad,
  crearCita,
  actualizarCita,
  eliminarCita
};