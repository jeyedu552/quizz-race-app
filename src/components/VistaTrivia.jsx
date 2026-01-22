import React, { useState, useEffect, useRef } from 'react';
import botonRojoGif from '../assets/boton-rojo.gif';

// Icono simple de check
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

function VistaTrivia({
  pregunta,
  timer,
  stats,
  jugadorActivo,
  feedback,
  jugadores,
  ronda,
  shortTimer,
  nivelNombre,
  usaIA,
  aciertosSeguidos,
  respuestaSeleccionada
}) {

  const totalRondas = Array.from({ length: 10 }, (_, i) => i + 1);
  const porcentajeProgreso = Math.min(((ronda - 1) / 9) * 100, 100);

  // El toggle de IA se activa solo si usaIA es true Y el nivel NO es fácil
  const iaActiva = usaIA && nivelNombre && !nivelNombre.includes('FÁCIL');

  // Estado local para mostrar la alerta cuando el toggle cambia
  const [mostrarAlerta, setMostrarAlerta] = useState(false);
  const [mensajeAlerta, setMensajeAlerta] = useState('');
  const iaActivaAnterior = useRef(false);
  const rondaAnterior = useRef(ronda);

  // Detectar cuando el toggle cambia a activado
  useEffect(() => {
    if (iaActiva && !iaActivaAnterior.current) {
      setMensajeAlerta('Modo IA activado - Responde con cuidado');
      setMostrarAlerta(true);
      setTimeout(() => {
        setMostrarAlerta(false);
      }, 3000);
    }
    iaActivaAnterior.current = iaActiva;
  }, [iaActiva]);

  // Alertas de aproximación: solo al INICIO de la ronda, verificando que las anteriores fueron correctas
  useEffect(() => {
    // Solo mostrar alertas cuando la ronda cambia (no durante la ronda actual)
    if (ronda !== rondaAnterior.current) {
      // Ronda 4: Si ya tiene 3 aciertos seguidos (respondió bien rondas 1, 2 y 3)
      if (ronda === 4 && aciertosSeguidos === 3) {
        setMensajeAlerta('🤖 Modo de IA aproximándose, 2 intentos más');
        setMostrarAlerta(true);
        setTimeout(() => {
          setMostrarAlerta(false);
        }, 3000);
      }

      // Ronda 5: Si ya tiene 4 aciertos seguidos (respondió bien rondas 1, 2, 3 y 4)
      if (ronda === 5 && aciertosSeguidos === 4) {
        setMensajeAlerta('🤖 Modo IA aproximándose, 1 intento más');
        setMostrarAlerta(true);
        setTimeout(() => {
          setMostrarAlerta(false);
        }, 3000);
      }

      rondaAnterior.current = ronda;
    }
  }, [ronda, aciertosSeguidos]);

  return (
    <div className={`game-container ${feedback ? feedback.toLowerCase() : ''}`}>

      {/* Banner de urgencia (3s) */}
      {jugadorActivo && shortTimer !== null && (
        <div className="short-timer-banner">
          <div className="short-timer-label">¡Responde Rápido!</div>
          <div className="short-timer-value">{shortTimer}s</div>
        </div>
      )}

      {/* --- HUD SUPERIOR --- */}
      <div className="hud-superior">
        
        {/* === JUGADOR 1 === */}
        <div className={`jugador-panel ${jugadorActivo === 'p1' ? 'activo' : ''}`}>
          <div className="avatar-hud">
            <img src={jugadores.p1.avatar} alt="avatar p1" />
          </div>
          <div className="info-hud">
            <h3>{jugadores.p1.nombre}</h3>
            <div className="metrics">
              <span>⭐ {stats.p1.puntos}</span>
            </div>
          </div>
        </div>

        {/* === BARRA CENTRAL === */}
        <div className="hud-central-nuevo">
          {nivelNombre && (
             <div className="nivel-badge">{nivelNombre}</div>
          )}

          {/* Toggle de IA */}
          <div className={`toggle-ia ${iaActiva ? 'activado' : 'desactivado'}`}>
            <div className="toggle-icono">✨</div>
            <span className="toggle-texto">
              {iaActiva ? 'IA activada' : 'IA desactivada'}
            </span>
            <div className="toggle-circulo"></div>
          </div>

          <span className="label-rondas">Rondas</span>
          
          <div className="barra-track-container">
            <div className="linea-fondo">
              <div className="parte-normal"></div>
              <div className="parte-ia"></div>
            </div>

            <div className="linea-progreso" style={{ width: `${porcentajeProgreso}%` }}></div>

            {totalRondas.map((num) => {
              let claseNodo = "nodo-ronda";
              let contenido = null;

              if (num < ronda) {
                claseNodo += " completado";
                if (num >= 6) claseNodo += " fase-ia"; 
                contenido = <CheckIcon />;
              } else if (num === ronda) {
                claseNodo += " actual";
                contenido = num;
              } else {
                if (num === 6) { 
                  claseNodo += " ia futuro";
                  contenido = "IA";
                } else if (num > 6) {
                   claseNodo += " ia-futuro-simple";
                } else {
                   claseNodo += " futuro";
                }
              }

              return (
                <div key={num} className={claseNodo}>
                  {contenido}
                </div>
              );
            })}
          </div>

          <div className="timer-nuevo-container">
            <div className="timer-nuevo-bg"></div>
            <div className="timer-circulo">
               <span className="timer-numero">{timer}</span>
               <span className="timer-label">SEC</span>
            </div>
          </div>
        </div>

        {/* === JUGADOR 2 === */}
        <div className={`jugador-panel ${jugadorActivo === 'p2' ? 'activo' : ''}`}>
          <div className="info-hud" style={{ textAlign: 'right' }}>
            <h3>{jugadores.p2.nombre}</h3>
            <div className="metrics">
              <span>⭐ {stats.p2.puntos}</span>
            </div>
          </div>
          <div className="avatar-hud">
            <img src={jugadores.p2.avatar} alt="avatar p2" />
          </div>
        </div>
      </div>

      {/* --- ÁREA DE JUEGO --- */}
      <div className="zona-pregunta">
        {!jugadorActivo ? (
          <div className="aviso-turno esperar">¡PRESIONA TU BOTÓN PARA RESPONDER!</div>
        ) : (
            <div className="aviso-turno respondiendo">
                TURNO DE: {jugadores[jugadorActivo].nombre}
                <img src={jugadores[jugadorActivo].avatar} alt="turno" className="avatar-turno"/>
            </div>
        )}

        {/* Feedback Flotante */}
        {feedback === 'Correcto' && (
          <div className="feedback-flotante correcto">
            <div className="icono-check">✅</div>
            <div className="texto-feedback">
              <span className="titulo-feed">Correcto!! Punto para ti</span>
              <span className="puntos-feed">+100 PTS</span>
            </div>
          </div>
        )}
        {feedback === 'Incorrecto' && (
          <div className="feedback-flotante incorrecto">
            <div className="icono-check">❌</div>
            <div className="texto-feedback">
              <span className="titulo-feed">¡Uy, cerca! ¡No te rindas!</span>
              <span className="puntos-feed">0 PTS</span>
            </div>
          </div>
        )}
        {feedback && feedback.includes("Tiempo") && (
          <div className="feedback-flotante tiempo">
            <div className="icono-check">⏱️</div>
            <div className="texto-feedback">
                <span className="titulo-feed">¡TIEMPO AGOTADO!</span>
            </div>
          </div>
        )}

        {/* Alerta de Modo IA Activado - Versión Simple */}
        {mostrarAlerta && (
          <div className="alerta-ia-simple">
            <span className="alerta-ia-icono-simple">🤖</span>
            <span className="alerta-ia-mensaje">{mensajeAlerta}</span>
          </div>
        )}

        <div className="pregunta-container-con-botones">
          <img src={botonRojoGif} alt="boton" className="boton-gif-izquierdo" />
          <div className="pregunta-card">
            <h2>
              {pregunta ? (pregunta.pregunta || pregunta.Pregunta) : "Cargando..."}
            </h2>
          </div>
          <img src={botonRojoGif} alt="boton" className="boton-gif-derecho" />
        </div>

        <div className={`opciones-grid ${!jugadorActivo ? 'disabled' : ''}`}>
          <div 
            className={`opcion roja ${respuestaSeleccionada?.letra === 'A' ? (respuestaSeleccionada.correcta ? 'correcta-seleccionada' : 'incorrecta-seleccionada') : ''} ${respuestaSeleccionada && !respuestaSeleccionada.correcta && respuestaSeleccionada.letraCorrecta === 'A' ? 'correcta-mostrar' : ''}`} 
            data-letra="A"
          >
            {pregunta?.opcion_a || pregunta?.Opcion_A}
          </div>
          <div 
            className={`opcion azul ${respuestaSeleccionada?.letra === 'B' ? (respuestaSeleccionada.correcta ? 'correcta-seleccionada' : 'incorrecta-seleccionada') : ''} ${respuestaSeleccionada && !respuestaSeleccionada.correcta && respuestaSeleccionada.letraCorrecta === 'B' ? 'correcta-mostrar' : ''}`} 
            data-letra="B"
          >
            {pregunta?.opcion_b || pregunta?.Opcion_B}
          </div>
          <div 
            className={`opcion verde ${respuestaSeleccionada?.letra === 'C' ? (respuestaSeleccionada.correcta ? 'correcta-seleccionada' : 'incorrecta-seleccionada') : ''} ${respuestaSeleccionada && !respuestaSeleccionada.correcta && respuestaSeleccionada.letraCorrecta === 'C' ? 'correcta-mostrar' : ''}`} 
            data-letra="C"
          >
            {pregunta?.opcion_c || pregunta?.Opcion_C}
          </div>
          <div 
            className={`opcion amarilla ${respuestaSeleccionada?.letra === 'D' ? (respuestaSeleccionada.correcta ? 'correcta-seleccionada' : 'incorrecta-seleccionada') : ''} ${respuestaSeleccionada && !respuestaSeleccionada.correcta && respuestaSeleccionada.letraCorrecta === 'D' ? 'correcta-mostrar' : ''}`} 
            data-letra="D"
          >
            {pregunta?.opcion_d || pregunta?.Opcion_D}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VistaTrivia;