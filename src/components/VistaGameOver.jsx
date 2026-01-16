import React from 'react';

function VistaGameOver({ stats, jugadores }) {
  // Determinamos quién ganó comparando puntos
  let mensaje = "¡EMPATE!";
  let avatarGanador = "🤝"; // Icono por defecto si empatan

  // Si gana el Jugador 1
  if (stats.p1.puntos > stats.p2.puntos) {
    mensaje = `¡GANADOR: ${jugadores.p1.nombre}! 🏆`;
    avatarGanador = jugadores.p1.avatar;
  }
  // Si gana el Jugador 2
  else if (stats.p2.puntos > stats.p1.puntos) {
    mensaje = `¡GANADOR: ${jugadores.p2.nombre}! 🏆`;
    avatarGanador = jugadores.p2.avatar;
  }

  return (
    <div className="pantalla-final">
      {/* Mostramos el avatar del ganador en grande */}
      <div className="trofeo-avatar">{avatarGanador}</div>

      <h1 className="titulo-gameover">FIN DEL JUEGO</h1>
      <h2 className="mensaje-ganador">{mensaje}</h2>

      <div className="resumen-final">
        {/* Tarjeta Resumen JUGADOR 1 */}
        <div className="card-resumen p1">
          <div className="avatar-resumen">{jugadores.p1.avatar}</div>
          <h3>{jugadores.p1.nombre}</h3>
          <h1>{stats.p1.puntos} PTS</h1>
          <p>Aciertos: {stats.p1.aciertos}/{stats.p1.total_respondidas}</p>
        </div>

        <div className="vs-divider">VS</div>

        {/* Tarjeta Resumen JUGADOR 2 */}
        <div className="card-resumen p2">
          <div className="avatar-resumen">{jugadores.p2.avatar}</div>
          <h3>{jugadores.p2.nombre}</h3>
          <h1>{stats.p2.puntos} PTS</h1>
          <p>Aciertos: {stats.p2.aciertos}/{stats.p2.total_respondidas}</p>
        </div>
      </div>

      <button className="btn-reiniciar" onClick={() => window.location.reload()}>
        Jugar Otra Vez 🔄
      </button>
    </div>
  );
}

export default VistaGameOver;