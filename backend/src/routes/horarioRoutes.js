const express = require("express");

const {
  obtenerHorarios,
  obtenerHorarioPorId,
  crearHorario,
  actualizarHorario,
  eliminarHorario
} = require("../controllers/horarioController");

const verificarToken = require("../middlewares/authMiddleware");
const verificarAdmin = require("../middlewares/rolMiddleware");

const router = express.Router();

router.get("/", verificarToken, obtenerHorarios);
router.get("/:id", verificarToken, obtenerHorarioPorId);

router.post("/", verificarToken, verificarAdmin, crearHorario);
router.put("/:id", verificarToken, verificarAdmin, actualizarHorario);
router.delete("/:id", verificarToken, verificarAdmin, eliminarHorario);

module.exports = router;