import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ClipboardList,
  Pencil,
  RotateCcw,
  Search
} from "lucide-react";

import StatusBadge from "./StatusBadge";
import { fechaLegible, horaLegible } from "../utils/formato";

const TAMANOS_PAGINA = [5, 10, 20];

export default function PacientesListado({ pacientes = [], citas = [], onEditar }) {
  const [busqueda, setBusqueda] = useState("");
  const [telefonoFiltro, setTelefonoFiltro] = useState("");
  const [orden, setOrden] = useState("asc");
  const [pagina, setPagina] = useState(1);
  const [tamanoPagina, setTamanoPagina] = useState(5);
  const [historialAbierto, setHistorialAbierto] = useState(null);

  const citasPorPaciente = useMemo(() => {
    return citas.reduce((grupos, cita) => {
      const pacienteId = Number(cita.pacienteId);
      const lista = grupos.get(pacienteId) || [];
      lista.push(cita);
      grupos.set(pacienteId, lista);
      return grupos;
    }, new Map());
  }, [citas]);

  const pacientesFiltrados = useMemo(() => {
    const consulta = busqueda.trim().toLocaleLowerCase("es");

    return pacientes
      .filter((paciente) => {
        const datosBusqueda = [
          paciente.usuario?.nombre,
          paciente.usuario?.email,
          paciente.telefono
        ].filter(Boolean);
        const coincideBusqueda =
          !consulta ||
          datosBusqueda.some((dato) =>
            dato.toLocaleLowerCase("es").includes(consulta)
          );
        const tieneTelefono = Boolean(paciente.telefono?.trim());
        const coincideTelefono =
          !telefonoFiltro ||
          (telefonoFiltro === "con" && tieneTelefono) ||
          (telefonoFiltro === "sin" && !tieneTelefono);

        return coincideBusqueda && coincideTelefono;
      })
      .sort((a, b) => {
        const nombreA = a.usuario?.nombre || "";
        const nombreB = b.usuario?.nombre || "";
        const comparacion = nombreA.localeCompare(nombreB, "es", {
          sensitivity: "base"
        });
        return comparacion * (orden === "asc" ? 1 : -1);
      });
  }, [busqueda, orden, pacientes, telefonoFiltro]);

  const totalPaginas = Math.ceil(pacientesFiltrados.length / tamanoPagina);
  const paginaVisible = Math.min(pagina, Math.max(totalPaginas, 1));
  const inicio = (paginaVisible - 1) * tamanoPagina;
  const pacientesPagina = pacientesFiltrados.slice(inicio, inicio + tamanoPagina);
  const hayFiltrosActivos = Boolean(busqueda || telefonoFiltro);

  const limpiarFiltros = () => {
    setBusqueda("");
    setTelefonoFiltro("");
    setPagina(1);
  };

  const obtenerHistorial = (pacienteId) =>
    [...(citasPorPaciente.get(Number(pacienteId)) || [])].sort((a, b) => {
      const fechaHoraA = `${String(a.fecha).substring(0, 10)}T${horaLegible(a.hora)}`;
      const fechaHoraB = `${String(b.fecha).substring(0, 10)}T${horaLegible(b.hora)}`;
      return fechaHoraB.localeCompare(fechaHoraA);
    });

  return (
    <section className="surface pacientes-listado" aria-label="Lista de pacientes">
      <div className="pacientes-filtros">
        <div className="pacientes-control pacientes-busqueda">
          <label className="form-label" htmlFor="pacientes-busqueda">
            Buscar
          </label>
          <div className="pacientes-search-input">
            <Search size={17} aria-hidden="true" />
            <input
              id="pacientes-busqueda"
              className="form-control"
              type="search"
              placeholder="Nombre, correo o teléfono"
              value={busqueda}
              onChange={(event) => {
                setBusqueda(event.target.value);
                setPagina(1);
              }}
            />
          </div>
        </div>

        <div className="pacientes-control">
          <label className="form-label" htmlFor="pacientes-telefono">
            Teléfono
          </label>
          <select
            id="pacientes-telefono"
            className="form-select"
            value={telefonoFiltro}
            onChange={(event) => {
              setTelefonoFiltro(event.target.value);
              setPagina(1);
            }}
          >
            <option value="">Todos</option>
            <option value="con">Con teléfono</option>
            <option value="sin">Sin teléfono</option>
          </select>
        </div>

        <div className="pacientes-control">
          <label className="form-label" htmlFor="pacientes-orden">
            Orden alfabético
          </label>
          <select
            id="pacientes-orden"
            className="form-select"
            value={orden}
            onChange={(event) => {
              setOrden(event.target.value);
              setPagina(1);
            }}
          >
            <option value="asc">A a Z</option>
            <option value="desc">Z a A</option>
          </select>
        </div>

        <button
          className="btn btn-light pacientes-limpiar"
          type="button"
          onClick={limpiarFiltros}
          disabled={!hayFiltrosActivos}
        >
          <RotateCcw size={15} aria-hidden="true" />
          Limpiar filtros
        </button>
      </div>

      <div className="pacientes-resultados-barra">
        <p className="pacientes-conteo" aria-live="polite">
          {pacientesFiltrados.length}{" "}
          {pacientesFiltrados.length === 1 ? "paciente encontrado" : "pacientes encontrados"}
        </p>
        <div className="pacientes-tamano-control">
          <label className="form-label" htmlFor="pacientes-tamano">
            Por página
          </label>
          <select
            id="pacientes-tamano"
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

      {pacientesPagina.length === 0 ? (
        <div className="empty-state pacientes-vacio">
          {pacientes.length === 0 ? (
            <p>No hay pacientes registrados.</p>
          ) : (
            <>
              <p>No hay pacientes que coincidan con los filtros seleccionados.</p>
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
          <div className="table-wrap pacientes-tabla-wrap">
            <table className="table table-hover clinic-table pacientes-tabla">
              <thead>
                <tr>
                  <th scope="col">Paciente</th>
                  <th scope="col">Correo electrónico</th>
                  <th scope="col">Teléfono</th>
                  <th scope="col">Fecha de nacimiento</th>
                  <th scope="col">Citas</th>
                  <th scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pacientesPagina.map((paciente) => {
                  const historial = obtenerHistorial(paciente.id);
                  const expandido = historialAbierto === paciente.id;

                  return (
                    <FragmentoPaciente
                      key={paciente.id}
                      paciente={paciente}
                      historial={historial}
                      expandido={expandido}
                      onEditar={() => onEditar(paciente)}
                      onAlternarHistorial={() =>
                        setHistorialAbierto(expandido ? null : paciente.id)
                      }
                    />
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="pacientes-paginacion">
            <span>
              Mostrando {inicio + 1}–
              {Math.min(inicio + tamanoPagina, pacientesFiltrados.length)} de {pacientesFiltrados.length}
            </span>
            <div className="pacientes-paginacion-controles">
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

function FragmentoPaciente({ paciente, historial, expandido, onEditar, onAlternarHistorial }) {
  return (
    <>
      <tr>
        <td><strong className="pacientes-nombre">{paciente.usuario?.nombre || "Sin nombre"}</strong></td>
        <td>{paciente.usuario?.email || "Sin correo"}</td>
        <td>{paciente.telefono || "Sin teléfono"}</td>
        <td>{paciente.fechaNacimiento ? fechaLegible(paciente.fechaNacimiento) : "Sin registrar"}</td>
        <td>{historial.length}</td>
        <td>
          <div className="pacientes-acciones">
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
              onClick={onAlternarHistorial}
            >
              <ClipboardList size={14} aria-hidden="true" />
              Historial
              {expandido ? <ChevronUp size={14} aria-hidden="true" /> : <ChevronDown size={14} aria-hidden="true" />}
            </button>
          </div>
        </td>
      </tr>
      {expandido && (
        <tr className="pacientes-historial-row">
          <td colSpan="6">
            <div className="pacientes-historial">
              <strong>Historial de {paciente.usuario?.nombre || "paciente"}</strong>
              {historial.length === 0 ? (
                <p>No hay citas registradas para este paciente.</p>
              ) : (
                <div className="table-wrap">
                  <table className="table clinic-table pacientes-historial-tabla">
                    <thead>
                      <tr>
                        <th scope="col">Fecha</th>
                        <th scope="col">Hora</th>
                        <th scope="col">Médico</th>
                        <th scope="col">Estado</th>
                        <th scope="col">Motivo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historial.map((cita) => (
                        <tr key={cita.id}>
                          <td>{fechaLegible(cita.fecha)}</td>
                          <td>{horaLegible(cita.hora)}</td>
                          <td>{cita.medico?.nombre || "Sin médico"}</td>
                          <td><StatusBadge estado={cita.estado} /></td>
                          <td>{cita.motivo || "Sin motivo"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
