import { useMemo, useState } from "react";
import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Pencil,
  RotateCcw,
  Search
} from "lucide-react";

import { DIAS, nombreDia } from "../utils/formato";

const TAMANOS_PAGINA = [5, 10, 20];

export default function MedicosListado({ medicos = [], horarios = [], onEditar }) {
  const [busqueda, setBusqueda] = useState("");
  const [diaSeleccionado, setDiaSeleccionado] = useState("");
  const [orden, setOrden] = useState("asc");
  const [pagina, setPagina] = useState(1);
  const [tamanoPagina, setTamanoPagina] = useState(5);
  const [horarioAbierto, setHorarioAbierto] = useState(null);

  const horariosPorMedico = useMemo(() => {
    return horarios.reduce((grupos, horario) => {
      const lista = grupos.get(Number(horario.medicoId)) || [];
      lista.push(horario);
      grupos.set(Number(horario.medicoId), lista);
      return grupos;
    }, new Map());
  }, [horarios]);

  const medicosFiltrados = useMemo(() => {
    const consulta = busqueda.trim().toLocaleLowerCase("es");

    return medicos
      .filter((medico) => {
        const coincideBusqueda =
          !consulta ||
          [medico.nombre, medico.telefono]
            .filter(Boolean)
            .some((dato) => dato.toLocaleLowerCase("es").includes(consulta));
        const horariosMedico = horariosPorMedico.get(Number(medico.id)) || [];
        const coincideDia =
          !diaSeleccionado ||
          horariosMedico.some(
            (horario) => String(horario.diaSemana) === diaSeleccionado
          );

        return coincideBusqueda && coincideDia;
      })
      .sort((a, b) => {
        const comparacion = a.nombre.localeCompare(b.nombre, "es", {
          sensitivity: "base"
        });
        return comparacion * (orden === "asc" ? 1 : -1);
      });
  }, [busqueda, diaSeleccionado, horariosPorMedico, medicos, orden]);

  const totalPaginas = Math.ceil(medicosFiltrados.length / tamanoPagina);
  const paginaVisible = Math.min(pagina, Math.max(totalPaginas, 1));
  const inicio = (paginaVisible - 1) * tamanoPagina;
  const medicosPagina = medicosFiltrados.slice(inicio, inicio + tamanoPagina);
  const hayFiltrosActivos = Boolean(busqueda || diaSeleccionado);

  const limpiarFiltros = () => {
    setBusqueda("");
    setDiaSeleccionado("");
    setPagina(1);
  };

  const obtenerHorarios = (medicoId) =>
    [...(horariosPorMedico.get(Number(medicoId)) || [])].sort(
      (a, b) =>
        Number(a.diaSemana) - Number(b.diaSemana) ||
        a.horaInicio.localeCompare(b.horaInicio)
    );

  return (
    <section className="surface medicos-listado" aria-label="Directorio de médicos">
      <div className="medicos-filtros">
        <div className="medicos-control medicos-busqueda">
          <label className="form-label" htmlFor="medicos-busqueda">
            Buscar
          </label>
          <div className="medicos-search-input">
            <Search size={17} aria-hidden="true" />
            <input
              id="medicos-busqueda"
              className="form-control"
              type="search"
              placeholder="Nombre o teléfono"
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPagina(1);
              }}
            />
          </div>
        </div>

        <div className="medicos-control">
          <label className="form-label" htmlFor="medicos-dia">
            Día de atención
          </label>
          <select
            id="medicos-dia"
            className="form-select"
            value={diaSeleccionado}
            onChange={(e) => {
              setDiaSeleccionado(e.target.value);
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

        <div className="medicos-control">
          <label className="form-label" htmlFor="medicos-orden">
            Orden alfabético
          </label>
          <select
            id="medicos-orden"
            className="form-select"
            value={orden}
            onChange={(e) => {
              setOrden(e.target.value);
              setPagina(1);
            }}
          >
            <option value="asc">A a Z</option>
            <option value="desc">Z a A</option>
          </select>
        </div>

        <button
          className="btn btn-light medicos-limpiar"
          type="button"
          onClick={limpiarFiltros}
          disabled={!hayFiltrosActivos}
        >
          <RotateCcw size={15} aria-hidden="true" />
          Limpiar filtros
        </button>
      </div>

      <div className="medicos-resultados-barra">
        <p className="medicos-conteo" aria-live="polite">
          {medicosFiltrados.length}{" "}
          {medicosFiltrados.length === 1 ? "médico encontrado" : "médicos encontrados"}
        </p>
        <div className="medicos-tamano-control">
          <label className="form-label" htmlFor="medicos-tamano">
            Por página
          </label>
          <select
            id="medicos-tamano"
            className="form-select form-select-sm"
            value={tamanoPagina}
            onChange={(e) => {
              setTamanoPagina(Number(e.target.value));
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

      {medicosPagina.length === 0 ? (
        <div className="empty-state medicos-vacio">
          {medicos.length === 0 ? (
            <p>No hay médicos registrados.</p>
          ) : (
            <>
              <p>No hay médicos que coincidan con los filtros seleccionados.</p>
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
          <div className="table-wrap medicos-tabla-wrap">
            <table className="table table-hover clinic-table medicos-tabla">
              <thead>
                <tr>
                  <th scope="col">Médico</th>
                  <th scope="col">Teléfono</th>
                  <th scope="col">Días y horarios</th>
                  <th scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {medicosPagina.map((medico) => {
                  const horariosMedico = obtenerHorarios(medico.id);
                  const expandido = horarioAbierto === medico.id;

                  return (
                    <FragmentoMedico
                      key={medico.id}
                      medico={medico}
                      horarios={horariosMedico}
                      expandido={expandido}
                      onAlternarHorarios={() =>
                        setHorarioAbierto(expandido ? null : medico.id)
                      }
                      onEditar={() => onEditar(medico)}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="medicos-paginacion">
            <span>
              Mostrando {inicio + 1}–
              {Math.min(inicio + tamanoPagina, medicosFiltrados.length)} de {medicosFiltrados.length}
            </span>
            <div className="medicos-paginacion-controles">
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

function FragmentoMedico({ medico, horarios, expandido, onAlternarHorarios, onEditar }) {
  return (
    <>
      <tr>
        <td><strong className="medicos-nombre">{medico.nombre}</strong></td>
        <td>{medico.telefono || "Sin teléfono"}</td>
        <td>
          {horarios.length > 0 ? (
            <div className="medicos-horarios-resumen">
              {horarios.map((horario) => (
                <span className="medico-horario-chip" key={horario.id}>
                  {nombreDia(horario.diaSemana)} {horario.horaInicio}–{horario.horaFin}
                </span>
              ))}
            </div>
          ) : (
            <span className="medicos-sin-horario">Sin horarios registrados</span>
          )}
        </td>
        <td>
          <div className="medicos-acciones">
            <button
              className="btn btn-sm btn-primary"
              type="button"
              onClick={onEditar}
            >
              <Pencil size={14} aria-hidden="true" />
              Editar
            </button>
            <button
              className="btn btn-sm btn-light"
              type="button"
              aria-expanded={expandido}
              onClick={onAlternarHorarios}
            >
              <CalendarClock size={14} aria-hidden="true" />
              {expandido ? "Ocultar" : "Ver horarios"}
            </button>
          </div>
        </td>
      </tr>
      {expandido && (
        <tr className="medicos-detalle-row">
          <td colSpan="4">
            <div className="medicos-detalle-horarios">
              <strong>Horario semanal de {medico.nombre}</strong>
              {horarios.length > 0 ? (
                <ul>
                  {horarios.map((horario) => (
                    <li key={horario.id}>
                      <span>{nombreDia(horario.diaSemana)}</span>
                      <span>{horario.horaInicio}–{horario.horaFin}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No tiene horarios de atención asociados.</p>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
