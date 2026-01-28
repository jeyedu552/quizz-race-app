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
  const [modalAyuda, setModalAyuda] = useState(false);
  const [imagenActual, setImagenActual] = useState(0);

  // Array de imágenes del hardware
  const imagenesHardware = [
    { src: '/principal.jpeg', alt: 'Hardware con botones principal', titulo: 'Control Principal' },
    { src: '/play_reset.jpeg', alt: 'Botones Play y Reset', titulo: 'Botones de Control' }
  ];

  const siguienteImagen = () => {
    setImagenActual((prev) => (prev + 1) % imagenesHardware.length);
  };

  const anteriorImagen = () => {
    setImagenActual((prev) => (prev - 1 + imagenesHardware.length) % imagenesHardware.length);
  };

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

      {/* Botón de Ayuda Flotante */}
      <button className="btn-ayuda-flotante" onClick={() => setModalAyuda(true)}>
        ❓
      </button>

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

      {/* Modal de Ayuda */}
      {modalAyuda && (
        <div className="modal-fondo" onClick={() => setModalAyuda(false)}>
          <div className="modal-ayuda" onClick={(e) => e.stopPropagation()}>
            <button className="btn-cerrar-modal" onClick={() => setModalAyuda(false)}>
              ✕
            </button>
            
            <h2 className="titulo-ayuda">🏁 QUIZ RACING</h2>
            
            {/* Sección De Qué Trata */}
            <div className="seccion-acerca">
              <h3>🎯 ¿De qué trata el juego?</h3>
              <p className="descripcion-juego">
                <strong>Quiz Racing</strong> es un emocionante juego de trivia competitivo donde dos jugadores
                compiten respondiendo preguntas de cultura general. Combina conocimiento con velocidad
                en 3 fases épicas: <strong>Preguntas por turnos</strong>, <strong>Carrera de velocidad</strong> y 
                <strong>Modo IA adaptativo</strong>. ¡El jugador con más puntos al final se corona campeón! 🏆
              </p>
            </div>

            {/* Sección Hardware */}
            <div className="seccion-hardware">
              <h3>🕹️ Control del Juego</h3>
              <div className="carrusel-hardware">
                <button className="carrusel-btn prev" onClick={anteriorImagen} aria-label="Imagen anterior">
                  ‹
                </button>
                
                <div className="carrusel-contenedor">
                  <img 
                    src={imagenesHardware[imagenActual].src} 
                    alt={imagenesHardware[imagenActual].alt}
                    className="carrusel-imagen"
                  />
                  <p className="carrusel-titulo">{imagenesHardware[imagenActual].titulo}</p>
                </div>
                
                <button className="carrusel-btn next" onClick={siguienteImagen} aria-label="Imagen siguiente">
                  ›
                </button>
              </div>
              
              {/* Indicadores */}
              <div className="carrusel-indicadores">
                {imagenesHardware.map((_, index) => (
                  <button
                    key={index}
                    className={`indicador ${index === imagenActual ? 'activo' : ''}`}
                    onClick={() => setImagenActual(index)}
                    aria-label={`Ir a imagen ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Instrucciones Completas */}
            <div className="seccion-instrucciones">
              <h3>📋 Instrucciones Completas</h3>
              <div className="instrucciones-grid">
                
                {/* PANTALLA INICIO */}
                <div className="instruccion-item">
                  <span className="numero-paso">1</span>
                  <div>
                    <strong>Pantalla de Inicio</strong>
                    <p>• Usa botones de colores (🔴🟢 para P1, 🔵🟡 para P2) para navegar<br/>
                       • Presiona ESPACIO (P1) o ENTER (P2) para alternar foco<br/>
                       • Tecla <kbd>P</kbd> para iniciar juego rápido</p>
                  </div>
                </div>

                {/* FASE 1: TRIVIA */}
                <div className="instruccion-item">
                  <span className="numero-paso">2</span>
                  <div>
                    <strong>Fase 1: Trivia (Rondas 1-5)</strong>
                    <p>• Presiona tu BOTÓN GRANDE (ESPACIO/ENTER) para tomar turno<br/>
                       • Tienes 3 segundos para responder con botones de colores<br/>
                       • +100 puntos por acierto | 30 segundos por pregunta<br/>
                       • ⚠️ Si no respondes a tiempo, pierdes el turno</p>
                  </div>
                </div>

                {/* FASE 2: CARRERA */}
                <div className="instruccion-item">
                  <span className="numero-paso">3</span>
                  <div>
                    <strong>Fase 2: Carrera Rápida</strong>
                    <p>• ¡Presiona tu BOTÓN GRANDE repetidamente para acelerar!<br/>
                       • Tu kart avanza con cada toque rápido<br/>
                       • El primero en llegar gana +200 puntos bonus 🏁<br/>
                       • Efectos visuales de turbo al avanzar 💨</p>
                  </div>
                </div>

                {/* FASE 3: MODO IA */}
                <div className="instruccion-item">
                  <span className="numero-paso">4</span>
                  <div>
                    <strong>Fase 3: Modo IA (Rondas 6-10)</strong>
                    <p>• Sistema inteligente ajusta dificultad según tu desempeño<br/>
                       • Analiza tu velocidad de respuesta y porcentaje de aciertos<br/>
                       • Preguntas más difíciles = más emoción<br/>
                       • Mismo sistema de turnos y puntos</p>
                  </div>
                </div>

                {/* CONTROLES */}
                <div className="instruccion-item">
                  <span className="numero-paso">5</span>
                  <div>
                    <strong>Controles del Teclado</strong>
                    <p>• <kbd>Botón Rojo</kbd>: Botón grande P1 (buzz in / acelerar)<br/>
                       • <kbd>Botón Rojo</kbd>: Botón grande P2 (buzz in / acelerar)<br/>
                       • <kbd>1</kbd>: Respuesta A (Rojo 🔴)<br/>
                       • <kbd>2</kbd>: Respuesta B (Azul 🔵)<br/>
                       • <kbd>3</kbd>: Respuesta C (Verde 🟢)<br/>
                       • <kbd>4</kbd>: Respuesta D (Amarillo 🟡)<br/>
                       • <kbd>P</kbd>: Iniciar el juego<br/>
                       • <kbd>R</kbd>: Reiniciar juego desde cualquier pantalla</p>
                  </div>
                </div>

                {/* SISTEMA DE PUNTOS */}
                <div className="instruccion-item">
                  <span className="numero-paso">6</span>
                  <div>
                    <strong>Sistema de Puntuación</strong>
                    <p>• Respuesta correcta: +100 puntos ⭐<br/>
                       • Ganador de carrera: +200 puntos bonus 🏁<br/>
                       • Progreso guardado en perfil permanente<br/>
                       • Sube de nivel cada 1000 puntos acumulados<br/>
                       • Ver ranking en el Leaderboard 🏆</p>
                  </div>
                </div>

                {/* CARACTERÍSTICAS */}
                <div className="instruccion-item">
                  <span className="numero-paso">7</span>
                  <div>
                    <strong>Características Especiales</strong>
                    <p>• Perfiles de usuario persistentes con avatares<br/>
                       • Tabla de clasificación global<br/>
                       • Feedback visual inmediato (✓ / ✗)<br/>
                       • Animaciones y efectos kawaii<br/>
                       • Backend con base de datos MySQL<br/>
                       • Integración con Machine Learning para dificultad adaptativa</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Desarrolladores */}
            <div className="seccion-desarrolladores">
              <h3>👨‍💻 Equipo de Desarrollo</h3>
              <div className="devs-grid">
                <div className="dev-card">
                  <div className="dev-avatar">👨‍💻</div>
                  <p className="dev-nombre">Jefferson Pistala</p>
                  <p className="dev-rol">Frontend Developer</p>
                </div>
                <div className="dev-card">
                  <div className="dev-avatar">👨‍💻</div>
                  <p className="dev-nombre">Jeremy Yugsi</p>
                  <p className="dev-rol">Full Stack Developer / Product Owner</p>
                </div>
                <div className="dev-card">
                  <div className="dev-avatar">👨‍💻</div>
                  <p className="dev-nombre">Kevin Villacis</p>
                  <p className="dev-rol">Backend Developer</p>
                </div>
                <div className="dev-card">
                  <div className="dev-avatar">👨‍💻</div>
                  <p className="dev-nombre">Ricardo Villareal</p>
                  <p className="dev-rol">Frontend Developer</p>
                </div>
                <div className="dev-card">
                  <div className="dev-avatar">👨‍💻</div>
                  <p className="dev-nombre">Nick Valverde</p>
                  <p className="dev-rol">Full Stack Developer / Product Owner / ML Engineer</p>
                </div>
              </div>
              <p className="copyright">© 2026 Quiz Racing - Todos los derechos reservados</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VistaInicio;