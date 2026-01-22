import { useState, useEffect, useRef } from "react";
import "./App.css";
import { baseDeDatosPreguntas } from "./datos";
import { useInputHandler } from "./useInputHandler";

// --- IMPORTACIÓN DE COMPONENTES ---
import VistaInicio from "./components/VistaInicio";
import VistaTrivia from "./components/VistaTrivia";
import VistaCarrera from "./components/VistaCarrera";
import VistaGameOver from "./components/VistaGameOver";
import {
  fetchPreguntaFacil,
  fetchPredecir,
  guardarPuntajeFinal,
} from "./services/preguntas";

function App() {
  // --- ESTADOS GENERALES DE LA APLICACIÓN ---
  const [fase, setFase] = useState("Inicio");
  const [preguntaActual, setPreguntaActual] = useState(null);
  const [ronda, setRonda] = useState(1);
  const [idsUsados, setIdsUsados] = useState([]);
  const [preguntas, setPreguntas] = useState([]);
  const [loadingPregunta, setLoadingPregunta] = useState(false);
  const [usaIA, setUsaIA] = useState(false); 

  // --- CONFIGURACIÓN DE JUGADORES ---
  const [infoJugadores, setInfoJugadores] = useState({
    p1: { nombre: "Jugador 1", avatar: "🤖" },
    p2: { nombre: "Jugador 2", avatar: "👽" },
  });

  const [ultimaSeleccionIds, setUltimaSeleccionIds] = useState(null);

  // --- ESTADÍSTICAS Y PUNTAJES ---
  const [stats, setStats] = useState({
    p1: { puntos: 0, aciertos: 0, total_respondidas: 0 },
    p2: { puntos: 0, aciertos: 0, total_respondidas: 0 },
  });

  const [jugadorActivo, setJugadorActivo] = useState(null);

  // --- ESTADOS DE CONTROL VISUAL Y TIEMPO ---
  const [timer, setTimer] = useState(30);
  const [feedback, setFeedback] = useState(null);
  const [shortTimer, setShortTimer] = useState(null); 
  const [progresoCarro, setProgresoCarro] = useState({ p1: 0, p2: 0 });

  // --- REFERENCIAS DE CONTROL (IMPORTANTE) ---
  const rondaRef = useRef(ronda);
  const timerRef = useRef(null);
  const shortTimerRef = useRef(null);
  const tiempoInicioRef = useRef(0);
  
  // 🔒 CANDADO PARA EVITAR CARGA DOBLE DE PREGUNTAS
  const isFetchingRef = useRef(false);

  const [tiemposRespuesta, setTiemposRespuesta] = useState([]);

  // Sincronizar rondaRef
  useEffect(() => {
    rondaRef.current = ronda;
  }, [ronda]);

  // --- EFECTO: VIGILANTE DE LA CARRERA ---
  useEffect(() => {
    if (fase === "Carrera") {
      let ganador = null;
      if (progresoCarro.p1 >= 95) ganador = "p1";
      else if (progresoCarro.p2 >= 95) ganador = "p2";

      if (ganador) {
        alert(`¡GANÓ ${infoJugadores[ganador].nombre}! +200 PTS`);
        setStats((s) => ({
          ...s,
          [ganador]: { ...s[ganador], puntos: s[ganador].puntos + 200 },
        }));

        setFase("Trivia");
        setRonda(6);
        setProgresoCarro({ p1: 0, p2: 0 });
        // Forzamos carga de la 6 con un pequeño timeout para asegurar limpieza
        setTimeout(() => cargarPregunta(6), 100);
      }
    }
  }, [progresoCarro, fase, infoJugadores]);

  const [volverCargando, setVolverCargando] = useState(false);

  // --- LÓGICA DE CARGA BLINDADA (EVITA DOBLE FETCH) ---
  const cargarPregunta = async (rondaOverride = null) => {
    // 1. SI EL CANDADO ESTÁ CERRADO, NOS VAMOS.
    if (isFetchingRef.current) return;
    
    // 2. CERRAMOS EL CANDADO
    isFetchingRef.current = true;

    const rondaActual = rondaOverride !== null ? rondaOverride : ronda;
    let nueva = null;

    // Limpieza visual inmediata
    setJugadorActivo(null);
    setFeedback(null);
    setTimer(30);
    setLoadingPregunta(true);

    try {
      // FASE 1: RONDAS 1-5
      if (rondaActual <= 5) {
        setUsaIA(false);
        try {
          console.log("Cargando pregunta para Ronda:", rondaActual);
          const pregunta = await fetchPreguntaFacil();
          nueva = pregunta;
        } catch (error) {
          console.error("Error conectando al servicio (Fase 1):", error);
        }

        // Fallback Local Fase 1
        if (!nueva) {
          const disponibles = baseDeDatosPreguntas.filter(
            (p) => p.nivel === 1 && !idsUsados.includes(p.id),
          );
          if (disponibles.length === 0) {
            const reset = baseDeDatosPreguntas.filter((p) => p.nivel === 1);
            nueva = reset[Math.floor(Math.random() * reset.length)];
          } else {
            nueva = disponibles[Math.floor(Math.random() * disponibles.length)];
          }
        }
        tiempoInicioRef.current = Date.now();
      }
      // FASE 2: RONDAS 6-10 (IA)
      else {
        const sumaTiempos = tiemposRespuesta.reduce((a, b) => a + b, 0);
        const promedioTiempos =
          tiemposRespuesta.length > 0
            ? (sumaTiempos / tiemposRespuesta.length).toFixed(2)
            : 5;

        const mejorAciertos = Math.max(stats.p1.aciertos, stats.p2.aciertos);
        const porcentajeAsertividad = (mejorAciertos / 5) * 100;

        const datosParaEnviar = {
          tiempo_respuesta_seg: parseFloat(promedioTiempos),
          aciertos_pct_ult5: porcentajeAsertividad,
        };
        
        console.log("📡 [Ronda " + rondaActual + "] ENVIANDO A LA IA:", datosParaEnviar);
        console.log("Cargando pregunta IA para Ronda:", rondaActual);
        setUsaIA(true);
        
        try {
          const respuestaIA = await fetchPredecir(datosParaEnviar);
          if (respuestaIA) nueva = respuestaIA;
        } catch (e) {
          console.error("Error fetch IA", e);
        }

        // Fallback Local Fase 2
        if (!nueva) {
          const disponibles = baseDeDatosPreguntas.filter(
            (p) => p.nivel === 2 && !idsUsados.includes(p.id),
          );
          if (disponibles.length === 0) {
            const reset = baseDeDatosPreguntas.filter((p) => p.nivel === 2);
            nueva = reset[Math.floor(Math.random() * reset.length)];
          } else {
            nueva = disponibles[Math.floor(Math.random() * disponibles.length)];
          }
        }
      }
    } catch (err) {
      console.error("Error fatal cargando pregunta:", err);
    }

    // --- PROCESAR RESULTADO ---
    if (nueva) {
      setPreguntaActual(nueva);
      const idReal = nueva.ID || nueva.id;
      setIdsUsados((prev) => [...prev, idReal]);
      setLoadingPregunta(false);

      // Reiniciar Timer Principal
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimer((t) => {
          if (t <= 1) {
            manejarTiempoAgotado();
            return 0;
          }
          return t - 1;
        });
      }, 1000);

      // 🔓 ABRIMOS EL CANDADO (Éxito)
      isFetchingRef.current = false;
    } else {
      setFase("Game_Over");
      setLoadingPregunta(false);
      // 🔓 ABRIMOS EL CANDADO (Fin)
      isFetchingRef.current = false;
    }
  };

  const iniciarJuego = (datosJugadores) => {
    setInfoJugadores(datosJugadores);
    try {
      setUltimaSeleccionIds({
        p1Id: datosJugadores.p1.id_usuario.toString(),
        p2Id: datosJugadores.p2.id_usuario.toString(),
      });
    } catch {
      setUltimaSeleccionIds(null);
    }
    setFase("Trivia");
    cargarPregunta();
  };

  const obtenerNombreNivel = (nivelNum) => {
    if (nivelNum === 1) return "🌱 FÁCIL";
    if (nivelNum === 2) return "😐 MEDIO";
    if (nivelNum === 3) return "🔥 DIFÍCIL";
    if (nivelNum >= 4) return "⚡ EXTREMO";
    return "NIVEL " + nivelNum;
  };

  // --- TIMER PRINCIPAL 30s ---
  const manejarTiempoAgotado = () => {
    // Limpiar TODOS los timers
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (shortTimerRef.current) { clearInterval(shortTimerRef.current); shortTimerRef.current = null; }
    
    setShortTimer(null);
    setJugadorActivo(null);
    setFeedback("Tiempo agotado");
    setLoadingPregunta(true);

    setTimeout(() => {
      setFeedback(null);
      avanzarSiguientePaso();
    }, 1500);
  };

  // --- TIMER CORTO 3s (TURNO) ---
  const manejarShortTimerAgotado = () => {
    // Limpiar TODOS los timers (incluso el de 30s para evitar conflictos)
    if (shortTimerRef.current) { clearInterval(shortTimerRef.current); shortTimerRef.current = null; }
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    
    setShortTimer(null);
    setFeedback("Tiempo agotado");

    // Esperar y AVANZAR de ronda (Muerte súbita del turno)
    setTimeout(() => {
      setFeedback(null);
      setJugadorActivo(null);
      setLoadingPregunta(true);
      avanzarSiguientePaso(); 
    }, 1500);
  };

  const avanzarSiguientePaso = () => {
    const rondaActualReal = rondaRef.current;

    if (rondaActualReal === 5) {
      setFase("Carrera");
      setProgresoCarro({ p1: 0, p2: 0 });
      setLoadingPregunta(false);
    } else if (rondaActualReal === 10) {
      setFase("Game_Over");
      setLoadingPregunta(false);
    } else {
      const siguiente = rondaActualReal + 1;
      setRonda(siguiente);
      cargarPregunta(siguiente);
    }
  }

  const presionarBotonGrande = (jugador) => {
    if (fase === "Inicio" || loadingPregunta) return;

    if (fase === "Trivia") {
      if (!jugadorActivo && !feedback) {
        tiempoInicioRef.current = Date.now();
        setJugadorActivo(jugador);
        setShortTimer(3);
        if (shortTimerRef.current) clearInterval(shortTimerRef.current);
        
        // Iniciar timer corto
        shortTimerRef.current = setInterval(() => {
          setShortTimer((t) => {
            if (t === null) return t;
            if (t <= 1) {
              manejarShortTimerAgotado(); // Se acaba el turno y avanza ronda
              return 0;
            }
            return t - 1;
          });
        }, 1000);
      }
    } else if (fase === "Carrera") {
      setProgresoCarro((prev) => ({
        ...prev,
        [jugador]: prev[jugador] + 5,
      }));
    }
  };

  const responder = (letraUsuario, textoUsuario) => {
    if (!jugadorActivo || feedback || loadingPregunta) return;

    // Parar timers
    clearInterval(timerRef.current);
    clearInterval(shortTimerRef.current);
    setShortTimer(null);

    const tiempoFinal = Date.now();
    const segundosTomados = (tiempoFinal - tiempoInicioRef.current) / 1000;
    setTiemposRespuesta((prev) => [...prev, segundosTomados]);

    const correctaBack = preguntaActual.Respuesta_Correcta;
    const correctaLocal = preguntaActual.correcta;
    const respuestaReal = correctaBack || correctaLocal;

    const esCorrecto = textoUsuario === respuestaReal;

    setStats((prev) => {
      const jugador = prev[jugadorActivo];
      return {
        ...prev,
        [jugadorActivo]: {
          ...jugador,
          puntos: esCorrecto ? jugador.puntos + 100 : jugador.puntos,
          aciertos: esCorrecto ? jugador.aciertos + 1 : jugador.aciertos,
          total_respondidas: jugador.total_respondidas + 1,
        },
      };
    });

    setFeedback(esCorrecto ? "Correcto" : "Incorrecto");
    setTimeout(() => {
      setFeedback(null);
      setLoadingPregunta(true);
      avanzarSiguientePaso();
    }, 1500);
  };

  useInputHandler({
    onBigButton: presionarBotonGrande,
    onRed: () =>
      responder("A", preguntaActual.Opcion_A || preguntaActual.opcion_a),
    onBlue: () =>
      responder("B", preguntaActual.Opcion_B || preguntaActual.opcion_b),
    onGreen: () =>
      responder("C", preguntaActual.Opcion_C || preguntaActual.opcion_c),
    onYellow: () =>
      responder("D", preguntaActual.Opcion_D || preguntaActual.opcion_d),
  });

  const manejarFinDelJuego = async () => {
    const datosFinales = {
      jugador1: {
        nombre: infoJugadores.p1.nombre,
        puntaje: stats.p1.puntos,
      },
      jugador2: {
        nombre: infoJugadores.p2.nombre,
        puntaje: stats.p2.puntos,
      },
    };
    await guardarPuntajeFinal(datosFinales);
  };

  useEffect(() => {
    if (fase === "Game_Over") {
      manejarFinDelJuego();
    }
  }, [fase]);

  // Tecla R para reiniciar
  useEffect(() => {
    const handleKeyDownGlobal = (e) => {
      if (e.repeat) return;
      if (e.key === 'r' || e.key === 'R') {
        setVolverCargando(true);
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
        if (shortTimerRef.current) { clearInterval(shortTimerRef.current); shortTimerRef.current = null; }

        // 🔓 IMPORTANTE: ABRIR EL CANDADO AL REINICIAR
        isFetchingRef.current = false;

        setPreguntaActual(null);
        setRonda(1);
        setIdsUsados([]);
        setLoadingPregunta(false);
        setJugadorActivo(null);
        setFeedback(null);
        setShortTimer(null);
        setTimer(30);
        setProgresoCarro({ p1: 0, p2: 0 });
        setStats({
          p1: { puntos: 0, aciertos: 0, total_respondidas: 0 },
          p2: { puntos: 0, aciertos: 0, total_respondidas: 0 },
        });

        setFase('Inicio');
      }
    };

    window.addEventListener('keydown', handleKeyDownGlobal);
    return () => window.removeEventListener('keydown', handleKeyDownGlobal);
  }, []);

  if (fase === "Inicio")
    return (
      <VistaInicio
        onIniciar={iniciarJuego}
        preguntas={preguntas}
        setPreguntas={setPreguntas}
        initialP1Id={ultimaSeleccionIds ? ultimaSeleccionIds.p1Id : null}
        initialP2Id={ultimaSeleccionIds ? ultimaSeleccionIds.p2Id : null}
        volverDesdeR={volverCargando}
        onUsuariosCargados={() => setVolverCargando(false)}
      />
    );
  if (fase === "Game_Over")
    return (
      <VistaGameOver
        stats={stats}
        jugadores={infoJugadores}
        onVolverInicio={() => setFase("Inicio")}
      />
    );
  if (fase === "Carrera")
    return <VistaCarrera progreso={progresoCarro} jugadores={infoJugadores} />;

  return (
    <VistaTrivia
      pregunta={preguntaActual}
      timer={timer}
      stats={stats}
      jugadores={infoJugadores}
      jugadorActivo={jugadorActivo}
      feedback={feedback}
      loadingPregunta={loadingPregunta}
      shortTimer={shortTimer}
      ronda={ronda}
      usaIA={usaIA}
      nivelNombre={
        preguntaActual
          ? obtenerNombreNivel(preguntaActual.Nivel || preguntaActual.nivel)
          : ""
      }
    />
  );
}

export default App;