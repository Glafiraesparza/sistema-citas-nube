import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Search
} from "lucide-react";

import { DIAS, horaLegible, nombreDia } from "../utils/formato";

const TAMANOS_PAGINA = [5, 10, 20];

export default function HorariosListado({ horarios = [] }) {
  const [busqueda, setBusqueda] = useState("");
  const [medicoId, setMedicoId] = useState("");
  const [diaSemana, setDiaSemana] = useState("");
  const [campoOrden, setCampoOrden] = useState("diaSemana");
  const [direccionOrden, setDireccionOrden] = useState("asc");
  const [pagina, setPagina] = useState(1);
  const [tamanoPagina, setTamanoPagina] = useState(5);

  const medicos = useMemo(() => {
    const unicos = new Map();
    horarios.forEach((horario) => {
      if (horario.medico) unicos.set(Number(horario.medicoId), horario.medico);
    });
    return [...unicos.values()].sort((a, b) =>
      a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" })
    );
  }, [horarios]);

  const horariosFiltrados = useMemo(() => {
    const consulta = busqueda.trim().toLocaleLowerCase("es");

    return horarios
      .filter((horario) => {
        const nombre = horario.medico?.nombre || "";
        return (
          (!consulta || nombre.toLocaleLowerCase("es").includes(consulta)) &&
          (!medicoId || String(horario.medicoId) === medicoId) &&
          (!diaSemana || String(horario.diaSemana) === diaSemana)
        );
      })
      .sort((a, b) => {
        const comparacion =
          campoOrden === "diaSemana"
            ? Number(a.diaSemana) - Number(b.diaSemana) ||
              horaLegible(a.horaInicio).localeCompare(horaLegible(b.horaInicio)) ||
              horaLegible(a.horaFin).localeCompare(horaLegible(b.horaFin))
            : campoOrden === "horaFin"
              ? horaLegible(a.horaFin).localeCompare(horaLegible(b.horaFin)) ||
                Number(a.diaSemana) - Number(b.diaSemana) ||
                horaLegible(a.horaInicio).localeCompare(horaLegible(b.horaInicio))
              : horaLegible(a.horaInicio).localeCompare(horaLegible(b.horaInicio)) ||
                Number(a.diaSemana) - Number(b.diaSemana) ||
                horaLegible(a.horaFin).localeCompare(horaLegible(b.horaFin));

        return comparacion * (direccionOrden === "asc" ? 1 : -1);
      });
  }, [busqueda, campoOrden, diaSemana, direccionOrden, horarios, medicoId]);

  const totalPaginas = Math.ceil(horariosFiltrados.length / tamanoPagina);
  const paginaVisible = Math.min(pagina, Math.max(totalPaginas, 1));
  const inicio = (paginaVisible - 1) * tamanoPagina;
  const horariosPagina = horariosFiltrados.slice(inicio, inicio + tamanoPagina);
  const hayFiltrosActivos = Boolean(busqueda || medicoId || diaSemana);

  const limpiarFiltros = () => {
    setBusqueda("");
    setMedicoId("");
    setDiaSemana("");
    setPagina(1);
  };

  return (
    <section className="surface horarios-listado" aria-label="Horarios de atención">
      <div className="horarios-filtros">
        <div className="horarios-control horarios-busqueda">
          <label className="form-label" htmlFor="horarios-busqueda">
            Buscar médico
          </label>
          <div className="horarios-search-input">
            <Search size={17} aria-hidden="true" />
            <input
              id="horarios-busqueda"
              className="form-control"
              type="search"
              placeholder="Nombre del médico"
              value={busqueda}
              onChange={(event) => {
                setBusqueda(event.target.value);
                setPagina(1);
              }}
            />
          </div>
        </div>

        <div className="horarios-control">
          <label className="form-label" htmlFor="horarios-medico">
            Médico
          </label>
          <select
            id="horarios-medico"
            className="form-select"
            value={medicoId}
            onChange={(event) => {
              setMedicoId(event.target.value);
              setPagina(1);
            }}
          >
            <option value="">Todos</option>
            {medicos.map((medico) => (
              <option key={medico.id} value={medico.id}>
                {medico.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="horarios-control">
          <label className="form-label" htmlFor="horarios-dia">
            Día
          </label>
          <select
            id="horarios-dia"
            className="form-select"
            value={diaSemana}
            onChange={(event) => {
              setDiaSemana(event.target.value);
              setPagina(1);
            }}
          >
            <option value="">Todos los días</option>
            {DIAS.map((dia, indice) => (
              <option key={dia} value={indice}>
                {dia}
              </option>
            ))}
          </select>
        </div>

        <button
          className="btn btn-light horarios-limpiar"
          type="button"
          onClick={limpiarFiltros}
          disabled={!hayFiltrosActivos}
        >
          <RotateCcw size={15} aria-hidden="true" />
          Limpiar filtros
        </button>
      </div>

      <div className="horarios-resultados-barra">
        <p className="horarios-conteo" aria-live="polite">
          {horariosFiltrados.length}{" "}
          {horariosFiltrados.length === 1 ? "horario encontrado" : "horarios encontrados"}
        </p>
        <div className="horarios-opciones">
          <div className="horarios-opcion">
            <label className="form-label" htmlFor="horarios-orden">
              Ordenar por
            </label>
            <select
              id="horarios-orden"
              className="form-select form-select-sm"
              value={campoOrden}
              onChange={(event) => {
                setCampoOrden(event.target.value);
                setPagina(1);
              }}
            >
              <option value="diaSemana">Día de la semana</option>
              <option value="horaInicio">Hora de inicio</option>
              <option value="horaFin">Hora de fin</option>
            </select>
          </div>
          <div className="horarios-opcion horarios-direccion">
            <label className="form-label" htmlFor="horarios-direccion">
              Dirección
            </label>
            <select
              id="horarios-direccion"
              className="form-select form-select-sm"
              value={direccionOrden}
              onChange={(event) => {
                setDireccionOrden(event.target.value);
                setPagina(1);
              }}
            >
              <option value="asc">Ascendente</option>
              <option value="desc">Descendente</option>
            </select>
          </div>
          <div className="horarios-opcion horarios-tamano">
            <label className="form-label" htmlFor="horarios-tamano">
              Por página
            </label>
            <select
              id="horarios-tamano"
              className="form-select form-select-sm"
              value={tamanoPagina}
              onChange={(event) => {
                setTamanoPagina(Number(event.target.value));
                setPagina(1);
              }}
            >
              {TAMANOS_PAGINA.map((tamano) => (
                <option key={tamano} value={tamano}>
                  {tamano}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {horariosPagina.length === 0 ? (
        <div className="empty-state horarios-vacio">
          {horarios.length === 0 ? (
            <p>No hay horarios registrados.</p>
          ) : (
            <>
              <p>No hay horarios que coincidan con los filtros seleccionados.</p>
              {hayFiltrosActivos && (
                <button
                  className="btn btn-light mt-3"
                  type="button"
                  onClick={limpiarFiltros}
                >
                  Limpiar filtros
                </button>
              )}
            </>
          )}
        </div>
      ) : (
        <>
          <div className="table-wrap horarios-tabla-wrap">
            <table className="table table-hover clinic-table horarios-tabla">
              <thead>
                <tr>
                  <th scope="col">Médico</th>
                  <th scope="col">Día de atención</th>
                  <th scope="col">Hora de inicio</th>
                  <th scope="col">Hora de fin</th>
                </tr>
              </thead>
              <tbody>
                {horariosPagina.map((horario) => (
                  <tr key={horario.id}>
                    <td><strong className="horarios-medico">{horario.medico?.nombre || "Sin médico"}</strong></td>
                    <td><span className="horarios-dia">{nombreDia(horario.diaSemana)}</span></td>
                    <td>{horaLegible(horario.horaInicio)}</td>
                    <td>{horaLegible(horario.horaFin)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="horarios-paginacion">
            <span>
              Mostrando {inicio + 1}–
              {Math.min(inicio + tamanoPagina, horariosFiltrados.length)} de {horariosFiltrados.length}
            </span>
            <div className="horarios-paginacion-controles">
              <button
                className="icon-button"
                type="button"
                aria-label="Página anterior"
                title="Página anterior"
                disabled={paginaVisible <= 1}
                onClick={() => setPagina(paginaVisible - 1)}
              >
                <ChevronLeft size={17} aria-hidden="true" />
              </button>
              <span>Página {paginaVisible} de {totalPaginas}</span>
              <button
                className="icon-button"
                type="button"
                aria-label="Página siguiente"
                title="Página siguiente"
                disabled={paginaVisible >= totalPaginas}
                onClick={() => setPagina(paginaVisible + 1)}
              >
                <ChevronRight size={17} aria-hidden="true" />
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
