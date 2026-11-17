import { etiquetaEstado } from "../utils/formato";

const CLASE = {
  PROGRAMADA: "badge-programada",
  ATENDIDA: "badge-atendida",
  CANCELADA: "badge-cancelada"
};

export default function StatusBadge({ estado }) {
  return (
    <span className={`status-badge ${CLASE[estado] || "badge-cancelada"}`}>
      {etiquetaEstado(estado)}
    </span>
  );
}
