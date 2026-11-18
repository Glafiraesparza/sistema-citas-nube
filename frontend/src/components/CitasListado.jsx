import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Search
} from "lucide-react";

import StatusBadge from "./StatusBadge";
import { fechaLegible, horaLegible } from "../utils/formato";

const FILTROS_INICIALES = {
  busqueda: "",
  estado: "",
  medicoId: "",
  desde: "",
  hasta: ""
};

const TAMANOS_PAGINA = [5, 10, 20];

export default function CitasListado({
  citas = [],
  medicos = [],
  rol,
  onReprogramar,
  onAtender,
  onCancelar
}) {
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [orden, setOrden] = useState("asc");
  const [pagina, setPagina] = useState(1);
  const [tamanoPagina, setTamanoPagina] = useState(5);

  const opcionesMedicos = useMemo(() => {
    const medicosUnicos = new Map();

    [...medicos, ...citas.map((cita) => cita.medico).filter(Boolean)].forEach(
      (medico) => medicosUnicos.set(medico.id, medico)
    );

    return [...medicosUnicos.values()].sort((a, b) =>
      a.nombre.localeCompare(b.nombre, "es")
    );
  }, [citas, medicos]);

  const citasFiltradas = useMemo(() => {
    const consulta = filtros.busqueda.trim().toLocaleLowerCase("es");

    return citas
      .filter((cita) => {
        const fecha = String(cita.fecha).substring(0, 10);
        const texto = [
          cita.paciente?.usuario?.nombre,
          cita.medico?.nombre,
          cita.motivo
        ]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase("es");

        return (
          (!consulta || texto.includes(consulta)) &&
          (!filtros.estado || cita.estado === filtros.estado) &&
          (!filtros.medicoId || String(cita.medicoId) === filtros.medicoId) &&
          (!filtros.desde || fecha >= filtros.desde) &&
          (!filtros.hasta || fecha <= filtros.hasta)
        );
      })
      .sort((a, b) => {
        const fechaHoraA = `${String(a.fecha).substring(0, 10)}T${horaLegible(a.hora)}`;
        const fechaHoraB = `${String(b.fecha).substring(0, 10)}T${horaLegible(b.hora)}`;
        return fechaHoraA.localeCompare(fechaHoraB) * (orden === "asc" ? 1 : -1);
      });
  }, [citas, filtros, orden]);

  const totalPaginas = Math.ceil(citasFiltradas.length / tamanoPagina);
  const paginaVisible = Math.min(pagina, Math.max(totalPaginas, 1));
  const inicio = (paginaVisible - 1) * tamanoPagina;
  const citasPagina = citasFiltradas.slice(inicio, inicio + tamanoPagina);
  const hayFiltrosActivos = Object.values(filtros).some(Boolean);

  const actualizarFiltro = (nombre, valor) => {
    setFiltros((actuales) => ({ ...actuales, [nombre]: valor }));
    setPagina(1);
  };

  const limpiarFiltros = () => {
    setFiltros(FILTROS_INICIALES);
    setPagina(1);
  };

  return (
    <section className="surface citas-listado" aria-label="Listado de citas">
      <div className="citas-filtros">
        <div className="citas-control citas-busqueda">
          <label className="form-label" htmlFor="citas-busqueda">
            Buscar
          </label>
          <div className="citas-search-input">
            <Search size={17} aria-hidden="true" />
            <input
              id="citas-busqueda"
              className="form-control"
              type="search"
              placeholder="Paciente, médico o motivo"
              value={filtros.busqueda}
              onChange={(e) => actualizarFiltro("busqueda", e.target.value)}
            />
          </div>
        </div>

        <div className="citas-control">
          <label className="form-label" htmlFor="citas-estado">
            Estado
          </label>
          <select
            id="citas-estado"
            className="form-select"
            value={filtros.estado}
            onChange={(e) => actualizarFiltro("estado", e.target.value)}
          >
            <option value="">Todas</option>
            <option value="PROGRAMADA">Programadas</option>
            <option value="ATENDIDA">Atendidas</option>
            <option value="CANCELADA">Canceladas</option>
          </select>
        </div>

        <div className="citas-control">
          <label className="form-label" htmlFor="citas-medico">
            Médico
          </label>
          <select
            id="citas-medico"
            className="form-select"
            value={filtros.medicoId}
            onChange={(e) => actualizarFiltro("medicoId", e.target.value)}
          >
            <option value="">Todos</option>
            {opcionesMedicos.map((medico) => (
              <option key={medico.id} value={medico.id}>
                {medico.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="citas-control">
          <label className="form-label" htmlFor="citas-desde">
            Desde
          </label>
          <input
            id="citas-desde"
            className="form-control"
            type="date"
            value={filtros.desde}
            max={filtros.hasta || undefined}
            onChange={(e) => actualizarFiltro("desde", e.target.value)}
          />
        </div>

        <div className="citas-control">
          <label className="form-label" htmlFor="citas-hasta">
            Hasta
          </label>
          <input
            id="citas-hasta"
            className="form-control"
            type="date"
            value={filtros.hasta}
            min={filtros.desde || undefined}
            onChange={(e) => actualizarFiltro("hasta", e.target.value)}
          />
        </div>

        <div className="citas-limpiar-wrap">
          <button
            className="btn btn-light citas-limpiar"
            type="button"
            onClick={limpiarFiltros}
            disabled={!hayFiltrosActivos}
          >
            <RotateCcw size={15} aria-hidden="true" />
            Limpiar filtros
          </button>
        </div>
      </div>

      <div className="citas-resultados-barra">
        <p className="citas-conteo" aria-live="polite">
          {citasFiltradas.length} {citasFiltradas.length === 1 ? "resultado" : "resultados"}
        </p>
        <div className="citas-opciones-listado">
          <div className="citas-opcion">
            <label className="form-label" htmlFor="citas-orden">
              Orden
            </label>
            <select
              id="citas-orden"
              className="form-select form-select-sm"
              value={orden}
              onChange={(e) => {
                setOrden(e.target.value);
                setPagina(1);
              }}
            >
              <option value="asc">Fecha y hora: próximas primero</option>
              <option value="desc">Fecha y hora: más lejanas primero</option>
            </select>
          </div>
          <div className="citas-opcion citas-tamano">
            <label className="form-label" htmlFor="citas-tamano">
              Por página
            </label>
            <select
              id="citas-tamano"
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
      </div>

      {citasPagina.length === 0 ? (
        <div className="empty-state citas-vacio">
          {citas.length === 0 ? (
            <p>No hay citas registradas.</p>
          ) : (
            <>
              <p>No hay citas que coincidan con los filtros seleccionados.</p>
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
          <div className="table-wrap citas-tabla-wrap">
            <table className="table table-hover clinic-table citas-tabla">
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Paciente</th>
                  <th scope="col">Médico</th>
                  <th scope="col">Fecha</th>
                  <th scope="col">Hora</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Motivo</th>
                  <th scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {citasPagina.map((cita) => (
                  <tr key={cita.id}>
                    <td>#{cita.id}</td>
                    <td>{cita.paciente?.usuario?.nombre || "Sin nombre"}</td>
                    <td>{cita.medico?.nombre || "Sin médico"}</td>
                    <td>{fechaLegible(cita.fecha)}</td>
                    <td>{horaLegible(cita.hora)}</td>
                    <td><StatusBadge estado={cita.estado} /></td>
                    <td>{cita.motivo || "Sin motivo"}</td>
                    <td>
                      {cita.estado === "PROGRAMADA" && (
                        <div className="citas-acciones">
                          {rol === "ADMIN" && (
                            <>
                              <button
                                className="btn btn-sm btn-primary"
                                type="button"
                                onClick={() => onReprogramar(cita)}
                              >
                                Reprogramar
                              </button>
                              <button
                                className="btn btn-sm btn-success"
                                type="button"
                                onClick={() => onAtender(cita.id)}
                              >
                                Marcar atendida
                              </button>
                            </>
                          )}
                          {(rol === "ADMIN" || rol === "PACIENTE") && (
                            <button
                              className="btn btn-sm btn-warning"
                              type="button"
                              onClick={() => onCancelar(cita.id)}
                            >
                              Cancelar cita
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="citas-paginacion">
            <span>
              Mostrando {inicio + 1}–{Math.min(inicio + tamanoPagina, citasFiltradas.length)} de {citasFiltradas.length}
            </span>
            <div className="citas-paginacion-controles">
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