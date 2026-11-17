-- DropIndex
DROP INDEX "Cita_medicoId_fecha_hora_key";

-- Evitar citas duplicadas, excepto las canceladas
CREATE UNIQUE INDEX "Cita_medicoId_fecha_hora_activa_key"
ON "Cita" ("medicoId", "fecha", "hora")
WHERE "estado" <> 'CANCELADA'::"EstadoCita";