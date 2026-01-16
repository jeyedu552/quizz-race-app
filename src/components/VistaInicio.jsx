import React, { useState } from 'react';

const AVATARES = ['🐶', '🐱', '🦊', '🐼', '🐨', '🐯', '🦁', '🐷', '🦄', '🐲', '👽', '🤖'];

function VistaInicio({ onIniciar }) {
  const [p1Nombre, setP1Nombre] = useState('');
  const [p2Nombre, setP2Nombre] = useState('');
  const [p1Avatar, setP1Avatar] = useState(AVATARES[0]);
  const [p2Avatar, setP2Avatar] = useState(AVATARES[1]);

  const manejarInicio = () => {
    if (!p1Nombre.trim() || !p2Nombre.trim()) {
      alert("¡Por favor ingresen sus nombres!");
      return;
    }
    onIniciar({
      p1: { nombre: p1Nombre, avatar: p1Avatar },
      p2: { nombre: p2Nombre, avatar: p2Avatar }
    });
  };

  return (
    <div className="inicio-container">
      <h1 className="titulo-juego">🧠 QUIZ RACING 🏎️</h1>

      <div className="seleccion-jugadores">
        {/* JUGADOR 1 */}
        <div className="card-jugador p1">
          <h2>JUGADOR 1</h2>
          <input
            type="text"
            placeholder="Nombre P1"
            value={p1Nombre}
            onChange={(e) => setP1Nombre(e.target.value)}
            maxLength={10}
          />
          <div className="grid-avatares">
            {AVATARES.map(av => (
              <button
                key={av}
                className={`btn-avatar ${p1Avatar === av ? 'seleccionado' : ''}`}
                onClick={() => setP1Avatar(av)}
              >
                {av}
              </button>
            ))}
          </div>
        </div>

        <div className="vs-badge">VS</div>

        {/* JUGADOR 2 */}
        <div className="card-jugador p2">
          <h2>JUGADOR 2</h2>
          <input
            type="text"
            placeholder="Nombre P2"
            value={p2Nombre}
            onChange={(e) => setP2Nombre(e.target.value)}
            maxLength={10}
          />
          <div className="grid-avatares">
            {AVATARES.map(av => (
              <button
                key={av}
                className={`btn-avatar ${p2Avatar === av ? 'seleccionado' : ''}`}
                onClick={() => setP2Avatar(av)}
              >
                {av}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button className="btn-iniciar" onClick={manejarInicio}>
        ¡COMENZAR! 🚀
      </button>
    </div>
  );
}

export default VistaInicio;