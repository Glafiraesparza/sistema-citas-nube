import { useState } from "react";
import { Save, X } from "lucide-react";

import { ymd } from "../utils/formato";

export default function PacienteEdicionForm({ paciente, guardando, onGuardar, onCancelar }) {
  const [telefono, setTelefono] = useState(paciente.telefono || "");
  const [fechaNacimiento, setFechaNacimiento] = useState(ymd(paciente.fechaNacimiento));

  const enviarFormulario = (event) => {
    event.preventDefault();
    onGuardar({
      telefono: telefono.trim() || null,
      fechaNacimiento: fechaNacimiento || null
    });
  };

  return (
    <section className="surface pacientes-edicion" aria-labelledby="editar-paciente-titulo">
      <div className="pacientes-edicion-cabecera">
        <div>
          <h2 id="editar-paciente-titulo">Editar paciente</h2>
          <p>Actualiza los datos de {paciente.usuario?.nombre || "este paciente"}.</p>
        </div>
      </div>
      <form className="clinic-form pacientes-edicion-form" onSubmit={enviarFormulario}>
        <div>
          <label className="form-label" htmlFor="editar-paciente-telefono">
            Teléfono
          </label>
          <input
            id="editar-paciente-telefono"
            className="form-control"
            type="tel"
            value={telefono}
            onChange={(event) => setTelefono(event.target.value)}
          />
        </div>
        <div>
          <label className="form-label" htmlFor="editar-paciente-fecha">
            Fecha de nacimiento
          </label>
          <input
            id="editar-paciente-fecha"
            className="form-control"
            type="date"
            value={fechaNacimiento}
            onChange={(event) => setFechaNacimiento(event.target.value)}
          />
        </div>
        <div className="pacientes-edicion-acciones">
          <button className="btn btn-primary" type="submit" disabled={guardando}>
            <Save size={15} aria-hidden="true" />
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
          <button className="btn btn-light" type="button" onClick={onCancelar} disabled={guardando}>
            <X size={15} aria-hidden="true" />
            Cancelar
          </button>
        </div>
      </form>
    </section>
  );
}
