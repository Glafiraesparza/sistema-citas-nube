import { useCallback, useEffect, useState } from "react";

import axios from "axios";

import Sidebar from "./components/Sidebar";

import Topbar from "./components/Topbar";

import Dashboard from "./components/Dashboard";

import ConfirmDialog from "./components/ConfirmDialog";

import CitasListado from "./components/CitasListado";

import {

  clasificarMensaje,

} from "./utils/formato";



const diasSemana = [

  { id: 1, nombre: "Lunes" },

  { id: 2, nombre: "Martes" },

  { id: 3, nombre: "Miércoles" },

  { id: 4, nombre: "Jueves" },

  { id: 5, nombre: "Viernes" },

  { id: 6, nombre: "Sábado" },

  { id: 0, nombre: "Domingo" }

];



function App() {

const [email, setEmail] = useState("");

const [password, setPassword] = useState("");

const [usuario, setUsuario] = useState(null);



const [medicos, setMedicos] = useState([]);

const [pacientes, setPacientes] = useState([]);

const [horarios, setHorarios] = useState([]);

const [citas, setCitas] = useState([]);



const [medicoIdCita, setMedicoIdCita] = useState("");

const [pacienteIdCita, setPacienteIdCita] = useState("");

const [fechaCita, setFechaCita] = useState("");

const [horaCita, setHoraCita] = useState("");

const [horariosDisponibles, setHorariosDisponibles] = useState([]);

const [motivoCita, setMotivoCita] = useState("");

const [mostrarFormularioCita, setMostrarFormularioCita] = useState(false);

const [citaReprogramar, setCitaReprogramar] = useState(null);

const [nuevaFecha, setNuevaFecha] = useState("");

const [nuevaHora, setNuevaHora] = useState("");

const [horariosReprogramacion, setHorariosReprogramacion] = useState([]);



const [vista, setVista] = useState("dashboard");

const [menuAbierto, setMenuAbierto] = useState(false);

const [cargandoPanel, setCargandoPanel] = useState(false);

const [confirmacion, setConfirmacion] = useState(null);

const [mostrarFormularioPaciente, setMostrarFormularioPaciente] = useState(false);



const [usuarioIdPaciente, setUsuarioIdPaciente] = useState("");

const [usuarios, setUsuarios] = useState([]);

const [telefonoPaciente, setTelefonoPaciente] = useState("");

const [fechaNacimientoPaciente, setFechaNacimientoPaciente] = useState("");



const [nombreMedico, setNombreMedico] = useState("");

const [telefonoMedico, setTelefonoMedico] = useState("");

const [diasMedico, setDiasMedico] = useState([]);

const [horaInicioMedico, setHoraInicioMedico] = useState("09:00");

const [horaFinMedico, setHoraFinMedico] = useState("18:00");

const [guardandoMedico, setGuardandoMedico] = useState(false);



const [mensaje, setMensaje] = useState("");



const fechaHoy = new Date().toLocaleDateString("en-CA");



const pedirConfirmacion = (titulo, texto) =>

    new Promise((resolve) => {

      setConfirmacion({

        titulo,

        texto,

        resolver: (valor) => {

          setConfirmacion(null);

          resolve(valor);

        }

      });

    });



const refrescarPanel = useCallback(async () => {

    if (!usuario) return;



    setCargandoPanel(true);

const token = sessionStorage.getItem("token");

const headers = { Authorization: `Bearer ${token}` };



    try {

const citasRes = await axios.get("http://localhost:3000/api/citas", { headers });

      setCitas(Array.isArray(citasRes.data) ? citasRes.data : []);

    } catch (error) {

      console.error(error);

      setMensaje(

        error.response?.data?.mensaje ||

        "Error al obtener las citas"

      );

    }



    if (usuario.rol === "ADMIN") {

      try {

const [medicosRes, pacientesRes, horariosRes] = await Promise.all([

          axios.get("http://localhost:3000/api/medicos", { headers }),

          axios.get("http://localhost:3000/api/pacientes", { headers }),

          axios.get("http://localhost:3000/api/horarios", { headers })

        ]);



        setMedicos(Array.isArray(medicosRes.data) ? medicosRes.data : []);

        setPacientes(Array.isArray(pacientesRes.data) ? pacientesRes.data : []);

        setHorarios(Array.isArray(horariosRes.data) ? horariosRes.data : []);

      } catch (error) {

        console.error(error);

        setMensaje(

          error.response?.data?.mensaje ||

          "Error al cargar el resumen"

        );

      }

    }



    setCargandoPanel(false);

  }, [usuario]);



  useEffect(() => {

    if (!usuario) return;

    refrescarPanel();

  }, [usuario, refrescarPanel]);



const iniciarSesion = async (e) => {

e.preventDefault();



    try {

const response = await axios.post(

        "http://localhost:3000/api/auth/login",

        {

          email,

          password

        }

      );



const token = response.data.token;



      sessionStorage.setItem("token", token);

      setUsuario(response.data.usuario);

      setMensaje("");



      console.log("JWT:", token);

      console.log("Usuario:", response.data.usuario);



    } catch (error) {

      console.error(error);



      setMensaje(

        error.response?.data?.mensaje ||

        "Error al iniciar sesión"

      );

    }

  };



const cargarMedicos = async () => {

    try {

const token = sessionStorage.getItem("token");



const response = await axios.get(

        "http://localhost:3000/api/medicos",

        {

          headers: {

            Authorization: `Bearer ${token}`

          }

        }

      );



      setMedicos(response.data);

      setVista("medicos");

      setMenuAbierto(false);

      setMensaje("");



    } catch (error) {

      console.error(error);



      setMensaje(

        error.response?.data?.mensaje ||

        "Error al obtener los médicos"

      );

    }

  };



const crearMedico = async (e) => {

e.preventDefault();



  if (diasMedico.length === 0) {

    setMensaje("Selecciona al menos un día de atención");

    return;

  }



  if (horaInicioMedico >= horaFinMedico) {

    setMensaje("La hora de inicio debe ser menor que la hora de fin");

    return;

  }



  setGuardandoMedico(true);



let medicoCreado = null;



  try {

const token = sessionStorage.getItem("token");



// 1. Crear el médico

const responseMedico = await axios.post(

      "http://localhost:3000/api/medicos",

      {

        nombre: nombreMedico,

        telefono: telefonoMedico

      },

      {

        headers: {

          Authorization: `Bearer ${token}`

        }

      }

    );



    medicoCreado = responseMedico.data.medico;



// 2. Registrar los horarios del médico

const resultados = await Promise.allSettled(

      diasMedico.map((dia) =>

        axios.post(

          "http://localhost:3000/api/horarios",

          {

            medicoId: medicoCreado.id,

            diaSemana: dia,

            horaInicio: horaInicioMedico,

            horaFin: horaFinMedico

          },

          {

            headers: {

              Authorization: `Bearer ${token}`

            }

          }

        )

      )

    );



const exitosos = resultados.filter(

      (resultado) => resultado.status === "fulfilled"

    ).length;



const fallidos = resultados.length - exitosos;



// 3. Actualizar la lista de médicos

const response = await axios.get(

      "http://localhost:3000/api/medicos",

      {

        headers: {

          Authorization: `Bearer ${token}`

        }

      }

    );



    setMedicos(response.data);



    if (fallidos > 0) {

      setMensaje(

        `Médico creado correctamente (ID ${medicoCreado.id}). ` +

        `Se registraron ${exitosos} horarios y fallaron ${fallidos}. ` +

        "Revisa los horarios antes de intentar agregarlos nuevamente."

      );

      return;

    }



// 4. Limpiar el formulario si todo se guardó

    setNombreMedico("");

    setTelefonoMedico("");

    setDiasMedico([]);

    setHoraInicioMedico("09:00");

    setHoraFinMedico("18:00");



    setMensaje("Médico y horarios registrados correctamente");



  } catch (error) {

    console.error(error);



    setMensaje(

      medicoCreado

        ? `El médico fue creado con ID ${medicoCreado.id}, ` +

          "pero no se pudo completar la operación. " +

          "Comprueba sus horarios antes de volver a intentarlo."

        : error.response?.data?.mensaje || "Error al crear el médico"

    );



  } finally {

    setGuardandoMedico(false);

  }

};



const cargarUsuariosDisponibles = async () => {

  try {

const token = sessionStorage.getItem("token");



const response = await axios.get(

      "http://localhost:3000/api/auth/usuarios-disponibles",

      {

        headers: {

          Authorization: `Bearer ${token}`

        }

      }

    );



    setUsuarios(response.data);



  } catch (error) {

    console.error("Error al cargar usuarios:", error);



    setMensaje(

      error.response?.data?.mensaje ||

      "Error al cargar los usuarios disponibles"

    );

  }

};



const cargarPacientes = async () => {

    try {

const token = sessionStorage.getItem("token");



const response = await axios.get(

        "http://localhost:3000/api/pacientes",

        {

          headers: {

            Authorization: `Bearer ${token}`

          }

        }

      );



      setPacientes(response.data);

      setVista("pacientes");

      setMenuAbierto(false);

      setMensaje("");



    } catch (error) {

      console.error(error);



      setMensaje(

        error.response?.data?.mensaje ||

        "Error al obtener los pacientes"

      );

    }

  };



const crearPaciente = async (e) => {

    e.preventDefault();



    if (!usuarioIdPaciente) {

      setMensaje("Debes seleccionar un usuario");

      return;

    }



    try {

const token = sessionStorage.getItem("token");



// Registrar al paciente con el ID del usuario seleccionado

      await axios.post(

        "http://localhost:3000/api/pacientes",

        {

          usuarioId: Number(usuarioIdPaciente),

          telefono: telefonoPaciente,

          fechaNacimiento: fechaNacimientoPaciente || null

        },

        {

          headers: {

            Authorization: `Bearer ${token}`

          }

        }

      );



// Limpiar los campos del formulario

      setUsuarioIdPaciente("");

      setTelefonoPaciente("");

      setFechaNacimientoPaciente("");



// Actualizar la lista de pacientes

const response = await axios.get(

        "http://localhost:3000/api/pacientes",

        {

          headers: {

            Authorization: `Bearer ${token}`

          }

        }

      );



      setPacientes(response.data);



// Actualizar las secciones visibles

      setVista("pacientes");

      setMenuAbierto(false);

      setMostrarFormularioPaciente(false);



// Mostrar confirmación

      setMensaje("Paciente creado correctamente");



    } catch (error) {

      console.error("Error al crear paciente:", error);



      setMensaje(

        error.response?.data?.mensaje ||

        "Error al crear el paciente"

      );

    }

  };



const cargarHorarios = async () => {

    try {

const token = sessionStorage.getItem("token");



const response = await axios.get(

        "http://localhost:3000/api/horarios",

        {

          headers: {

            Authorization: `Bearer ${token}`

          }

        }

      );



      setHorarios(response.data);

      setVista("horarios");

      setMenuAbierto(false);

      setMensaje("");



    } catch (error) {

      console.error(error);



      setMensaje(

        error.response?.data?.mensaje ||

        "Error al obtener los horarios"

      );

    }

  };



const cargarCitas = async ({ mostrar = false } = {}) => {

    try {

const token = sessionStorage.getItem("token");



const response = await axios.get(

        "http://localhost:3000/api/citas",

        {

          headers: {

            Authorization: `Bearer ${token}`

          }

        }

      );



      setCitas(response.data);

      if (mostrar) {

        setVista("citas");

        setMenuAbierto(false);

      }

      setMensaje("");



    } catch (error) {

      console.error(error);



      setMensaje(

        error.response?.data?.mensaje ||

        "Error al obtener las citas"

      );

    }

  };



const cargarDisponibilidad = async (medicoId, fecha) => {

// Limpiar el horario seleccionado

  setHoraCita("");

  setHorariosDisponibles([]);



  if (!medicoId || !fecha) {

    return;

  }



  try {

const token = sessionStorage.getItem("token");



const response = await axios.get(

      "http://localhost:3000/api/citas/disponibilidad",

      {

        params: {

          medicoId: Number(medicoId),

          fecha: fecha

        },

        headers: {

          Authorization: `Bearer ${token}`

        }

      }

    );



    setHorariosDisponibles(

      response.data.horariosDisponibles || []

    );



  } catch (error) {

    console.error(error);



    setMensaje(

      error.response?.data?.mensaje ||

      "Error al consultar los horarios disponibles"

    );

  }

};



const crearCita = async (e) => {

  e.preventDefault();



  try {

const token = sessionStorage.getItem("token");



let pacienteId;



    if (usuario.rol === "ADMIN") {

// El administrador selecciona al paciente

      if (!pacienteIdCita) {

        setMensaje("Selecciona un paciente");

        return;

      }



      pacienteId = Number(pacienteIdCita);



    } else if (usuario.rol === "PACIENTE") {

// Buscar el paciente asociado al usuario autenticado

const pacienteResponse = await axios.get(

        "http://localhost:3000/api/pacientes",

        {

          headers: {

            Authorization: `Bearer ${token}`

          }

        }

      );



const paciente = pacienteResponse.data.find(

        (p) => p.usuarioId === usuario.id

      );



      if (!paciente) {

        setMensaje("No tienes un registro de paciente");

        return;

      }



      pacienteId = paciente.id;



    } else {

      setMensaje("No tienes permisos para agendar citas");

      return;

    }



    await axios.post(

      "http://localhost:3000/api/citas",

      {

        pacienteId,

        medicoId: Number(medicoIdCita),

        fecha: fechaCita,

        hora: horaCita,

        motivo: motivoCita

      },

      {

        headers: {

          Authorization: `Bearer ${token}`

        }

      }

    );



// Limpiar formulario

    setPacienteIdCita("");

    setMedicoIdCita("");

    setFechaCita("");

    setHoraCita("");

    setHorariosDisponibles([]);

    setMotivoCita("");

    setMostrarFormularioCita(false);



// Actualizar tabla

    await cargarCitas();



    setMensaje("Cita creada correctamente");



  } catch (error) {

    console.error(error);



    setMensaje(

      error.response?.data?.mensaje ||

      "Error al crear la cita"

    );

  }

};



const cancelarCita = async (id) => {

const confirmar = await pedirConfirmacion(

      "Cancelar cita",

      "¿Estás seguro de que deseas cancelar esta cita?"

    );



    if (!confirmar) return;



    try {

const token = sessionStorage.getItem("token");



      await axios.put(

        `http://localhost:3000/api/citas/${id}`,

        {

          estado: "CANCELADA"

        },

        {

          headers: {

            Authorization: `Bearer ${token}`

          }

        }

      );



      await cargarCitas();



      setMensaje("Cita cancelada correctamente");



    } catch (error) {

      console.error(error);



      setMensaje(

        error.response?.data?.mensaje ||

        "Error al cancelar la cita"

      );

    }

  };



const marcarCitaAtendida = async (id) => {

const confirmar = await pedirConfirmacion(

    "Marcar como atendida",

    "¿Confirmas que esta cita ya fue atendida? Esta acción no se puede deshacer."

  );



  if (!confirmar) return;



  try {

const token = sessionStorage.getItem("token");



    await axios.put(

      `http://localhost:3000/api/citas/${id}`,

      {

        estado: "ATENDIDA"

      },

      {

        headers: {

          Authorization: `Bearer ${token}`

        }

      }

    );



    await cargarCitas();



    setMensaje("Cita marcada como atendida correctamente");



  } catch (error) {

    console.error(error);



    setMensaje(

      error.response?.data?.mensaje ||

      "Error al marcar la cita como atendida"

    );

  }

};



const abrirReprogramacion = (cita) => {

  setCitaReprogramar(cita);

  setNuevaFecha("");

  setNuevaHora("");

  setHorariosReprogramacion([]);

  setMensaje("");

};



const consultarHorariosReprogramacion = async (fecha, cita) => {

  setNuevaFecha(fecha);

  setNuevaHora("");

  setHorariosReprogramacion([]);



  if (!fecha || !cita) return;



  try {

const token = sessionStorage.getItem("token");



const response = await axios.get(

      "http://localhost:3000/api/citas/disponibilidad",

      {

        params: {

          medicoId: cita.medicoId,

          fecha

        },

        headers: {

          Authorization: `Bearer ${token}`

        }

      }

    );



    setHorariosReprogramacion(

      response.data.horariosDisponibles

    );



  } catch (error) {

    console.error(error);



    setMensaje(

      error.response?.data?.mensaje ||

      "Error al consultar horarios disponibles"

    );

  }

};



const guardarReprogramacion = async () => {

  if (!citaReprogramar || !nuevaFecha || !nuevaHora) {

    setMensaje("Selecciona una fecha y un horario");

    return;

  }



  try {

const token = sessionStorage.getItem("token");



    await axios.put(

      `http://localhost:3000/api/citas/${citaReprogramar.id}`,

      {

        fecha: nuevaFecha,

        hora: nuevaHora

      },

      {

        headers: {

          Authorization: `Bearer ${token}`

        }

      }

    );



// Cerrar y limpiar el formulario

    setCitaReprogramar(null);

    setNuevaFecha("");

    setNuevaHora("");

    setHorariosReprogramacion([]);



// Actualizar la tabla

    await cargarCitas();



    setMensaje("Cita reprogramada correctamente");



  } catch (error) {

    console.error(error);



    setMensaje(

      error.response?.data?.mensaje ||

      "Error al reprogramar la cita"

    );

  }

};



const cerrarSesion = () => {

    sessionStorage.removeItem("token");



    setUsuario(null);

    setMedicos([]);

    setPacientes([]);

    setHorarios([]);

    setCitas([]);



    setVista("dashboard");

    setMenuAbierto(false);

    setMostrarFormularioCita(false);

    setMostrarFormularioPaciente(false);

    setCitaReprogramar(null);



    setEmail("");

    setPassword("");

  };



const abrirFormularioCita = async () => {

    try {

const token = sessionStorage.getItem("token");



const response = await axios.get(

        "http://localhost:3000/api/medicos",

        {

          headers: {

            Authorization: `Bearer ${token}`

          }

        }

      );



      setMedicos(response.data);



      if (usuario.rol === "ADMIN") {

const pacientesResponse = await axios.get(

          "http://localhost:3000/api/pacientes",

          {

            headers: {

              Authorization: `Bearer ${token}`

            }

          }

        );



        setPacientes(pacientesResponse.data);

      }



      setPacienteIdCita("");

      setVista("citas");

      setMenuAbierto(false);

      setMostrarFormularioCita(true);

      setMensaje("");

    } catch (error) {

      console.error(error);

      setMensaje("Error al cargar los médicos");

    }

  };



const irA = (id) => {

    if (id === "dashboard") {

      setVista("dashboard");

      setMenuAbierto(false);

      refrescarPanel();

      return;

    }



    if (id === "citas") {

      cargarCitas({ mostrar: true });

      return;

    }



    if (id === "medicos") cargarMedicos();

    if (id === "pacientes") cargarPacientes();

    if (id === "horarios") cargarHorarios();

  };



const iniciarReprogramacion = (cita) => {

    abrirReprogramacion(cita);

    setVista("citas");

    setMenuAbierto(false);

  };



  if (usuario) {

    return (

      <div className="app-shell">

        <Sidebar

          vista={vista}

          rol={usuario.rol}

          abierta={menuAbierto}

          onNavigate={irA}

        />

        {menuAbierto && (

          <button

            type="button"

            className="sidebar-backdrop"

            aria-label="Cerrar menú"

            onClick={() => setMenuAbierto(false)}

          />

        )}



        <div className="app-main">

          <Topbar

            usuario={usuario}

            onMenu={() => setMenuAbierto(true)}

            onCerrarSesion={cerrarSesion}

          />



          <main className="app-content">

            {mensaje && (

              <div className={`banner banner-${clasificarMensaje(mensaje)}`}>

                {mensaje}

              </div>

            )}



            {vista === "dashboard" && (

              <Dashboard

                usuario={usuario}

                citas={citas}

                medicos={medicos}

                pacientes={pacientes}

                horarios={horarios}

                cargando={cargandoPanel}

                onAgendar={abrirFormularioCita}

                onIrA={irA}

                onCancelar={cancelarCita}

                onAtender={marcarCitaAtendida}

                onReprogramar={iniciarReprogramacion}

              />

            )}



        {vista === "medicos" && usuario.rol === "ADMIN" && (

          <div>

            <div className="page-head">

              <div>

                <h1>Médicos</h1>

                <p>Directorio y horario semanal de atención.</p>

              </div>

            </div>



            <div className="surface">

              <div className="card-body">



                <h5>Registrar médico</h5>



                <form className="clinic-form" onSubmit={crearMedico}>



                  <div className="mb-3">

                    <label className="form-label">

                      Nombre

                    </label>



                    <input

                      type="text"

                      className="form-control"

                      value={nombreMedico}

                      onChange={(e) =>

                        setNombreMedico(e.target.value)

                      }

                      required

                    />

                  </div>



                  <div className="mb-3">

                    <label className="form-label">

                      Teléfono

                    </label>



                    <input

                      type="text"

                      className="form-control"

                      value={telefonoMedico}

                      onChange={(e) =>

                        setTelefonoMedico(e.target.value)

                      }

                    />

                  </div>



                  <hr className="my-4" />



                    <h5>Horarios de atención</h5>



                    <p className="text-muted">

                      Selecciona los días y el horario en que atenderá el médico.

                    </p>



                    <div className="mb-3">

                      <label className="form-label">

                        Días de atención

                      </label>



                      <div className="row">

                        {diasSemana.map((dia) => (

                          <div className="col-md-4 mb-2" key={dia.id}>

                            <div className="form-check">

                              <input

                                className="form-check-input"

                                type="checkbox"

                                id={`dia-${dia.id}`}

                                checked={diasMedico.includes(dia.id)}

                                onChange={(e) => {

                                  if (e.target.checked) {

                                    setDiasMedico((prev) => [...prev, dia.id]);

                                  } else {

                                    setDiasMedico((prev) =>

                                      prev.filter((id) => id !== dia.id)

                                    );

                                  }

                                }}

                              />



                              <label

                                className="form-check-label"

                                htmlFor={`dia-${dia.id}`}

                              >

                                {dia.nombre}

                              </label>

                            </div>

                          </div>

                        ))}

                      </div>

                    </div>



                    <div className="row">

                      <div className="col-md-6 mb-3">

                        <label className="form-label">

                          Hora de inicio

                        </label>



                        <input

                          type="time"

                          className="form-control"

                          value={horaInicioMedico}

                          onChange={(e) =>

                            setHoraInicioMedico(e.target.value)

                          }

                          required

                        />

                      </div>



                      <div className="col-md-6 mb-3">

                        <label className="form-label">

                          Hora de finalización

                        </label>



                        <input

                          type="time"

                          className="form-control"

                          value={horaFinMedico}

                          onChange={(e) =>

                            setHoraFinMedico(e.target.value)

                          }

                          required

                        />

                      </div>

                    </div>



                  <button

                    type="submit"

                    className="btn btn-success"

                    disabled={guardandoMedico}

                  >

                    {guardandoMedico

                      ? "Registrando..."

                      : "Crear médico y asignar horarios"}

                  </button>



                </form>



              </div>

            </div>



            {medicos.length === 0 ? (

              <p>No hay médicos registrados.</p>

            ) : (

              <table className="table table-bordered table-striped">



                <thead>

                  <tr>

                    <th>ID</th>

                    <th>Nombre</th>

                    <th>Teléfono</th>

                  </tr>

                </thead>



                <tbody>

                  {medicos.map((medico) => (

                    <tr key={medico.id}>

                      <td>{medico.id}</td>

                      <td>{medico.nombre}</td>

                      <td>

                        {medico.telefono || "Sin teléfono"}

                      </td>

                    </tr>

                  ))}

                </tbody>



              </table>

            )}



          </div>

        )}



        {vista === "pacientes" && usuario.rol === "ADMIN" && (

          <div className="mt-5">

            <div className="card mb-4">

              <div className="card-body">



                <h5>Registrar paciente</h5>



                {!mostrarFormularioPaciente ? (

                  <button

                    className="btn btn-success"

                    onClick={async () => {

                    setUsuarioIdPaciente("");

                    await cargarUsuariosDisponibles();

                    setMostrarFormularioPaciente(true);

                    }}

                  >

                    Nuevo paciente

                  </button>

                ) : (

                  <form onSubmit={crearPaciente}>



                    <div className="mb-3">

                      <label className="form-label">

                        Seleccionar usuario

                      </label>



                      <select

                        className="form-select"

                        value={usuarioIdPaciente}

                        onChange={(e) => setUsuarioIdPaciente(e.target.value)}

                        required

                      >

                        <option value="">Selecciona un usuario</option>



                        {usuarios.map((u) => (

                          <option key={u.id} value={u.id}>

                            {u.nombre} - {u.email}

                          </option>

                        ))}

                      </select>



                      {usuarios.length === 0 && (

                        <div className="form-text">

                          No hay usuarios disponibles para registrar como pacientes.

                        </div>

                      )}

                    </div>



                    <div className="mb-3">

                      <label className="form-label">

                        Teléfono

                      </label>



                      <input

                        type="text"

                        className="form-control"

                        value={telefonoPaciente}

                        onChange={(e) =>

                          setTelefonoPaciente(e.target.value)

                        }

                      />

                    </div>



                    <div className="mb-3">

                      <label className="form-label">

                        Fecha de nacimiento

                      </label>



                      <input

                        type="date"

                        className="form-control"

                        value={fechaNacimientoPaciente}

                        onChange={(e) =>

                          setFechaNacimientoPaciente(e.target.value)

                        }

                      />

                    </div>



                    <button

                      type="submit"

                      className="btn btn-success me-2"

                    >

                      Crear paciente

                    </button>



                    <button

                      type="button"

                      className="btn btn-secondary"

                      onClick={() => setMostrarFormularioPaciente(false)}

                    >

                      Cancelar

                    </button>



                  </form>

                )}



              </div>

            </div>



            <h2>Lista de pacientes</h2>



            {pacientes.length === 0 ? (

              <p>No hay pacientes registrados.</p>

            ) : (

              <table className="table table-bordered table-striped">



                <thead>

                  <tr>

                    <th>ID</th>

                    <th>Nombre</th>

                    <th>Email</th>

                    <th>Teléfono</th>

                  </tr>

                </thead>



                <tbody>

                  {pacientes.map((paciente) => (

                    <tr key={paciente.id}>

                      <td>{paciente.id}</td>

                      <td>{paciente.usuario.nombre}</td>

                      <td>{paciente.usuario.email}</td>

                      <td>

                        {paciente.telefono || "Sin teléfono"}

                      </td>

                    </tr>

                  ))}

                </tbody>



              </table>

            )}



          </div>

        )}



        {vista === "horarios" && usuario.rol === "ADMIN" && (

          <div className="mt-5">



            <h2>Lista de horarios</h2>



            {horarios.length === 0 ? (

              <p>No hay horarios registrados.</p>

            ) : (

              <table className="table table-bordered table-striped">



                <thead>

                  <tr>

                    <th>ID</th>

                    <th>Médico</th>

                    <th>Día</th>

                    <th>Hora inicio</th>

                    <th>Hora fin</th>

                  </tr>

                </thead>



                <tbody>

                  {horarios.map((horario) => (

                    <tr key={horario.id}>

                      <td>{horario.id}</td>

                      <td>{horario.medico.nombre}</td>

                      <td>{horario.diaSemana}</td>

                      <td>{horario.horaInicio}</td>

                      <td>{horario.horaFin}</td>

                    </tr>

                  ))}

                </tbody>



              </table>

            )}



          </div>

        )}



        {vista === "citas" && (

          <div className="citas-page">

            <div className="page-head">
              <div>
                <h1>Citas</h1>
                <p>Agenda y seguimiento de citas médicas.</p>
              </div>
            </div>

            {(usuario.rol === "PACIENTE" || usuario.rol === "ADMIN") && (

              <button

                className="btn btn-success mb-3"

                onClick={async () => {

                  try {

const token = sessionStorage.getItem("token");



const response = await axios.get(

                      "http://localhost:3000/api/medicos",

                      {

                        headers: {

                          Authorization: `Bearer ${token}`

                        }

                      }

                    );



                    setMedicos(response.data);

// Si es administrador, cargar también los pacientes

                      if (usuario.rol === "ADMIN") {

const pacientesResponse = await axios.get(

                          "http://localhost:3000/api/pacientes",

                          {

                            headers: {

                              Authorization: `Bearer ${token}`

                            }

                          }

                        );



                        setPacientes(pacientesResponse.data);

                      }



                      setPacienteIdCita("");

                      setMostrarFormularioCita(true);

                      setMensaje("");

                  } catch (error) {

                    console.error(error);

                    setMensaje("Error al cargar los médicos");

                  }

                }}

              >

                Agendar cita

              </button>

            )}



            {mostrarFormularioCita && (

              <div className="card mb-4">

                <div className="card-body">



                  <h5 className="mb-3">Agendar nueva cita</h5>



                  <form onSubmit={crearCita}>

                    {usuario.rol === "ADMIN" && (

                      <div className="mb-3">

                        <label className="form-label">

                          Seleccionar paciente

                        </label>



                        <select

                          className="form-select"

                          value={pacienteIdCita}

                          onChange={(e) => setPacienteIdCita(e.target.value)}

                          required

                        >

                          <option value="">Selecciona un paciente</option>



                          {pacientes.map((paciente) => (

                            <option key={paciente.id} value={paciente.id}>

                              {paciente.usuario.nombre}

                            </option>

                          ))}

                        </select>

                      </div>

                    )}



                    <div className="mb-3">

                      <label className="form-label">Seleccionar médico</label>



                      <select

                        className="form-select"

                        value={medicoIdCita}

                        onChange={(e) => {

const nuevoMedicoId = e.target.value;



                          setMedicoIdCita(nuevoMedicoId);

                          cargarDisponibilidad(nuevoMedicoId, fechaCita);

                        }}

                        required

                      >

                        <option value="">Selecciona un médico</option>



                        {medicos.map((medico) => (

                          <option key={medico.id} value={medico.id}>

                            {medico.nombre}

                          </option>

                        ))}

                      </select>

                    </div>



                    <div className="mb-3">

                      <label className="form-label">Fecha de la cita</label>

                      <input

                        type="date"

                        className="form-control"

                        min={fechaHoy}

                        value={fechaCita}

                        onChange={(e) => {

const fecha = e.target.value;

                          setFechaCita(fecha);

                          cargarDisponibilidad(medicoIdCita, fecha);

                        }}

                        required

                      />

                    </div>



                    <div className="mb-3">

                      <label className="form-label">Hora de la cita</label>

                      <select

                        className="form-select"

                        value={horaCita}

                        onChange={(e) => setHoraCita(e.target.value)}

                        disabled={!medicoIdCita || !fechaCita || horariosDisponibles.length === 0}

                        required

                      >

                        <option value="">Selecciona un horario disponible</option>



                        {horariosDisponibles.map((hora) => (

                          <option key={hora} value={hora}>

                            {hora}

                          </option>

                        ))}

                      </select>



                      {medicoIdCita && fechaCita && horariosDisponibles.length === 0 && (

                        <small className="text-muted">

                          No hay horarios disponibles para esta fecha.

                        </small>

                      )}

                    </div>



                    <div className="mb-3">

                      <label className="form-label">Motivo de la consulta</label>

                      <textarea

                        className="form-control"

                        value={motivoCita}

                        onChange={(e) => setMotivoCita(e.target.value)}

                        rows="3"

                      />

                    </div>



                    <button type="submit" className="btn btn-success me-2">

                      Guardar cita

                    </button>



                    <button

                      type="button"

                      className="btn btn-secondary"

                      onClick={() => setMostrarFormularioCita(false)}

                    >

                      Cancelar

                    </button>



                  </form>

                </div>

              </div>

            )}



            {usuario.rol === "ADMIN" && citaReprogramar && (

              <div className="card mb-4 border-primary">

                <div className="card-body">



                  <h5 className="mb-3">

                    Reprogramar cita #{citaReprogramar.id}

                  </h5>



                  <p>

                    <strong>Paciente:</strong>{" "}

                    {citaReprogramar.paciente.usuario.nombre}

                  </p>



                  <p>

                    <strong>Médico:</strong>{" "}

                    {citaReprogramar.medico.nombre}

                  </p>



                  <p>

                    <strong>Fecha actual:</strong>{" "}

                    {citaReprogramar.fecha.substring(0, 10)}

                  </p>



                  <p>

                    <strong>Hora actual:</strong>{" "}

                    {citaReprogramar.hora}

                  </p>



                  <div className="mb-3">

                    <label className="form-label">

                      Nueva fecha

                    </label>



                    <input

                      type="date"

                      className="form-control"

                      min={fechaHoy}

                      value={nuevaFecha}

                      onChange={(e) =>

                        consultarHorariosReprogramacion(

                          e.target.value,

                          citaReprogramar

                        )

                      }

                      required

                    />

                  </div>



                  <div className="mb-3">

                    <label className="form-label">

                      Nuevo horario

                    </label>



                    <select

                      className="form-select"

                      value={nuevaHora}

                      onChange={(e) => setNuevaHora(e.target.value)}

                      disabled={

                        !nuevaFecha ||

                        horariosReprogramacion.length === 0

                      }

                      required

                    >

                      <option value="">

                        Selecciona un horario disponible

                      </option>



                      {horariosReprogramacion.map((hora) => (

                        <option key={hora} value={hora}>

                          {hora}

                        </option>

                      ))}

                    </select>



                    {nuevaFecha &&

                      horariosReprogramacion.length === 0 && (

                        <small className="text-muted">

                          No hay horarios disponibles para esta fecha.

                        </small>

                      )}

                  </div>



                  <button

                    type="button"

                    className="btn btn-success me-2"

                    onClick={guardarReprogramacion}

                    disabled={!nuevaFecha || !nuevaHora}

                  >

                    Guardar reprogramación

                  </button>



                  <button

                    type="button"

                    className="btn btn-secondary"

                    onClick={() => {

                      setCitaReprogramar(null);

                      setNuevaFecha("");

                      setNuevaHora("");

                      setHorariosReprogramacion([]);

                    }}

                  >

                    Cerrar

                  </button>



                </div>

              </div>

            )}



            <CitasListado
              citas={citas}
              medicos={medicos}
              rol={usuario.rol}
              onReprogramar={abrirReprogramacion}
              onAtender={marcarCitaAtendida}
              onCancelar={cancelarCita}
            />



          </div>

        )}



        </main>
      </div>
      {confirmacion && (
        <ConfirmDialog
          titulo={confirmacion.titulo}
          texto={confirmacion.texto}
          onConfirm={() => confirmacion.resolver(true)}
          onCancel={() => confirmacion.resolver(false)}
        />
      )}
    </div>
  );
}

  return (

    <div className="container mt-5">



      <div className="row justify-content-center">



        <div className="col-md-5">



          <div className="card shadow">



            <div className="card-body">



              <h2 className="text-center mb-4">

                Iniciar sesión

              </h2>



              <form onSubmit={iniciarSesion}>



                <div className="mb-3">



                  <label className="form-label">

                    Correo electrónico

                  </label>



                  <input

                    type="email"

                    className="form-control"

                    value={email}

                    onChange={(e) => setEmail(e.target.value)}

                    required

                  />



                </div>



                <div className="mb-3">



                  <label className="form-label">

                    Contraseña

                  </label>



                  <input

                    type="password"

                    className="form-control"

                    value={password}

                    onChange={(e) => setPassword(e.target.value)}

                    required

                  />



                </div>



                <button

                  type="submit"

                  className="btn btn-primary w-100"

                >

                  Iniciar sesión

                </button>



              </form>



              {mensaje && (

                <div className="alert alert-danger mt-3">

                  {mensaje}

                </div>

              )}



            </div>



          </div>



        </div>



      </div>



    </div>

  );

}





export default App;