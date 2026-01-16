import React, { useState } from 'react';

// Importamos los png (Manteniendo tus avatares originales)
import batman from '../assets/avatars/batman.png';
import spiderman from '../assets/avatars/spiderman.png';
import ariel from '../assets/avatars/ariel.jpg';
import capitanAmerica from '../assets/avatars/capitanAmerica.png';
import cenicienta from '../assets/avatars/cenicienta.jpg';
import rapunzel from '../assets/avatars/rapunzel.jpg';
import superman from '../assets/avatars/superman.png';
import wonderwoman from '../assets/avatars/wonderwoman.png';

// Lista completa de avatares
const AVATARES = [batman, spiderman, superman, capitanAmerica, wonderwoman, cenicienta, rapunzel, ariel];

function VistaInicio({ onIniciar }) {
  const [p1Nombre, setP1Nombre] = useState('');
  const [p2Nombre, setP2Nombre] = useState('');
  const [p1Avatar, setP1Avatar] = useState(AVATARES[0]);
  const [p2Avatar, setP2Avatar] = useState(AVATARES[1]);

  const manejarInicio = () => {
    if (!p1Nombre.trim() || !p2Nombre.trim()) {
      alert("¡Por favor ingresen sus nombres, pilotos! 🏎️");
      return;
    }
    onIniciar({
      p1: { nombre: p1Nombre, avatar: p1Avatar },
      p2: { nombre: p2Nombre, avatar: p2Avatar }
    });
  };

  return (
    <div className="inicio-container">
      {/* Fondo decorativo (Blobs) */}
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>

      {/* Header */}
      <header className="header-inicio">
        <div className="badge-pilotos">
          <div className="icon-badge">
            <span className="material-symbols-outlined">sports_score</span>
          </div>
          <span className="text-badge">Escuela de Pilotos</span>
        </div>
        <h1 className="titulo-juego">
          QUIZ RACING
        </h1>
      </header>

      {/* Layout de Tarjetas */}
      <div className="seleccion-jugadores">
        
        {/* Tarjeta JUGADOR 1 (Pink) */}
        <div className="card-jugador p1">
          <div className="tag-jugador">JUGADOR 1</div>
          
          <div className="mt-4">
            <label className="input-label">¿Cómo te llamas?</label>
            <input 
              type="text" 
              placeholder="Nombre..." 
              value={p1Nombre}
              onChange={(e) => setP1Nombre(e.target.value)}
              maxLength={10}
            />
          </div>

          <div>
            <span className="input-label">Elige tu avatar:</span>
            <div className="grid-avatares">
              {AVATARES.map((av, index) => (
                <button 
                  key={index} 
                  className={`btn-avatar ${p1Avatar === av ? 'seleccionado' : ''}`}
                  onClick={() => setP1Avatar(av)}
                >
                  <img src={av} alt="avatar" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* VS Badge Central */}
        <div className="vs-badge">
          <span className="vs-text">VS</span>
        </div>

        {/* Tarjeta JUGADOR 2 (Green) */}
        <div className="card-jugador p2">
          <div className="tag-jugador">JUGADOR 2</div>
          
          <div className="mt-4">
            <label className="input-label">¿Cómo te llamas?</label>
            <input 
              type="text" 
              placeholder="Nombre..." 
              value={p2Nombre}
              onChange={(e) => setP2Nombre(e.target.value)}
              maxLength={10}
            />
          </div>

          <div>
            <span className="input-label">Elige tu avatar:</span>
            <div className="grid-avatares">
              {AVATARES.map((av, index) => (
                <button 
                  key={index} 
                  className={`btn-avatar ${p2Avatar === av ? 'seleccionado' : ''}`}
                  onClick={() => setP2Avatar(av)}
                >
                  <img src={av} alt="avatar" />
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Botón de Inicio */}
      <button className="btn-iniciar" onClick={manejarInicio}>
        <span className="material-symbols-outlined" style={{fontSize: '2.5rem'}}>play_circle</span>
        ¡COMENZAR!
      </button>

    </div>
  );
}

export default VistaInicio;