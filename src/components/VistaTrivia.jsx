import React from 'react';

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
  nivelNombre 
}) {

  const totalRondas = Array.from({ length: 10 }, (_, i) => i + 1);
  const porcentajeProgreso = Math.min(((ronda - 1) / 9) * 100, 100);

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

        <div className="pregunta-card">
          <h2>
            {pregunta ? (pregunta.pregunta || pregunta.Pregunta) : "Cargando..."}
          </h2>
        </div>

        <div className={`opciones-grid ${!jugadorActivo ? 'disabled' : ''}`}>
          <div className="opcion roja" data-letra="A">{pregunta?.opcion_a || pregunta?.Opcion_A}</div>
          <div className="opcion azul" data-letra="B">{pregunta?.opcion_b || pregunta?.Opcion_B}</div>
          <div className="opcion verde" data-letra="C">{pregunta?.opcion_c || pregunta?.Opcion_C}</div>
          <div className="opcion amarilla" data-letra="D">{pregunta?.opcion_d || pregunta?.Opcion_D}</div>
        </div>
      </div>
    </div>
  );
}

export default VistaTrivia;