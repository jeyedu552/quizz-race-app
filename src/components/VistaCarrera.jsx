import React from 'react';

function VistaCarrera({ progreso }) {
  return (
     <div className="minijuego-container">
        <h1>🏁 CARRERA VS 🏁</h1>
        <div className="pista">
            <div className="carril">
                <span>P1</span>
                <div className="carro p1" style={{ left: `${progreso.p1}%` }}>🚗</div>
            </div>
            <div className="carril">
                <span>P2</span>
                <div className="carro p2" style={{ left: `${progreso.p2}%` }}>🚙</div>
            </div>
            <div className="meta">META</div>
        </div>
        <div className="debug-info" style={{color: 'white', marginTop: '20px'}}>
            P1: Tecla ESPACIO | P2: Tecla ENTER
        </div>
     </div>
  );
}

export default VistaCarrera;