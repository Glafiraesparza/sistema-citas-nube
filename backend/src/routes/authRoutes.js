const express = require("express");

const {
  registrarUsuario,
  iniciarSesion,
  obtenerUsuariosDisponibles
} = require("../controllers/authController");

const verificarToken = require("../middlewares/authMiddleware");

const router = express.Router();

// Registrar usuario
router.post("/register", registrarUsuario);

// Iniciar sesión
router.post("/login", iniciarSesion);

// Consultar perfil
router.get("/perfil", verificarToken, (req, res) => {
  res.status(200).json({
    mensaje: "Acceso autorizado",
    usuario: req.usuario
  });
});

// Consultar usuarios disponibles para registrar como pacientes
router.get(
  "/usuarios-disponibles",
  verificarToken,
  obtenerUsuariosDisponibles
);

module.exports = router;