import { useState } from "react";
import { Save, X } from "lucide-react";

export default function MedicoEdicionForm({ medico, guardando, onGuardar, onCancelar }) {
  const [nombre, setNombre] = useState(medico.nombre || "");
  const [telefono, setTelefono] = useState(medico.telefono || "");

  const enviarFormulario = (event) => {
    event.preventDefault();
    onGuardar({ nombre: nombre.trim(), telefono: telefono.trim() });
  };

  return (
    <section className="surface medicos-edicion" aria-labelledby="editar-medico-titulo">
      <div className="medicos-edicion-cabecera">
        <div>
          <h2 id="editar-medico-titulo">Editar médico</h2>
          <p>Actualiza el nombre y el teléfono de {medico.nombre}.</p>
        </div>
      </div>
      <form className="clinic-form medicos-edicion-form" onSubmit={enviarFormulario}>
        <div>
          <label className="form-label" htmlFor="editar-medico-nombre">
            Nombre
          </label>
          <input
            id="editar-medico-nombre"
            className="form-control"
            type="text"
            value={nombre}
            onChange={(event) => setNombre(event.target.value)}
            required
          />
        </div>
        <div>
          <label className="form-label" htmlFor="editar-medico-telefono">
            Teléfono
          </label>
          <input
            id="editar-medico-telefono"
            className="form-control"
            type="text"
            value={telefono}
            onChange={(event) => setTelefono(event.target.value)}
          />
        </div>
        <div className="medicos-edicion-acciones">
          <button className="btn btn-primary" type="submit" disabled={guardando || !nombre.trim()}>
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
