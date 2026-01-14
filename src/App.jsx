import { useState, useEffect, useRef } from 'react'
import './App.css'
import { baseDeDatosPreguntas } from './datos'
import { useInputHandler } from './useInputHandler'

// --- IMPORTAMOS LOS COMPONENTES ---
import VistaInicio from './components/VistaInicio'
import VistaTrivia from './components/VistaTrivia'
import VistaCarrera from './components/VistaCarrera'
import VistaGameOver from './components/VistaGameOver'

function App() {
  // --- ESTADOS GENERALES ---
  const [fase, setFase] = useState('Inicio'); 
  const [preguntaActual, setPreguntaActual] = useState(null);
  const [ronda, setRonda] = useState(1);
  const [idsUsados, setIdsUsados] = useState([]);
  
  // --- CONFIGURACIÓN JUGADORES ---
  const [infoJugadores, setInfoJugadores] = useState({
      p1: { nombre: "Jugador 1", avatar: "🤖" },
      p2: { nombre: "Jugador 2", avatar: "👽" }
  });

  // --- ESTADÍSTICAS ---
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

  // Refs para métricas
  const [tiemposRespuesta, setTiemposRespuesta] = useState([]); 
  const tiempoInicioRef = useRef(Date.now());
  const timerRef = useRef(null);

  // --- FUNCIÓN DE INICIO ---
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

  // --- 1. LÓGICA DE CARGA DE PREGUNTAS  ---
  const cargarPregunta = async () => {
    let nueva;
    setJugadorActivo(null); 
    setFeedback(null);
    setTimer(30);

    // ============================================================
    // FASE 1: RONDAS 1-5 (
    // ============================================================
    if (ronda <= 5) {
       
       // -------------------------------------------------------
       // [BACKEND] BLOQUE COMENTADO 
       // -------------------------------------------------------
       /* try {
           console.log(" Conectando con Backend: Pregunta Fácil...");
           const respuesta = await fetch('http://127.0.0.1:5000/preguntafacil', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ lista_ids_cache: idsUsados })
           });
           const data = await respuesta.json();
           
           // Asignamos la pregunta recibida del servidor
           if (data) nueva = data.pregunta || data; 
           
       } catch (error) {
           console.error("Error conectando al Backend (Fase 1):", error);
       } 
       */
       // -------------------------------------------------------

       // Lógica Local 
       if (!nueva) {
           const disponibles = baseDeDatosPreguntas.filter(p => p.nivel === 1 && !idsUsados.includes(p.id));
           // Si se acaban, reiniciamos filtro 
           if (disponibles.length === 0) {
              const reset = baseDeDatosPreguntas.filter(p => p.nivel === 1);
              nueva = reset[Math.floor(Math.random() * reset.length)];
           } else {
              nueva = disponibles[Math.floor(Math.random() * disponibles.length)];
           }
       }
       tiempoInicioRef.current = Date.now();
    } 
    // ============================================================
    // FASE 2: RONDAS 6-10 (IA / Adaptativo)
    // ============================================================
    else {
       
       // -------------------------------------------------------
       // [BACKEND] BLOQUE COMENTADO 
       // -------------------------------------------------------
       /* try {
           // 1. Calculamos métricas actuales para enviar al modelo
           const sumaTiempos = tiemposRespuesta.reduce((a, b) => a + b, 0);
           const promedioTiempos = tiemposRespuesta.length > 0 ? (sumaTiempos / tiemposRespuesta.length) : 5;
           const mejorPuntaje = Math.max(stats.p1.puntos, stats.p2.puntos);

           const datosParaEnviar = {
               tiempo_respuesta_seg: promedioTiempos, 
               aciertos_pct_ult5: (mejorPuntaje / 500) * 100, // Estimado simple
               ID_seleccionados: idsUsados 
           };

           console.log("Enviando métricas a la IA:", datosParaEnviar);

           const respuesta = await fetch('http://127.0.0.1:5000/predecir', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify(datosParaEnviar)
           });

           const data = await respuesta.json();

           // Opción A: El backend devuelve la pregunta completa
           if (data.pregunta) {
               nueva = data.pregunta;
           } 
       } catch (error) {
           console.error("Error conectando al Backend: ", error);
       } 
       */
       // -------------------------------------------------------

       // Lógica Local 
       if (!nueva) {
           const disponibles = baseDeDatosPreguntas.filter(p => p.nivel === 2 && !idsUsados.includes(p.id));
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
    if (fase === 'Inicio') return; 

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
      return <VistaGameOver stats={stats} jugadores={infoJugadores} />;
  }
  
  if (fase === 'Carrera') {
      return <VistaCarrera progreso={progresoCarro} jugadores={infoJugadores} />;
  }

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