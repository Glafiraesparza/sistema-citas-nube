import {
  CalendarClock,
  Clock3,
  HeartPulse,
  LayoutDashboard,
  Stethoscope,
  Users
} from "lucide-react";

const ENLACES = [
  { id: "dashboard", etiqueta: "Inicio", icono: LayoutDashboard, roles: ["ADMIN", "PACIENTE"] },
  { id: "citas", etiqueta: "Citas", icono: CalendarClock, roles: ["ADMIN", "PACIENTE"] },
  { id: "medicos", etiqueta: "Médicos", icono: Stethoscope, roles: ["ADMIN"] },
  { id: "pacientes", etiqueta: "Pacientes", icono: Users, roles: ["ADMIN"] },
  { id: "horarios", etiqueta: "Horarios", icono: Clock3, roles: ["ADMIN"] }
];

export default function Sidebar({ vista, rol, abierta, onNavigate }) {
  const enlaces = ENLACES.filter((enlace) => enlace.roles.includes(rol));

  return (
    <aside className={`sidebar ${abierta ? "abierta" : ""}`}>
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">
          <HeartPulse size={18} />
        </span>
        <span className="brand-name">Agenda clínica</span>
      </div>

      <nav className="sidebar-nav" aria-label="Secciones">
        {enlaces.map((enlace) => {
          const Icono = enlace.icono;
          const activa = vista === enlace.id;

          return (
            <button
              key={enlace.id}
              type="button"
              className={`nav-item ${activa ? "activa" : ""}`}
              aria-current={activa ? "page" : undefined}
              onClick={() => onNavigate(enlace.id)}
            >
              <Icono size={18} strokeWidth={1.75} />
              <span>{enlace.etiqueta}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
