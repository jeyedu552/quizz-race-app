import React, { useEffect, useRef } from "react";
import { fetchCargarPuntaje } from "./../services/preguntas";

function VistaGameOver({ stats, jugadores, onVolverInicio }) {
  const puntajeGuardado = useRef(false);

  const cargarDatosPuntaje = async () => {
    const resultado = await fetchCargarPuntaje(
      jugadores.p1.id_usuario,
      stats.p1.puntos,
      jugadores.p2.id_usuario,
      stats.p2.puntos,
    );
    console.log("Resultado de cargar puntaje:", resultado);
  };

  useEffect(() => {
    console.log("VistaGameOver montada");
    console.log("Estadísticas:", stats);
    console.log("Jugadores:", jugadores);

    // Solo ejecutar si no se ha guardado antes
    if (!puntajeGuardado.current) {
      console.log("Agregar estadisticas");
      puntajeGuardado.current = true;
      cargarDatosPuntaje();
    }
  }, [cargarDatosPuntaje, jugadores, stats]);

  // Lógica para determinar ganador y perdedor
  let ganadorData, perdedorData;
  let esEmpate = false;

  if (stats.p1.puntos > stats.p2.puntos) {
    ganadorData = { ...stats.p1, ...jugadores.p1, id: "p1" };
    perdedorData = { ...stats.p2, ...jugadores.p2, id: "p2" };
  } else if (stats.p2.puntos > stats.p1.puntos) {
    ganadorData = { ...stats.p2, ...jugadores.p2, id: "p2" };
    perdedorData = { ...stats.p1, ...jugadores.p1, id: "p1" };
  } else {
    esEmpate = true;
    // En caso de empate, tratamos al P1 como "ganador visual" por defecto pero cambiamos el texto
    ganadorData = { ...stats.p1, ...jugadores.p1, id: "p1" };
    perdedorData = { ...stats.p2, ...jugadores.p2, id: "p2" };
  }

  // Cálculo simple de porcentaje de aciertos (evitando división por cero)
  const calcPorcentaje = (aciertos, total) =>
    total > 0 ? Math.round((aciertos / total) * 100) : 0;

  return (
    <div className="victory-container">
      {/* Fondo de Confeti Estático */}
      <div className="confetti-layer">
        <div className="confetti c-1"></div>
        <div className="confetti c-2"></div>
        <div className="confetti c-3"></div>
        <div className="confetti c-4"></div>
        <div className="confetti c-5"></div>
        <div className="confetti c-6"></div>
        <div className="confetti c-7"></div>
        <div className="confetti c-8"></div>
        <div className="confetti c-9"></div>
      </div>

      {/* Header Minimalista */}
      <header className="victory-header">
        <div className="icon-btn text-primary">
          <span className="material-symbols-outlined">pets</span>
        </div>
        <button className="icon-btn" onClick={() => (onVolverInicio ? onVolverInicio() : window.location.reload())}>
          <span className="material-symbols-outlined">home</span>
        </button>
      </header>

      {/* Contenido Principal */}
      <div className="victory-content">
        {/* Título */}
        <div className="titulo-victoria">
          <h1>
            {esEmpate ? (
              "¡ES UN EMPATE!"
            ) : (
              <>
                ¡GANADOR:{" "}
                <span className="text-primary">{ganadorData.nombre}!</span>
              </>
            )}
          </h1>
          <p>¡INCREÍBLE TRABAJO, PILOTOS!</p>
        </div>

        {/* Podio y Personaje */}
        <div className="podio-section">
          <div className="avatar-ganador-container">
            {/* Avatar del Ganador en Grande */}
            <img
              src={ganadorData.avatar}
              alt="Ganador"
              className="img-ganador"
            />
          </div>

          <div className="podio-base">
            <span className="rank-numero">1</span>
            <span className="material-symbols-outlined sparkle s-1">spark</span>
            <span className="material-symbols-outlined sparkle s-2">star</span>
          </div>
        </div>

        {/* Tarjetas de Estadísticas */}
        <div className="stats-grid">
          {/* Tarjeta Ganador (Dorada) */}
          <div className="card-stat winner">
            <div className="badge-campeon">CAMPEÓN</div>
            <img
              src={ganadorData.avatar}
              alt="Avatar"
              className="mini-avatar"
            />
            <div className="info-stat">
              <h2>{ganadorData.nombre}</h2>
              <div className="puntaje-row">
                <span className="material-symbols-outlined">emoji_events</span>
                <span>{ganadorData.puntos} PTS</span>
              </div>
              <div className="barra-progreso">
                <div
                  className="barra-relleno"
                  style={{
                    width: `${calcPorcentaje(ganadorData.aciertos, ganadorData.total_respondidas)}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Tarjeta Segundo Lugar (Simple) */}
          <div className="card-stat loser">
            <img
              src={perdedorData.avatar}
              alt="Avatar"
              className="mini-avatar"
              style={{ filter: "grayscale(0.5)" }}
            />
            <div className="info-stat">
              <h2>{perdedorData.nombre}</h2>
              <div className="puntaje-row">
                <span className="material-symbols-outlined">star</span>
                <span>{perdedorData.puntos} PTS</span>
              </div>
              <div className="barra-progreso">
                <div
                  className="barra-relleno"
                  style={{
                    width: `${calcPorcentaje(perdedorData.aciertos, perdedorData.total_respondidas)}%`,
                    background: "#9ca3af",
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Mensaje para volver a jugar con la tecla R */}
        <p style={{ textAlign: 'center', marginTop: 12, color: '#fff' }}>Presiona R si quieres volver a jugar</p>

        {/* Botón Jugar Otra Vez */}
        <button className="btn-replay" onClick={() => (onVolverInicio ? onVolverInicio() : window.location.reload())}>
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "2rem" }}
          >
            replay
          </span>
          JUGAR OTRA Vez
        </button>
      </div>
    </div>
  );
}

export default VistaGameOver;
