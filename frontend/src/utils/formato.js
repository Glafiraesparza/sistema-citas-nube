export const DIAS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado"
];

export const DIAS_CORTOS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export function ymd(valor) {
  if (!valor) return "";
  return String(valor).substring(0, 10);
}

export function fechaLegible(valor, opciones) {
  const iso = ymd(valor);
  if (!iso) return "";
  const [anio, mes, dia] = iso.split("-").map(Number);
  return new Date(anio, mes - 1, dia).toLocaleDateString(
    "es-MX",
    opciones || { day: "numeric", month: "short", year: "numeric" }
  );
}

export function horaLegible(hora) {
  if (hora == null) return "";
  const texto = String(hora);
  if (/^\d{2}:\d{2}/.test(texto)) return texto.slice(0, 5);
  return texto;
}

export function etiquetaEstado(estado) {
  if (estado === "PROGRAMADA") return "Programada";
  if (estado === "ATENDIDA") return "Atendida";
  if (estado === "CANCELADA") return "Cancelada";
  return estado || "Sin estado";
}

export function etiquetaRol(rol) {
  if (rol === "ADMIN") return "Administrador";
  if (rol === "PACIENTE") return "Paciente";
  return rol || "";
}

export function nombreDia(diaSemana) {
  const indice = Number(diaSemana);
  return DIAS[indice] || String(diaSemana);
}

export function iniciales(nombre) {
  if (!nombre) return "?";
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0].toUpperCase())
    .join("");
}

export function clasificarMensaje(mensaje) {
  const texto = mensaje.toLowerCase();

  if (
    texto.includes("fallaron") ||
    texto.includes("pero no se pudo") ||
    texto.includes("comprueba")
  ) {
    return "warning";
  }

  if (
    texto.includes("error") ||
    texto.startsWith("selecciona") ||
    texto.startsWith("debes") ||
    texto.includes("no tienes") ||
    texto.includes("no se pudo") ||
    texto.includes("debe ser menor")
  ) {
    return "error";
  }

  if (texto.includes("correctamente")) return "success";
  return "info";
}

export function hoyYmd() {
  return new Date().toLocaleDateString("en-CA");
}
