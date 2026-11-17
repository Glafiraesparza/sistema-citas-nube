const express = require("express");

const {
  obtenerMedicos,
  obtenerMedicoPorId,
  crearMedico,
  actualizarMedico,
  eliminarMedico
} = require("../controllers/medicoController");

const verificarToken = require("../middlewares/authMiddleware");
const verificarAdmin = require("../middlewares/rolMiddleware");

const router = express.Router();

router.get("/", verificarToken, obtenerMedicos);
router.get("/:id", verificarToken, obtenerMedicoPorId);

router.post("/", verificarToken, verificarAdmin, crearMedico);
router.put("/:id", verificarToken, verificarAdmin, actualizarMedico);
router.delete("/:id", verificarToken, verificarAdmin, eliminarMedico);

module.exports = router;