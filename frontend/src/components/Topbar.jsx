import { LogOut, Menu } from "lucide-react";
import { etiquetaRol, iniciales } from "../utils/formato";

export default function Topbar({ usuario, onMenu, onCerrarSesion }) {
  return (
    <header className="topbar">
      <button
        type="button"
        className="icon-button menu-button"
        onClick={onMenu}
        aria-label="Abrir menú"
      >
        <Menu size={18} />
      </button>

      <div className="topbar-user">
        <span className="avatar" aria-hidden="true">
          {iniciales(usuario.nombre)}
        </span>
        <span className="user-meta">
          <strong>{usuario.nombre}</strong>
          <small>{etiquetaRol(usuario.rol)}</small>
        </span>
        <button type="button" className="btn btn-light btn-logout" onClick={onCerrarSesion}>
          <LogOut size={16} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </header>
  );
}
