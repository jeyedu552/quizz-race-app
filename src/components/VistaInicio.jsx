import React, { useState, useEffect } from "react";
import ModelLeaderboard from "./modelLeaderboard";
import { fetchUsuarios, crearUsuario } from "../services/preguntas";
import { useInputHandler } from "../useInputHandler"; 

// --- IMÁGENES ---
import batman from "../assets/avatars/batman.png";
import spiderman from "../assets/avatars/spiderman.png";
import ariel from "../assets/avatars/ariel.jpg";
import capitanAmerica from "../assets/avatars/capitanAmerica.png";
import cenicienta from "../assets/avatars/cenicienta.jpg";
import rapunzel from "../assets/avatars/rapunzel.jpg";
import superman from "../assets/avatars/superman.png";
import wonderwoman from "../assets/avatars/wonderwoman.png";
import elsa from "../assets/avatars/elsa.jpg";
import goku from "../assets/avatars/goku.jpg";
import homero from "../assets/avatars/homero.jpg";
import valiente from "../assets/avatars/valiente.jpg";

const DICCIONARIO_AVATARES = {
  batman: batman,
  spiderman: spiderman,
  ariel: ariel,
  capitanAmerica: capitanAmerica,
  cenicienta: cenicienta,
  rapunzel: rapunzel,
  superman: superman,
  wonderwoman: wonderwoman,
  elsa: elsa,
  goku: goku,
  homero: homero,
  valiente: valiente,
  default: batman,
};
const CODIGOS_DISPONIBLES = Object.keys(DICCIONARIO_AVATARES).filter(
  (k) => k !== "default",
);

function VistaInicio({ onIniciar, initialP1Id = null, initialP2Id = null, volverDesdeR = false, onUsuariosCargados = null }) {
  const [listaUsuarios, setListaUsuarios] = useState([]);
  const [_cargando, setCargando] = useState(true);
  
  // Indices para controlar el carrusel (en lugar de p1Id directo)
  const [idxP1, setIdxP1] = useState(0);
  const [idxP2, setIdxP2] = useState(1);

  // Foco para alternar visualmente quién está activo (Space/Enter)
  const [focoActual, setFocoActual] = useState('p1');

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
    
    // Si hay usuarios, inicializamos índices seguros
    if (usuarios.length > 0) {
        // Intentamos mantener índices si ya existían, sino 0 y 1
        setIdxP1(0);
        setIdxP2(usuarios.length > 1 ? 1 : 0);
    }

    setCargando(false);
    // Si venimos por la tecla R, notificamos al padre
    try {
      if (volverDesdeR && typeof onUsuariosCargados === 'function') onUsuariosCargados();
    } catch (e) {
      console.error('Error notificando carga de usuarios:', e);
    }
  };
  
  useEffect(() => {
    cargarDatos();
  }, []);

  // --- LÓGICA DE SINCRONIZACIÓN CON IDs (Volver de GameOver) ---
  useEffect(() => {
    if (listaUsuarios.length === 0) return;
    
    // Buscar índice de P1 si viene ID
    if (initialP1Id) {
        const foundIndex = listaUsuarios.findIndex(u => u.id_usuario.toString() === initialP1Id);
        if (foundIndex !== -1) setIdxP1(foundIndex);
    }
    // Buscar índice de P2 si viene ID
    if (initialP2Id) {
        const foundIndex = listaUsuarios.findIndex(u => u.id_usuario.toString() === initialP2Id);
        if (foundIndex !== -1) setIdxP2(foundIndex);
    }
  }, [initialP1Id, initialP2Id, listaUsuarios]);


  // --- LÓGICA DE USUARIO RECIÉN CREADO ---
  useEffect(() => {
    if (ultimoUsuarioCreado && listaUsuarios.length > 0) {
      const indexEncontrado = listaUsuarios.findIndex(u => u.nickname === ultimoUsuarioCreado.nombre);
      
      if (indexEncontrado !== -1) {
        if (ultimoUsuarioCreado.jugador === 'p1') {
          setIdxP1(indexEncontrado);
        } else {
          setIdxP2(indexEncontrado);
        }
        setUltimoUsuarioCreado(null);
      }
    }
  }, [listaUsuarios, ultimoUsuarioCreado]);

  // Helpers para obtener el objeto usuario actual
  const usuarioP1 = listaUsuarios[idxP1];
  const usuarioP2 = listaUsuarios[idxP2];

  // --- LÓGICA DE CARRUSEL ---
  const cambiarJugador = (jugador, direccion) => {
    if (listaUsuarios.length === 0) return;

    if (jugador === 'p1') {
        setIdxP1(prev => {
            let nuevo = prev + direccion;
            if (nuevo < 0) nuevo = listaUsuarios.length - 1;
            if (nuevo >= listaUsuarios.length) nuevo = 0;
            return nuevo;
        });
    } else {
        setIdxP2(prev => {
            let nuevo = prev + direccion;
            if (nuevo < 0) nuevo = listaUsuarios.length - 1;
            if (nuevo >= listaUsuarios.length) nuevo = 0;
            return nuevo;
        });
    }
  };

  // --- MAPEO DE CONTROLES ARCADE ---
  useInputHandler({
    // JUGADOR 1: Solo si foco es P1
    onRed: () => { if (focoActual === 'p1') cambiarJugador('p1', -1); },
    onGreen: () => { if (focoActual === 'p1') cambiarJugador('p1', 1); },
    
    // JUGADOR 2: Solo si foco es P2
    onBlue: () => { if (focoActual === 'p2') cambiarJugador('p2', -1); },
    onYellow: () => { if (focoActual === 'p2') cambiarJugador('p2', 1); },

    // BOTÓN GRANDE: Alternar foco
    onBigButton: () => {
       setFocoActual(prev => prev === 'p1' ? 'p2' : 'p1');
    }
  });


  const manejarGuardarNuevo = async () => {
    if (!nuevoNombre.trim()) return alert("¡Escribe un nombre!");
    try {
      const respuestaAPI = await crearUsuario(nuevoNombre, nuevoAvatar);

      if (respuestaAPI) {
        setUltimoUsuarioCreado({ nombre: nuevoNombre, jugador: creandoPara });
        cerrarModal();
        await cargarDatos(); 
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
    setMostrarModal(false);
    setCreandoPara(null);
    setNuevoNombre(""); 
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

  // Atajo de teclado 'P' (Opcional, se mantiene por compatibilidad)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.repeat) return;
      if (e.key === 'p' || e.key === 'P') {
        manejarInicioJuego();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [usuarioP1, usuarioP2]); // Dependemos de los usuarios seleccionados

  return (
    <div className="contenedor-inicio">
      {/* Overlay carga */}
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
        
        {/* JUGADOR 1 (ROSA) - CON LÓGICA DE FOCO Y CARRUSEL */}
        <div className={`tarjeta-jugador rosa ${focoActual === 'p1' ? 'foco-activo' : 'foco-inactivo'}`}>
          <div className="etiqueta-jugador">
             {focoActual === 'p1' ? '👉 JUGADOR 1 👈' : 'JUGADOR 1'}
          </div>

          <div className="contenido-tarjeta">
            {/* Controles Visuales */}
            <div className="controles-arcade" style={{ opacity: focoActual === 'p1' ? 1 : 0.3 }}>
                <div className="flecha">🔴</div>
                <label>SELECCIONA</label>
                <div className="flecha">🔵</div>
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
            
            <button onClick={() => abrirModal("p1")} className="btn-nuevo-mini">
               Crear Nuevo (+)
            </button>
          </div>
        </div>

        {/* VS */}
        <div className="vs-central">
             VS
        </div>

        {/* JUGADOR 2 (VERDE) - CON LÓGICA DE FOCO Y CARRUSEL */}
        <div className={`tarjeta-jugador verde ${focoActual === 'p2' ? 'foco-activo' : 'foco-inactivo'}`}>
          <div className="etiqueta-jugador">
             {focoActual === 'p2' ? '👉 JUGADOR 2 👈' : 'JUGADOR 2'}
          </div>

          <div className="contenido-tarjeta">
             {/* Controles Visuales */}
             <div className="controles-arcade" style={{ opacity: focoActual === 'p2' ? 1 : 0.3 }}>
                <div className="flecha">🟢</div>
                <label>SELECCIONA</label>
                <div className="flecha">🟡</div>
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

            <button onClick={() => abrirModal("p2")} className="btn-nuevo-mini">
              Crear Nuevo (+)
            </button>
          </div>
        </div>
      </main>

      <div className="footer-inicio">
        <p className="instruccion-arcade">USA BOTONES DE COLORES PARA CAMBIAR • BOTÓN GRANDE PARA ALTERNAR</p>
        <button
          onClick={manejarInicioJuego}
          className={`btn-comenzar ${!usuarioP1 || !usuarioP2 ? "deshabilitado" : ""}`}
          disabled={!usuarioP1 || !usuarioP2}
        >
          ¡A CORRER! 🏁
        </button>
      </div>

      {/* Botón Leaderboard (NO LO ELIMINÉ) */}
      <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
        <button className="btn-leaderboard" onClick={() => setModalBoard(true)}>
          🏆 Leaderboard
        </button>
      </div>

      {/* MODAL CREAR USUARIO (Igual que antes) */}
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

      {/* Modal Leaderboard (Igual que antes) */}
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