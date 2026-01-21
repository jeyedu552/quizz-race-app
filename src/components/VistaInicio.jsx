import React, { useState, useEffect } from "react";
import { fetchUsuarios, crearUsuario } from "../services/preguntas";

// --- IMÁGENES ---
import batman from "../assets/avatars/batman.png";
import spiderman from "../assets/avatars/spiderman.png";
import ariel from "../assets/avatars/ariel.jpg";
import capitanAmerica from "../assets/avatars/capitanAmerica.png";
import cenicienta from "../assets/avatars/cenicienta.jpg";
import rapunzel from "../assets/avatars/rapunzel.jpg";
import superman from "../assets/avatars/superman.png";
import wonderwoman from "../assets/avatars/wonderwoman.png";

const DICCIONARIO_AVATARES = {
  batman: batman,
  spiderman: spiderman,
  ariel: ariel,
  capitanAmerica: capitanAmerica,
  cenicienta: cenicienta,
  rapunzel: rapunzel,
  superman: superman,
  wonderwoman: wonderwoman,
  default: batman,
};
const CODIGOS_DISPONIBLES = Object.keys(DICCIONARIO_AVATARES).filter(
  (k) => k !== "default",
);

function VistaInicio({ onIniciar }) {
  const [listaUsuarios, setListaUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [p1Id, setP1Id] = useState("");
  const [p2Id, setP2Id] = useState("");

  // Modal
  const [mostrarModal, setMostrarModal] = useState(false);
  const [creandoPara, setCreandoPara] = useState(null);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoAvatar, setNuevoAvatar] = useState(CODIGOS_DISPONIBLES[0]);

  // Carga inicial
  const cargarDatos = async () => {
    setCargando(true);
    console.log("Cargando usuarios...");
    const usuarios = await fetchUsuarios();
    console.log("Usuarios cargados:", usuarios);
    setListaUsuarios(usuarios);
    setCargando(false);
  };
  useEffect(() => {
    cargarDatos();
  }, []);

  const usuarioP1 = listaUsuarios.find((u) => u.id_usuario.toString() === p1Id);
  const usuarioP2 = listaUsuarios.find((u) => u.id_usuario.toString() === p2Id);

  const manejarGuardarNuevo = async () => {
    if (!nuevoNombre.trim()) return alert("¡Escribe un nombre!");
    try {
      const nuevo = await crearUsuario(nuevoNombre, nuevoAvatar);
      console.log("Nuevo usuario creado: ", nuevo);

      // Detecta si la API devolvió el usuario directo o anidado
      const usuarioCreado = nuevo?.usuario ?? nuevo;

      if (!usuarioCreado || !usuarioCreado.Correcto) {
        alert("No se pudo crear el usuario. Revisa el backend.");
        return;
      }

      // Refresca la lista y selecciona según quién abrió el modal
      cerrarModal();
      await cargarDatos();
      const idStr = usuarioCreado.id_usuario.toString();
      if (creandoPara === "p1") setP1Id(idStr);
      if (creandoPara === "p2") setP2Id(idStr);
    } catch (e) {
      //console.error("Error al crear usuario:", e);
      //alert("Error al crear usuario.");
    }
  };

  const abrirModal = (jugador) => {
    setCreandoPara(jugador);
    setNuevoNombre("");
    setNuevoAvatar(CODIGOS_DISPONIBLES[0]);
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    console.log("Cerrando modal");
    setMostrarModal(false);
    setCreandoPara(null);
  };

  const manejarInicioJuego = () => {
    if (!usuarioP1 || !usuarioP2) return alert("¡Faltan pilotos!");
    if (usuarioP1.id_usuario === usuarioP2.id_usuario)
      return alert("¡Elijan distintos!");

    onIniciar({
      p1: {
        nombre: usuarioP1.nickname,
        avatar: DICCIONARIO_AVATARES[usuarioP1.avatar_code],
        id_usuario: usuarioP1.id_usuario,
      },
      p2: {
        nombre: usuarioP2.nickname,
        avatar: DICCIONARIO_AVATARES[usuarioP2.avatar_code],
        id_usuario: usuarioP2.id_usuario,
      },
    });
  };

  return (
    <div className="contenedor-inicio">
      <header className="header-principal">
        <div className="badge-escuela">
          <div className="icono-badge">
            <span className="material-symbols-outlined">sports_score</span>
          </div>
          <h2>Escuela de Pilotos</h2>
        </div>
        <h1 className="titulo-kawaii">QUIZ RACING</h1>
      </header>

      <main className="area-seleccion">
        {/* JUGADOR 1 (ROSA) */}
        <div className="tarjeta-jugador rosa">
          <div className="etiqueta-jugador">JUGADOR 1</div>

          <div className="contenido-tarjeta">
            <label>Selecciona Piloto:</label>
            <div className="fila-input">
              <select value={p1Id} onChange={(e) => setP1Id(e.target.value)}>
                <option disabled value="">
                  Elegir...
                </option>
                {listaUsuarios.map((u) => (
                  <option key={u.id_usuario} value={u.id_usuario}>
                    {u.nickname}
                  </option>
                ))}
              </select>
              <button
                onClick={() => abrirModal("p1")}
                className="btn-nuevo rosa"
                title="Crear Nuevo"
              >
                +
              </button>
            </div>

            <div className="area-avatar rosa">
              {usuarioP1 ? (
                <div className="avatar-display">
                  <img
                    src={DICCIONARIO_AVATARES[usuarioP1.avatar_code]}
                    alt="Avatar"
                  />
                  <h3>{usuarioP1.nickname}</h3>
                  <span className="badge-nivel">
                    NIVEL {Math.floor(usuarioP1.puntos_totales / 1000) + 1}
                  </span>
                </div>
              ) : (
                <div className="avatar-placeholder">
                  <span className="material-symbols-outlined">
                    account_circle
                  </span>
                  <p>¿Quién eres?</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* VS */}
        <div className="vs-central">VS</div>

        {/* JUGADOR 2 (VERDE) */}
        <div className="tarjeta-jugador verde">
          <div className="etiqueta-jugador">JUGADOR 2</div>

          <div className="contenido-tarjeta">
            <label>Selecciona Piloto:</label>
            <div className="fila-input">
              <select value={p2Id} onChange={(e) => setP2Id(e.target.value)}>
                <option disabled value="">
                  Elegir...
                </option>
                {listaUsuarios.map((u) => (
                  <option key={u.id_usuario} value={u.id_usuario}>
                    {u.nickname}
                  </option>
                ))}
              </select>
              <button
                onClick={() => abrirModal("p2")}
                className="btn-nuevo verde"
                title="Crear Nuevo"
              >
                +
              </button>
            </div>

            <div className="area-avatar verde">
              {usuarioP2 ? (
                <div className="avatar-display">
                  <img
                    src={DICCIONARIO_AVATARES[usuarioP2.avatar_code]}
                    alt="Avatar"
                  />
                  <h3>{usuarioP2.nickname}</h3>
                  <span className="badge-nivel">
                    NIVEL {Math.floor(usuarioP2.puntos_totales / 1000) + 1}
                  </span>
                </div>
              ) : (
                <div className="avatar-placeholder">
                  <span className="material-symbols-outlined">
                    account_circle
                  </span>
                  <p>¿Quién eres?</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <button
        onClick={manejarInicioJuego}
        className={`btn-comenzar ${!usuarioP1 || !usuarioP2 ? "deshabilitado" : ""}`}
        disabled={!usuarioP1 || !usuarioP2}
      >
        ¡A CORRER! 🏁
      </button>

      {/* MODAL */}
      {mostrarModal && (
        <div className="modal-fondo">
          <div className="modal-caja">
            <h2>✨ NUEVO PILOTO ✨</h2>
            <input
              autoFocus
              type="text"
              placeholder="Nombre..."
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              maxLength={10}
            />

            <p className="label-foto">ELIGE TU FOTO:</p>
            <div className="grid-avatares-modal">
              {CODIGOS_DISPONIBLES.map((codigo) => (
                <img
                  key={codigo}
                  src={DICCIONARIO_AVATARES[codigo]}
                  className={nuevoAvatar === codigo ? "seleccionado" : ""}
                  onClick={() => setNuevoAvatar(codigo)}
                />
              ))}
            </div>

            <div className="botones-modal">
              <button onClick={cerrarModal} className="btn-cancelar">
                Cancelar
              </button>
              <button onClick={manejarGuardarNuevo} className="btn-guardar">
                ¡GUARDAR!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VistaInicio;
