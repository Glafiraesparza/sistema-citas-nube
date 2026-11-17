const express = require("express");

const {
  obtenerCitas,
  obtenerCitaPorId,
  obtenerDisponibilidad,
  crearCita,
  actualizarCita,
  eliminarCita
} = require("../controllers/citaController");

const verificarToken = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", verificarToken, obtenerCitas);
router.get(
  "/disponibilidad",
  verificarToken,
  obtenerDisponibilidad
);
router.get("/:id", verificarToken, obtenerCitaPorId);
router.post("/", verificarToken, crearCita);
router.put("/:id", verificarToken, actualizarCita);
router.delete("/:id", verificarToken, eliminarCita);

module.exports = router;