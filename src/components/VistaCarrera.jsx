import React, { useEffect, useState } from 'react';

function VistaCarrera({ progreso, jugadores }) {
  // Estado local para detectar si se están moviendo (para efecto visual de turbo)
  const [moviendoP1, setMoviendoP1] = useState(false);
  const [moviendoP2, setMoviendoP2] = useState(false);

  // Usamos un pequeño retraso (10ms) para evitar el "Cascading Render Error"
  useEffect(() => {
    if (progreso.p1 === 0) return; // No animar si se reinicia

    const startTimer = setTimeout(() => setMoviendoP1(true), 10);
    const endTimer = setTimeout(() => setMoviendoP1(false), 250); // Dura un poco más

    return () => {
        clearTimeout(startTimer);
        clearTimeout(endTimer);
    };
  }, [progreso.p1]);

  useEffect(() => {
    if (progreso.p2 === 0) return;

    const startTimer = setTimeout(() => setMoviendoP2(true), 10);
    const endTimer = setTimeout(() => setMoviendoP2(false), 250);

    return () => {
        clearTimeout(startTimer);
        clearTimeout(endTimer);
    };
  }, [progreso.p2]);
  // -----------------------

  return (
    <div className="minijuego-container">
      <div className="marco-juego">
        
        {/* Header Flotante */}
        <div className="header-flotante">
          <div className="cartel-titulo">
            <h1>🏁 ¡CARRERA RÁPIDA! 🏁</h1>
            <p>¡Presiona tu botón repetidamente para acelerar!</p>
          </div>
        </div>

        {/* Área de Pista */}
        <div className="pista-area">
          
          {/* Meta */}
          <div className="linea-meta">
            <div className="patron-ajedrez"></div>
          </div>

          {/* Carril JUGADOR 1 */}
          <div className="carril p1">
             <div 
                className={`kart-grupo ${moviendoP1 ? 'moviendo' : ''}`} 
                style={{ left: `${Math.min(progreso.p1, 90)}%` }} // Tope visual 90%
             >
                {/* Efecto Viento/Turbo */}
                <div className="turbo-viento">
                   <div className="linea-viento" style={{width: '60px'}}></div>
                   <div className="linea-viento" style={{width: '90px', marginLeft: '-20px'}}></div>
                   <div className="linea-viento" style={{width: '40px'}}></div>
                </div>

                {/* Etiqueta Nombre */}
                <div className="etiqueta-jugador">P1: {jugadores.p1.nombre}</div>
                
                {/* Kart Cuerpo */}
                <div className="kart-cuerpo">
                   <div className="avatar-circulo">
                      <img src={jugadores.p1.avatar} alt="P1" />
                   </div>
                   
                   {/* Base del Kart */}
                   <div className="kart-base">
                      <span style={{position:'absolute', right:'-10px', top:'5px', fontSize:'1.5rem'}}>💨</span>
                   </div>
                   <div className="rueda izq"></div>
                   <div className="rueda der"></div>
                </div>
             </div>
          </div>

          {/* Carril JUGADOR 2 */}
          <div className="carril p2">
             <div 
                className={`kart-grupo ${moviendoP2 ? 'moviendo' : ''}`} 
                style={{ left: `${Math.min(progreso.p2, 90)}%` }}
             >
                {/* Efecto Viento */}
                <div className="turbo-viento">
                   <div className="linea-viento" style={{width: '70px'}}></div>
                   <div className="linea-viento" style={{width: '50px', marginLeft: '10px'}}></div>
                   <div className="linea-viento" style={{width: '80px', marginLeft: '-10px'}}></div>
                </div>

                <div className="etiqueta-jugador">P2: {jugadores.p2.nombre}</div>
                
                <div className="kart-cuerpo">
                   <div className="avatar-circulo">
                      <img src={jugadores.p2.avatar} alt="P2" />
                   </div>
                   
                   <div className="kart-base">
                      <span style={{position:'absolute', right:'-10px', top:'5px', fontSize:'1.5rem'}}>💨</span>
                   </div>
                   <div className="rueda izq"></div>
                   <div className="rueda der"></div>
                </div>
             </div>
          </div>

        </div>

        {/* Footer Controles */}
        <div className="footer-controles">
           
           {/* Control P1 */}
           <div className="panel-control p1">
              <div className="borde-color"></div>
              <div className="tecla-arcade">
                 <span className="material-symbols-outlined">space_bar</span>
                 ESPACIO
              </div>
           </div>

           {/* Control P2 */}
           <div className="panel-control p2">
              <div className="borde-color"></div>
              <div className="tecla-arcade">
                 <span className="material-symbols-outlined">keyboard_return</span>
                 ENTER
              </div>
           </div>

        </div>

      </div>
    </div>
  );
}

export default VistaCarrera;