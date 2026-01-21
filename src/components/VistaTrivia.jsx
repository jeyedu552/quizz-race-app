import React from "react";

function VistaTrivia({
  pregunta,
  timer,
  stats,
  jugadorActivo,
  feedback,
  nivelNombre,
  jugadores,
  loadingPregunta,
  shortTimer,
  opcionSeleccionada,
  esCorrecta,
  usaIA,
}) {
  return (
    <div className={`game-container ${feedback ? feedback.toLowerCase() : ""}`}>
      {/* Banner de urgencia del cronómetro corto */}
      {jugadorActivo && shortTimer !== null && (
        <div className="short-timer-banner">
          <div className="short-timer-label">¡Responde Rápido!</div>
          <div className="short-timer-value">{shortTimer}s</div>
        </div>
      )}

      {/* --- HUD SUPERIOR --- */}
      <div className="hud-superior">
        {/* Indicador de IA */}
        {usaIA && (
          <div className="ia-indicator" title="Pregunta seleccionada por IA">
            <span className="ia-dot" /> IA ACTIVA
          </div>
        )}
        {/* Panel Jugador 1 */}
        <div
          className={`jugador-panel ${jugadorActivo === "p1" ? "activo" : ""}`}
        >
          <div className="avatar-hud">
            <img src={jugadores.p1.avatar} alt="avatar jugador 1" />
          </div>
          <div className="info-hud">
            <h3>{jugadores.p1.nombre}</h3>
            <div className="metrics">
              <span>⭐ {stats.p1.puntos}</span>
            </div>
          </div>
        </div>

        {/* Centro */}
        <div className="centro-info">
          <div className="nivel-badge">{nivelNombre}</div>
          <div className="timer-reloj">{timer}s</div>
          {/* Burbuja secundaria del cronómetro corto */}
          {jugadorActivo && shortTimer !== null && (
            <div className="short-timer-chip">{shortTimer}s</div>
          )}
        </div>

        {/* Panel Jugador 2 */}
        <div
          className={`jugador-panel ${jugadorActivo === "p2" ? "activo" : ""}`}
        >
          <div className="info-hud" style={{ textAlign: "right" }}>
            <h3>{jugadores.p2.nombre}</h3>
            <div className="metrics">
              <span>⭐ {stats.p2.puntos}</span>
            </div>
          </div>
          <div className="avatar-hud">
            <img src={jugadores.p2.avatar} alt="avatar jugador 2" />
          </div>
        </div>
      </div>

      {/* --- ÁREA DE JUEGO --- */}
      <div className="zona-pregunta">
        {/* Aviso de Turno */}
        {!jugadorActivo ? (
          <div className="aviso-turno esperar">
            ¡PRESIONA TU BOTÓN PARA RESPONDER!
          </div>
        ) : (
          <div className="aviso-turno respondiendo">
            TURNO DE: {jugadores[jugadorActivo].nombre}
            <img
              src={jugadores[jugadorActivo].avatar}
              alt="avatar turno"
              className="avatar-turno"
            />
          </div>
        )}

        {/* --- FEEDBACK FLOTANTE MEJORADO --- */}
        {feedback === "Correcto" && (
          <div className="feedback-flotante correcto">
            <div className="icono-check">✅</div>
            <div className="texto-feedback">
              <span className="titulo-feed">¡CORRECTO!</span>
              <span className="puntos-feed">+100 PTS</span>
            </div>
          </div>
        )}

        {feedback === "Incorrecto" && (
          <div className="feedback-flotante incorrecto">
            <div className="icono-check">❌</div>
            <div className="texto-feedback">
              <span className="titulo-feed">¡INCORRECTO!</span>
              <span className="puntos-feed">0 PTS</span>
            </div>
          </div>
        )}

        {feedback === "Tiempo" && (
          <div className="feedback-flotante tiempo">
            <div className="icono-check">⏱️</div>
            <div className="texto-feedback">
              <span className="titulo-feed">¡TIEMPO!</span>
            </div>
          </div>
        )}

        {/* Tarjeta de Pregunta */}
        <div className="pregunta-card">
          {loadingPregunta ? (
            <h2>Cargando pregunta...</h2>
          ) : (
            <h2>{pregunta ? pregunta.Pregunta : "Cargando pregunta..."}</h2>
          )}
        </div>

        {/* Opciones */}
        <div
          className={`opciones-grid ${
            !jugadorActivo || loadingPregunta ? "disabled" : ""
          }`}
        >
          <div className={`opcion roja ${opcionSeleccionada === 'A' ? (esCorrecta ? 'seleccionada-correcta' : 'seleccionada-incorrecta') : ''}`} data-letra="A">
            {pregunta?.Opcion_A}
          </div>
          <div className={`opcion azul ${opcionSeleccionada === 'B' ? (esCorrecta ? 'seleccionada-correcta' : 'seleccionada-incorrecta') : ''}`} data-letra="B">
            {pregunta?.Opcion_B}
          </div>
          <div className={`opcion verde ${opcionSeleccionada === 'C' ? (esCorrecta ? 'seleccionada-correcta' : 'seleccionada-incorrecta') : ''}`} data-letra="C">
            {pregunta?.Opcion_C}
          </div>
          <div className={`opcion amarilla ${opcionSeleccionada === 'D' ? (esCorrecta ? 'seleccionada-correcta' : 'seleccionada-incorrecta') : ''}`} data-letra="D">
            {pregunta?.Opcion_D}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VistaTrivia;
