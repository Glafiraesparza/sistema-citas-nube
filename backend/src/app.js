const express = require("express");
const cors = require("cors");
require("dotenv").config();

const prisma = require("./lib/prisma");
const authRoutes = require("./routes/authRoutes");

const medicoRoutes = require("./routes/medicoRoutes");
const pacienteRoutes = require("./routes/pacienteRoutes");
const horarioRoutes = require("./routes/horarioRoutes");
const citaRoutes = require("./routes/citaRoutes");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/medicos", medicoRoutes);
app.use("/api/pacientes", pacienteRoutes);
app.use("/api/horarios", horarioRoutes);
app.use("/api/citas", citaRoutes);

// Ruta principal
app.get("/", (req, res) => {
  res.json({
    mensaje: "API del sistema de agenda y citas",
    estado: "Funcionando"
  });
});

// Ruta para comprobar el servidor
app.get("/api/health", (req, res) => {
  res.status(200).json({
    estado: "OK",
    mensaje: "El servidor está funcionando correctamente"
  });
});

// Ruta para comprobar PostgreSQL mediante Prisma
app.get("/api/health/database", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      estado: "OK",
      mensaje: "La conexión con PostgreSQL funciona correctamente"
    });
  } catch (error) {
    console.error("Error de conexión con la base de datos:", error);

    res.status(500).json({
      estado: "ERROR",
      mensaje: "No se pudo conectar con PostgreSQL"
    });
  }
});

// Puerto del servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});