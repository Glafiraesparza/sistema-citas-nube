import { useMemo, useState } from "react";
import {
  Ban,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Plus,
  Stethoscope,
  Users
} from "lucide-react";
import StatusBadge from "./StatusBadge";
import {
  DIAS_CORTOS,
  fechaLegible,
  horaLegible,
  hoyYmd,
  iniciales,
  ymd
} from "../utils/formato";

const COLORES = {
  PROGRAMADA: "#0f766e",
  ATENDIDA: "#16324f",
  CANCELADA: "#cbd5e1"
};

function construirMes(ancla) {
  const anio = ancla.getFullYear();
  const mes = ancla.getMonth();
  const primero = new Date(anio, mes, 1);
  const offset = (primero.getDay() + 6) % 7;
  const inicio = new Date(anio, mes, 1 - offset);
  const celdas = [];

  for (let i = 0; i < 42; i += 1) {
    const fecha = new Date(inicio);
    fecha.setDate(inicio.getDate() + i);
    const iso = fecha.toLocaleDateString("en-CA");
    celdas.push({
      iso,
      dia: fecha.getDate(),
      fuera: fecha.getMonth() !== mes
    });
  }

  return celdas;
}

function Donut({ partes }) {
  const total = partes.reduce((suma, parte) => suma + parte.valor, 0);
  const radio = 42;
  const circunferencia = 2 * Math.PI * radio;
  let acumulado = 0;

  return (
    <div className="donut-wrap">
      <svg viewBox="0 0 120 120" className="donut" role="img" aria-label="Citas por estado">
        <circle cx="60" cy="60" r={radio} className="donut-track" />
        {total > 0 &&
          partes.map((parte) => {
            const largo = (parte.valor / total) * circunferencia;
            const segmento = (
              <circle
                key={parte.id}
                className="donut-arc"
                cx="60"
                cy="60"
                r={radio}
                fill="none"
                stroke={parte.color}
                strokeWidth="12"
                strokeDasharray={`${largo} ${circunferencia - largo}`}
                strokeDashoffset={-acumulado}
                strokeLinecap="butt"
              />
            );
            acumulado += largo;
            return segmento;
          })}
        <text x="60" y="56" textAnchor="middle" className="donut-total">
          {total}
        </text>
        <text x="60" y="74" textAnchor="middle" className="donut-label">
          citas
        </text>
      </svg>
      <ul className="donut-legend">
        {partes.map((parte) => (
          <li key={parte.id}>
            <i style={{ background: parte.color }} />
            <span>{parte.nombre}</span>
            <strong>{parte.valor}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Dashboard({
  usuario,
  citas,
  medicos,
  pacientes,
  horarios,
  cargando,
  onAgendar,
  onIrA,
  onCancelar,
  onAtender,
  onReprogramar
}) {
  const hoy = hoyYmd();
  const [mesVisible, setMesVisible] = useState(() => new Date());
  const [diaSeleccionado, setDiaSeleccionado] = useState(hoy);

  const esAdmin = usuario.rol === "ADMIN";
  const celdas = useMemo(() => construirMes(mesVisible), [mesVisible]);

  const conteoPorFecha = useMemo(() => {
    const mapa = {};
    citas.forEach((cita) => {
      const clave = ymd(cita.fecha);
      mapa[clave] = (mapa[clave] || 0) + 1;
    });
    return mapa;
  }, [citas]);

  const programadas = citas.filter((cita) => cita.estado === "PROGRAMADA");
  const deHoy = citas.filter((cita) => ymd(cita.fecha) === hoy);
  const proximasTodas = programadas.filter((cita) => ymd(cita.fecha) >= hoy);
  const proximas = proximasTodas.slice(0, 5);
  const tarjetas = proximasTodas.slice(0, 3);
  const agendaDia = citas
    .filter((cita) => ymd(cita.fecha) === diaSeleccionado)
    .sort((a, b) => String(a.hora).localeCompare(String(b.hora)));

  const partes = [
    { id: "PROGRAMADA", nombre: "Programadas", valor: citas.filter((c) => c.estado === "PROGRAMADA").length, color: COLORES.PROGRAMADA },
    { id: "ATENDIDA", nombre: "Atendidas", valor: citas.filter((c) => c.estado === "ATENDIDA").length, color: COLORES.ATENDIDA },
    { id: "CANCELADA", nombre: "Canceladas", valor: citas.filter((c) => c.estado === "CANCELADA").length, color: COLORES.CANCELADA }
  ];

  const ordenSemana = [1, 2, 3, 4, 5, 6, 0];
  const porDia = ordenSemana.map((indice) => ({
    nombre: DIAS_CORTOS[indice],
    valor: citas.filter((cita) => {
      const iso = ymd(cita.fecha);
      if (!iso) return false;
      const [anio, mes, dia] = iso.split("-").map(Number);
      return new Date(anio, mes - 1, dia).getDay() === indice;
    }).length
  }));
  const maximoDia = Math.max(1, ...porDia.map((dia) => dia.valor));

  const indicadores = esAdmin
    ? [
        { id: "hoy", icono: CalendarDays, tono: "teal", titulo: "Citas de hoy", valor: deHoy.length, detalle: deHoy.length === 1 ? "registrada para hoy" : "registradas para hoy", destino: "citas" },
        { id: "proximas", icono: Clock3, tono: "navy", titulo: "Programadas", valor: programadas.length, detalle: "en cualquier fecha", destino: "citas" },
        { id: "medicos", icono: Stethoscope, tono: "teal", titulo: "Médicos", valor: medicos.length, detalle: "en el directorio", destino: "medicos" },
        { id: "pacientes", icono: Users, tono: "navy", titulo: "Pacientes", valor: pacientes.length, detalle: "con expediente", destino: "pacientes" }
      ]
    : [
        { id: "hoy", icono: CalendarDays, tono: "teal", titulo: "Citas de hoy", valor: deHoy.length, detalle: "en tu agenda", destino: "citas" },
        { id: "proximas", icono: Clock3, tono: "navy", titulo: "Próximas", valor: proximasTodas.length, detalle: "programadas a partir de hoy", destino: "citas" },
        { id: "atendidas", icono: Stethoscope, tono: "teal", titulo: "Atendidas", valor: partes[1].valor, detalle: "consultas completadas", destino: "citas" },
        { id: "canceladas", icono: Ban, tono: "navy", titulo: "Canceladas", valor: partes[2].valor, detalle: "ya no vigentes", destino: "citas" }
      ];

  const tituloMes = mesVisible.toLocaleDateString("es-MX", { month: "long", year: "numeric" });

  return (
    <div className="dashboard">
      <div className="page-head">
        <div>
          <h1>Hola, {usuario.nombre}</h1>
          <p>{fechaLegible(hoy, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
        <button type="button" className="btn btn-primary btn-agendar" onClick={onAgendar}>
          <Plus size={16} />
          Agendar cita
        </button>
      </div>

      <section className="stat-grid" aria-label="Indicadores">
        {indicadores.map((item) => {
          const Icono = item.icono;
          return (
            <button
              key={item.id}
              type="button"
              className={`stat-card tono-${item.tono}`}
              onClick={() => onIrA(item.destino)}
            >
              <span className="stat-icon">
                <Icono size={18} />
              </span>
              <span className="stat-copy">
                <small>{item.titulo}</small>
                <strong>{cargando ? "—" : item.valor}</strong>
                <em>{item.detalle}</em>
              </span>
              <span className="stat-link">Ver →</span>
            </button>
          );
        })}
      </section>

      <section className="dash-grid">
        <article className="panel calendar-panel">
          <div className="panel-head">
            <h2>Calendario</h2>
            <div className="month-nav">
              <button
                type="button"
                className="icon-button"
                aria-label="Mes anterior"
                onClick={() => setMesVisible(new Date(mesVisible.getFullYear(), mesVisible.getMonth() - 1, 1))}
              >
                <ChevronLeft size={16} />
              </button>
              <span>{tituloMes}</span>
              <button
                type="button"
                className="icon-button"
                aria-label="Mes siguiente"
                onClick={() => setMesVisible(new Date(mesVisible.getFullYear(), mesVisible.getMonth() + 1, 1))}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="calendar-weekdays">
            {ordenSemana.map((indice) => (
              <span key={DIAS_CORTOS[indice]}>{DIAS_CORTOS[indice]}</span>
            ))}
          </div>
          <div className="calendar-grid">
            {celdas.map((celda) => (
              <button
                key={celda.iso}
                type="button"
                className={[
                  "calendar-day",
                  celda.fuera ? "fuera" : "",
                  celda.iso === hoy ? "hoy" : "",
                  celda.iso === diaSeleccionado ? "seleccionado" : ""
                ].join(" ")}
                onClick={() => setDiaSeleccionado(celda.iso)}
              >
                {celda.dia}
                {conteoPorFecha[celda.iso] ? <i className="day-dot" /> : null}
              </button>
            ))}
          </div>

          <div className="day-agenda">
            <h3>
              {diaSeleccionado === hoy ? "Agenda de hoy" : fechaLegible(diaSeleccionado)}
            </h3>
            {agendaDia.length === 0 ? (
              <p className="muted">No hay citas en este día.</p>
            ) : (
              <ul>
                {agendaDia.map((cita) => (
                  <li key={cita.id}>
                    <strong>{horaLegible(cita.hora)}</strong>
                    <span>
                      {esAdmin ? cita.paciente?.usuario?.nombre : cita.medico?.nombre}
                    </span>
                    <StatusBadge estado={cita.estado} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </article>

        <article className="panel">
          <div className="panel-head">
            <h2>Estados</h2>
          </div>
          {citas.length === 0 ? (
            <p className="muted">
              {cargando ? "Cargando citas…" : "Todavía no hay citas para graficar."}
            </p>
          ) : (
            <Donut partes={partes} />
          )}

          <h3 className="chart-title">Por día de la semana</h3>
          <div className="week-bars" aria-hidden={citas.length === 0}>
            {porDia.map((dia) => (
              <div key={dia.nombre} className="week-bar">
                <div className="bar-track">
                  <span style={{ height: `${(dia.valor / maximoDia) * 100}%` }} />
                </div>
                <small>{dia.nombre}</small>
                <em>{dia.valor}</em>
              </div>
            ))}
          </div>
          {esAdmin && (
            <p className="chart-note">
              {horarios.length} {horarios.length === 1 ? "bloque de horario" : "bloques de horario"} registrados
            </p>
          )}
        </article>

        <article className="panel list-panel">
          <div className="panel-head">
            <div>
              <h2>{esAdmin ? "Próximas citas" : "Tus próximas citas"}</h2>
              <p>Programadas desde hoy</p>
            </div>
          </div>

          {proximas.length === 0 ? (
            <p className="muted">No hay citas programadas a partir de hoy.</p>
          ) : (
            <ul className="appt-list">
              {proximas.map((cita) => (
                <li key={cita.id}>
                  <span className="avatar">
                    {iniciales(esAdmin ? cita.paciente?.usuario?.nombre : cita.medico?.nombre)}
                  </span>
                  <span className="appt-copy">
                    <strong>
                      {esAdmin ? cita.paciente?.usuario?.nombre : cita.medico?.nombre}
                    </strong>
                    <small>
                      {esAdmin ? cita.medico?.nombre : "Consulta"} · {fechaLegible(cita.fecha)} · {horaLegible(cita.hora)}
                    </small>
                  </span>
                  <StatusBadge estado={cita.estado} />
                </li>
              ))}
            </ul>
          )}

          <button type="button" className="btn btn-primary w-100" onClick={onAgendar}>
            Agendar cita
          </button>
        </article>
      </section>

      {tarjetas.length > 0 && (
        <section className="visit-grid" aria-label="Detalle de próximas citas">
          {tarjetas.map((cita) => (
            <article key={cita.id} className="visit-card">
              <header>
                <span className="avatar">
                  {iniciales(esAdmin ? cita.paciente?.usuario?.nombre : cita.medico?.nombre)}
                </span>
                <span>
                  <strong>
                    {esAdmin ? cita.paciente?.usuario?.nombre : cita.medico?.nombre}
                  </strong>
                  <small>{esAdmin ? cita.medico?.nombre : "Médico asignado"}</small>
                </span>
                <StatusBadge estado={cita.estado} />
              </header>
              <p>
                <CalendarDays size={15} />
                {fechaLegible(cita.fecha, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
              <p>
                <Clock3 size={15} />
                {horaLegible(cita.hora)}
                {cita.motivo ? ` · ${cita.motivo}` : ""}
              </p>
              <footer>
                {esAdmin && (
                  <>
                    <button type="button" onClick={() => onReprogramar(cita)}>
                      Reprogramar
                    </button>
                    <button type="button" onClick={() => onAtender(cita.id)}>
                      Marcar atendida
                    </button>
                  </>
                )}
                <button type="button" onClick={() => onCancelar(cita.id)}>
                  Cancelar
                </button>
              </footer>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
