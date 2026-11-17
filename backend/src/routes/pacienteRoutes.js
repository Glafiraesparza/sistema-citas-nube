const express = require("express");

const {
  obtenerPacientes,
  obtenerPacientePorId,
  crearPaciente,
  actualizarPaciente,
  eliminarPaciente
} = require("../controllers/pacienteController");

const verificarToken = require("../middlewares/authMiddleware");
const verificarAdmin = require("../middlewares/rolMiddleware");

const router = express.Router();

router.get("/", verificarToken, obtenerPacientes);
router.get("/:id", verificarToken, obtenerPacientePorId);

router.post("/", verificarToken, verificarAdmin, crearPaciente);
router.put("/:id", verificarToken, verificarAdmin, actualizarPaciente);
router.delete("/:id", verificarToken, verificarAdmin, eliminarPaciente);

module.exports = router;