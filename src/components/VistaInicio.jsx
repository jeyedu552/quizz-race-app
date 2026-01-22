import React, { useState, useEffect } from "react";
import ModelLeaderboard from "./modelLeaderboard";
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

function VistaInicio({ onIniciar, initialP1Id = null, initialP2Id = null, volverDesdeR = false, onUsuariosCargados = null }) {
  const [listaUsuarios, setListaUsuarios] = useState([]);
  const [_cargando, setCargando] = useState(true);
  const [p1Id, setP1Id] = useState("");
  const [p2Id, setP2Id] = useState("");

  // Modal
  const [mostrarModal, setMostrarModal] = useState(false);
  const [creandoPara, setCreandoPara] = useState(null);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoAvatar, setNuevoAvatar] = useState(CODIGOS_DISPONIBLES[0]);
  const [modalBoard, setModalBoard] = useState(null);
  const [ultimoUsuarioCreado, setUltimoUsuarioCreado] = useState(null);

  // Carga inicial
  const cargarDatos = async () => {
    setCargando(true);
    console.log("Cargando usuarios...");
    const usuarios = await fetchUsuarios();
    console.log("Usuarios cargados:", usuarios);
    setListaUsuarios(usuarios);
    setCargando(false);
    // Si venimos por la tecla R, notificamos al padre que los usuarios ya cargaron
    try {
      if (volverDesdeR && typeof onUsuariosCargados === 'function') onUsuariosCargados();
    } catch (e) {
      console.error('Error notificando carga de usuarios:', e);
    }
  };
  useEffect(() => {
    cargarDatos();
  }, []);

  // Si el padre (App) pasa ids iniciales (vienen cuando se vuelve desde GameOver), los usamos
  useEffect(() => {
    if (initialP1Id) setP1Id(initialP1Id);
    if (initialP2Id) setP2Id(initialP2Id);
  }, [initialP1Id, initialP2Id]);

  // Efecto para seleccionar automáticamente al usuario recién creado
  useEffect(() => {
    if (ultimoUsuarioCreado && listaUsuarios.length > 0) {
      const usuarioEncontrado = listaUsuarios.find(u => u.nickname === ultimoUsuarioCreado.nombre);
      if (usuarioEncontrado) {
        const idStr = usuarioEncontrado.id_usuario.toString();
        if (ultimoUsuarioCreado.jugador === 'p1') {
          setP1Id(idStr);
        } else {
          setP2Id(idStr);
        }
        // Limpiamos el estado para que no se vuelva a ejecutar
        setUltimoUsuarioCreado(null);
      }
    }
  }, [listaUsuarios, ultimoUsuarioCreado]);

  const usuarioP1 = listaUsuarios.find((u) => u.id_usuario.toString() === p1Id);
  const usuarioP2 = listaUsuarios.find((u) => u.id_usuario.toString() === p2Id);

  const manejarGuardarNuevo = async () => {
    if (!nuevoNombre.trim()) return alert("¡Escribe un nombre!");
    try {
      const respuestaAPI = await crearUsuario(nuevoNombre, nuevoAvatar);

      if (respuestaAPI) {
        // Guardamos el nombre y para quién se creó, para usarlo en el useEffect
        setUltimoUsuarioCreado({ nombre: nuevoNombre, jugador: creandoPara });
        cerrarModal();
        await cargarDatos(); // Esto disparará el useEffect de arriba
      } else {
        alert("No se pudo crear el usuario. Revisa el backend.");
      }
    } catch (e) {
      console.error("Error al crear usuario:", e);
      alert("Error al crear usuario.");
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
    setNuevoNombre(""); // Limpiamos el nombre al cerrar
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

  // Atajo de teclado: 'p' para iniciar partida (si los jugadores están seleccionados)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.repeat) return;
      if (e.key === 'p' || e.key === 'P') {
        manejarInicioJuego();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [p1Id, p2Id, listaUsuarios]);

  return (
    <div className="contenedor-inicio">
      {/* Overlay cuando volvemos desde R y se están cargando los usuarios */}
      {volverDesdeR && _cargando && (
        <div className="modal-fondo">
          <div className="modal-caja">
            <h2>Cargando jugadores</h2>
            <p>Espere un momento mientras se cargan los pilotos...</p>
          </div>
        </div>
      )}

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

      {/* Botón Leaderboard */}
      <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
        <button className="btn-leaderboard" onClick={() => setModalBoard(true)}>
          Leaderboard
        </button>
      </div>

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
                  alt={codigo}
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

      {/* Modal Leaderboard */}
      {modalBoard && (
        <ModelLeaderboard
          usuarios={listaUsuarios}
          onClose={() => setModalBoard(false)}
        />
      )}
    </div>
  );
}

export default VistaInicio;
