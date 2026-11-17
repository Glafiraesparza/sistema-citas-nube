const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");

// Registrar usuario
const registrarUsuario = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({
        mensaje: "Nombre, email y contraseña son obligatorios"
      });
    }

    const usuarioExistente = await prisma.usuario.findUnique({
      where: {
        email
      }
    });

    if (usuarioExistente) {
      return res.status(400).json({
        mensaje: "El correo electrónico ya está registrado"
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const usuario = await prisma.usuario.create({
      data: {
        nombre,
        email,
        password: passwordHash
      }
    });

    res.status(201).json({
      mensaje: "Usuario registrado correctamente",
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });

  } catch (error) {
    console.error("Error al registrar usuario:", error);

    res.status(500).json({
      mensaje: "Error interno del servidor"
    });
  }
};

// Iniciar sesión
const iniciarSesion = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        mensaje: "Email y contraseña son obligatorios"
      });
    }

    const usuario = await prisma.usuario.findUnique({
      where: {
        email
      }
    });

    if (!usuario) {
      return res.status(401).json({
        mensaje: "Correo o contraseña incorrectos"
      });
    }

    const passwordCorrecta = await bcrypt.compare(
      password,
      usuario.password
    );

    if (!passwordCorrecta) {
      return res.status(401).json({
        mensaje: "Correo o contraseña incorrectos"
      });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h"
      }
    );

    res.status(200).json({
      mensaje: "Inicio de sesión exitoso",
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });

  } catch (error) {
    console.error("Error al iniciar sesión:", error);

    res.status(500).json({
      mensaje: "Error interno del servidor"
    });
  }
};

// Obtener usuarios disponibles para registrar como pacientes
const obtenerUsuariosDisponibles = async (req, res) => {
  try {
    // Solo el administrador puede consultar usuarios
    if (req.usuario.rol !== "ADMIN") {
      return res.status(403).json({
        mensaje: "No tienes permisos para consultar usuarios"
      });
    }

    // Buscar usuarios que aún no tienen registro de paciente
    const usuarios = await prisma.usuario.findMany({
      where: {
        rol: "PACIENTE",
        paciente: null
      },
      select: {
        id: true,
        nombre: true,
        email: true
      },
      orderBy: {
        nombre: "asc"
      }
    });

    res.status(200).json(usuarios);

  } catch (error) {
    console.error("Error al obtener usuarios:", error);

    res.status(500).json({
      mensaje: "Error al obtener los usuarios"
    });
  }
};

module.exports = {
  registrarUsuario,
  iniciarSesion,
  obtenerUsuariosDisponibles
};