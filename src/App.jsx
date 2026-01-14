import { useState, useEffect, useRef } from 'react'
import './App.css'
import { baseDeDatosPreguntas } from './datos'
import { useInputHandler } from './useInputHandler'

// --- IMPORTAMOS LOS COMPONENTES ---
// ¡Asegúrate de haber creado el archivo VistaInicio.jsx como te dije antes!
import VistaInicio from './components/VistaInicio'
import VistaTrivia from './components/VistaTrivia'
import VistaCarrera from './components/VistaCarrera'
import VistaGameOver from './components/VistaGameOver'

function App() {
  // --- ESTADOS GENERALES ---
  // IMPORTANTE: Empezamos en 'Inicio' para mostrar el formulario primero
  const [fase, setFase] = useState('Inicio'); 
  const [preguntaActual, setPreguntaActual] = useState(null);
  const [ronda, setRonda] = useState(1);
  const [idsUsados, setIdsUsados] = useState([]);
  
  // --- CONFIGURACIÓN JUGADORES (Nombres y Avatares) ---
  // Datos por defecto para evitar errores si entras directo a Trivia
  const [infoJugadores, setInfoJugadores] = useState({
      p1: { nombre: "Jugador 1", avatar: "🤖" },
      p2: { nombre: "Jugador 2", avatar: "👽" }
  });

  // --- ESTADÍSTICAS (Puntos) ---
  const [stats, setStats] = useState({
    p1: { puntos: 0, aciertos: 0, total_respondidas: 0 },
    p2: { puntos: 0, aciertos: 0, total_respondidas: 0 }
  });
  
  const [jugadorActivo, setJugadorActivo] = useState(null); 

  // --- ESTADOS VISUALES ---
  const [timer, setTimer] = useState(30);
  const [feedback, setFeedback] = useState(null); 
  
  // Minijuego
  const [progresoCarro, setProgresoCarro] = useState({ p1: 0, p2: 0 });

  // Refs
  const [tiemposRespuesta, setTiemposRespuesta] = useState([]); 
  const tiempoInicioRef = useRef(Date.now());
  const timerRef = useRef(null);

  // --- FUNCIÓN DE INICIO (Desde el formulario) ---
  const iniciarJuego = (datosJugadores) => {
      setInfoJugadores(datosJugadores);
      setFase('Trivia');
      cargarPregunta();
  };

  const obtenerNombreNivel = (nivelNum) => {
     if (nivelNum === 1) return "🌱 FÁCIL";
     if (nivelNum === 2) return "😐 MEDIO";
     if (nivelNum === 3) return "🔥 DIFÍCIL";
     if (nivelNum >= 4) return "⚡ EXTREMO";
     return "NIVEL " + nivelNum;
  };

  // --- 1. LÓGICA DE CARGA DE PREGUNTAS ---
  const cargarPregunta = async () => {
    let nueva;
    setJugadorActivo(null); 
    setFeedback(null);
    setTimer(30);

    if (ronda <= 5) {
       // Lógica Local Fase 1
       if (!nueva) {
           const disponibles = baseDeDatosPreguntas.filter(p => p.nivel === 1 && !idsUsados.includes(p.id));
           // Si se acaban las preguntas, reiniciamos el filtro (prevención de crash)
           if (disponibles.length === 0) {
              const reset = baseDeDatosPreguntas.filter(p => p.nivel === 1);
              nueva = reset[Math.floor(Math.random() * reset.length)];
           } else {
              nueva = disponibles[Math.floor(Math.random() * disponibles.length)];
           }
       }
       tiempoInicioRef.current = Date.now();
    } 
    else {
       // Lógica Local Fase 2 (Simulada)
       if (!nueva) {
           const disponibles = baseDeDatosPreguntas.filter(p => p.nivel === 2 && !idsUsados.includes(p.id));
           // Prevención de crash si se acaban
           if (disponibles.length === 0) {
              const reset = baseDeDatosPreguntas.filter(p => p.nivel === 2);
              nueva = reset[Math.floor(Math.random() * reset.length)];
           } else {
              nueva = disponibles[Math.floor(Math.random() * disponibles.length)];
           }
       }
    }

    if (nueva) {
      setPreguntaActual(nueva);
      setIdsUsados(prev => [...prev, nueva.id]);
      tiempoInicioRef.current = Date.now();

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimer(t => {
          if (t <= 1) { manejarTiempoAgotado(); return 0; }
          return t - 1;
        });
      }, 1000);
    } else {
      setFase('Game_Over');
    }
  };

  const manejarTiempoAgotado = () => {
    clearInterval(timerRef.current);
    setFeedback('Tiempo');
    setTimeout(avanzarSiguientePaso, 2500);
  };

  const avanzarSiguientePaso = () => {
    if (ronda === 5) {
      setFase('Carrera');
      setProgresoCarro({ p1: 0, p2: 0 });
    } else if (ronda === 10) {
      setFase('Game_Over');
    } else {
      setRonda(r => r + 1);
      cargarPregunta();
    }
  };

  // --- 2. LÓGICA DE RESPUESTAS ---
  const presionarBotonGrande = (jugador) => {
    if (fase === 'Inicio') return; // Bloquear en inicio

    if (fase === 'Trivia') {
      if (!jugadorActivo && !feedback) {
        setJugadorActivo(jugador); 
      }
    } else if (fase === 'Carrera') {
      setProgresoCarro(prev => {
        const nuevoValor = prev[jugador] + 5;
        if (nuevoValor >= 95) { // Meta visual
          alert(`¡GANÓ ${infoJugadores[jugador].nombre}! +500 PTS`);
          setStats(s => ({
            ...s,
            [jugador]: { ...s[jugador], puntos: s[jugador].puntos + 500 }
          }));
          setFase('Trivia');
          setRonda(6);
          cargarPregunta();
          return { p1: 0, p2: 0 }; 
        }
        return { ...prev, [jugador]: nuevoValor };
      });
    }
  };

  const responder = (letraUsuario, textoUsuario) => {
    if (!jugadorActivo || feedback) return;

    clearInterval(timerRef.current);

    // Métricas
    const tiempoFinal = Date.now();
    const segundosTomados = (tiempoFinal - tiempoInicioRef.current) / 1000;
    setTiemposRespuesta(prev => [...prev, segundosTomados]);

    // Comparación
    const esCorrecto = textoUsuario === preguntaActual.correcta;
    
    setStats(prev => {
        const jugador = prev[jugadorActivo];
        return {
            ...prev,
            [jugadorActivo]: {
                ...jugador,
                puntos: esCorrecto ? jugador.puntos + 100 : jugador.puntos,
                aciertos: esCorrecto ? jugador.aciertos + 1 : jugador.aciertos,
                total_respondidas: jugador.total_respondidas + 1
            }
        };
    });

    setFeedback(esCorrecto ? 'Correcto' : 'Incorrecto');
    setTimeout(avanzarSiguientePaso, 2500);
  };

  // --- 3. INPUT HANDLER ---
  useInputHandler({
    onBigButton: presionarBotonGrande,
    onRed:    () => responder("A", preguntaActual?.opcion_a),
    onBlue:   () => responder("B", preguntaActual?.opcion_b),
    onGreen:  () => responder("C", preguntaActual?.opcion_c),
    onYellow: () => responder("D", preguntaActual?.opcion_d),
  });

  // --- 4. RENDERIZADO ---
  if (fase === 'Inicio') {
      return <VistaInicio onIniciar={iniciarJuego} />;
  }

  if (fase === 'Game_Over') {
      // AQUÍ PASAMOS infoJugadores
      return <VistaGameOver stats={stats} jugadores={infoJugadores} />;
  }
  
  if (fase === 'Carrera') {
      // AQUÍ TAMBIÉN
      return <VistaCarrera progreso={progresoCarro} jugadores={infoJugadores} />;
  }

  // Vista Normal (Trivia)
  return (
    <VistaTrivia 
        pregunta={preguntaActual}
        timer={timer}
        stats={stats}
        jugadores={infoJugadores} 
        jugadorActivo={jugadorActivo}
        feedback={feedback}
        nivelNombre={preguntaActual ? obtenerNombreNivel(preguntaActual.nivel) : ''}
    />
  );
}

export default App