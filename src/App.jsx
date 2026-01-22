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
  const [usaIA, setUsaIA] = useState(false); // Indica si la pregunta se eligió usando IA

  // --- CONFIGURACIÓN DE JUGADORES ---
  const [infoJugadores, setInfoJugadores] = useState({
    p1: { nombre: "Jugador 1", avatar: "🤖" },
    p2: { nombre: "Jugador 2", avatar: "👽" },
  });

  // --- ESTADÍSTICAS Y PUNTAJES ---
  const [stats, setStats] = useState({
    p1: { puntos: 0, aciertos: 0, total_respondidas: 0 },
    p2: { puntos: 0, aciertos: 0, total_respondidas: 0 },
  });

  const [jugadorActivo, setJugadorActivo] = useState(null);

  // --- ESTADOS DE CONTROL VISUAL Y TIEMPO ---
  const [timer, setTimer] = useState(30);
  const [feedback, setFeedback] = useState(null);
  const [shortTimer, setShortTimer] = useState(null); // Cronómetro de 3s para turno activo

  // Estado del Minijuego de Carrera
  const [progresoCarro, setProgresoCarro] = useState({ p1: 0, p2: 0 });

  const rondaRef = useRef(ronda);
// SINCRONIZAR LA REFERENCIA
  useEffect(() => {
    rondaRef.current = ronda;
  }, [ronda]);


  // Referencias para métricas y control de intervalos
  const [tiemposRespuesta, setTiemposRespuesta] = useState([]);
  const tiempoInicioRef = useRef(Date.now());
  const timerRef = useRef(null);
  const shortTimerRef = useRef(null);


  // --- INICIALIZACIÓN DEL JUEGO ---
  const iniciarJuego = (datosJugadores) => {
    setInfoJugadores(datosJugadores);
    setFase("Trivia");
    cargarPregunta();
  };

  // Determina el nombre legible del nivel basado en su número
  const obtenerNombreNivel = (nivelNum) => {
    if (nivelNum === 1) return "🌱 FÁCIL";
    if (nivelNum === 2) return "😐 MEDIO";
    if (nivelNum === 3) return "🔥 DIFÍCIL";
    if (nivelNum >= 4) return "⚡ EXTREMO";
    return "NIVEL " + nivelNum;
  };

  // --- EFECTO: VIGILANTE DE LA CARRERA ---
  // Monitorea el progreso de los carros y determina si hay un ganador.
  // Se encarga de asignar los puntos y realizar la transición a la siguiente fase.
  useEffect(() => {
    if (fase === "Carrera") {
      // Se verifica si algún jugador alcanzó la meta (95% o más)
      let ganador = null;
      if (progresoCarro.p1 >= 95) ganador = "p1";
      else if (progresoCarro.p2 >= 95) ganador = "p2";

      if (ganador) {
        // 1. Se anuncia el ganador y se actualizan los puntajes (+200 pts)
        alert(`¡GANÓ ${infoJugadores[ganador].nombre}! +200 PTS`);
        setStats((s) => ({
          ...s,
          [ganador]: { ...s[ganador], puntos: s[ganador].puntos + 200 },
        }));

        // 2. Se reinicia el estado de la carrera y se avanza de fase
        setFase("Trivia");
        setRonda(6);
        setProgresoCarro({ p1: 0, p2: 0 });

        // 3. Se fuerza la carga de preguntas para la Ronda 6
        cargarPregunta(6);
      }
    }
  }, [progresoCarro, fase, infoJugadores]);

  // --- LÓGICA DE CARGA Y SELECCIÓN DE PREGUNTAS ---
  // Gestiona la obtención de preguntas desde el servicio o el fallback local.
  // Permite un override de ronda para transiciones forzadas (ej. post-carrera).
  const cargarPregunta = async (rondaOverride = null) => {
    // Se determina la ronda actual, priorizando el override si existe
    const rondaActual = rondaOverride !== null ? rondaOverride : ronda;

    let nueva;
    setJugadorActivo(null);
    setFeedback(null);
    setTimer(30);
    setLoadingPregunta(true);

    // ============================================================
    // FASE 1: RONDAS 1-5 (Preguntas de Nivel Básico)
    // ============================================================
    if (rondaActual <= 5) {
      // En rondas básicas no usamos IA
      setUsaIA(false);
      try {
        console.log("Cargando pregunta para Ronda:", rondaActual);
        const pregunta = await fetchPreguntaFacil();
        nueva = pregunta;
      } catch (error) {
        console.error("Error conectando al servicio (Fase 1):", error);
      }

      // Fallback: Selección local si falla el servicio
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
    // ============================================================
    // FASE 2: RONDAS 6-10 (Lógica Adaptativa / IA)
    // ============================================================
    else {
      // 1. Se calculan las métricas de desempeño del usuario
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
        ID_seleccionados: idsUsados,
      };
      console.log("Cargando pregunta para Ronda:", rondaActual);
      console.log("Enviando métricas a IA:", datosParaEnviar);

      // 2. Se solicita la predicción al servicio
      setUsaIA(true);
      const respuestaIA = await fetchPredecir(datosParaEnviar);
      if (respuestaIA) nueva = respuestaIA;

      // 3. Fallback: Selección local si no hay respuesta de IA
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
    // --- ASIGNACIÓN Y GESTIÓN DE ESTADO DE PREGUNTA ---
    if (nueva) {
      setPreguntaActual(nueva);
      const idReal = nueva.ID || nueva.id;
      setIdsUsados((prev) => [...prev, idReal]);

      setLoadingPregunta(false);

      // Reinicio del temporizador principal
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
    } else {
      setFase("Game_Over");
      setLoadingPregunta(false);
    }
  };

  // Maneja el evento cuando el tiempo de respuesta global se agota
  const manejarTiempoAgotado = () => {
    clearInterval(timerRef.current);
    setFeedback("Tiempo");
    setTimeout(() => {
      setFeedback(null);
      setLoadingPregunta(true);
      avanzarSiguientePaso();
    }, 1500);
  };

  // Maneja el evento cuando el tiempo de turno (3s) se agota
  const manejarShortTimerAgotado = () => {
    setJugadorActivo(null);
    setShortTimer(null);
    clearInterval(shortTimerRef.current);
    clearInterval(timerRef.current);
    setFeedback("Tiempo");
    setTimeout(() => {
      setFeedback(null);
      setLoadingPregunta(true);
      avanzarSiguientePaso();
    }, 1500);
  };

  // Determina el flujo del juego (Siguiente Ronda, Carrera o Fin del Juego)
  const avanzarSiguientePaso = () => {
    //Se usa la referencia para obtener el valor real de la ronda 
    const rondaActualReal = rondaRef.current;

    // Caso especial: Fin de la Fase 1
    if (rondaActualReal === 5) {
      setFase("Carrera");
      setProgresoCarro({ p1: 0, p2: 0 });
      setLoadingPregunta(false);
    // Caso especial: Fin del Juego
    } else if (rondaActualReal === 10) {
      setFase("Game_Over");
      setLoadingPregunta(false);
    } else {
      const siguiente = rondaActualReal + 1;
      setRonda(siguiente);
      cargarPregunta(siguiente);
    }
  };

  // --- CONTROLADOR DE EVENTOS: BOTÓN GRANDE ---
  // Gestiona la activación del turno en Trivia o el movimiento en Carrera.
  const presionarBotonGrande = (jugador) => {
    if (fase === "Inicio" || loadingPregunta) return;

    if (fase === "Trivia") {
      // Activa el turno del jugador si no hay uno activo
      if (!jugadorActivo && !feedback) {
        tiempoInicioRef.current = Date.now();
        setJugadorActivo(jugador);
        setShortTimer(3);
        if (shortTimerRef.current) clearInterval(shortTimerRef.current);
        shortTimerRef.current = setInterval(() => {
          setShortTimer((t) => {
            if (t === null) return t;
            if (t <= 1) {
              manejarShortTimerAgotado();
              return 0;
            }
            return t - 1;
          });
        }, 1000);
      }
    } else if (fase === "Carrera") {
      // Actualiza el progreso del carro. La validación de victoria se maneja en el useEffect.
      setProgresoCarro((prev) => ({
        ...prev,
        [jugador]: prev[jugador] + 5,
      }));
    }
  };

  // --- CONTROLADOR DE RESPUESTAS ---
  // Valida la respuesta seleccionada, actualiza estadísticas y gestiona el feedback.
  const responder = (letraUsuario, textoUsuario) => {
    if (!jugadorActivo || feedback || loadingPregunta) return;

    // Se detienen los temporizadores
    clearInterval(timerRef.current);
    clearInterval(shortTimerRef.current);
    setShortTimer(null);

    // Registro de métricas de tiempo
    const tiempoFinal = Date.now();
    const segundosTomados = (tiempoFinal - tiempoInicioRef.current) / 1000;
    setTiemposRespuesta((prev) => [...prev, segundosTomados]);

    // Verificación de respuesta (Compatibilidad Backend/Local)
    const correctaBack = preguntaActual.Respuesta_Correcta;
    const correctaLocal = preguntaActual.correcta;
    const respuestaReal = correctaBack || correctaLocal;

    const esCorrecto = textoUsuario === respuestaReal;

    // Actualización de estadísticas del jugador activo
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

    // Muestra feedback visual y avanza
    setFeedback(esCorrecto ? "Correcto" : "Incorrecto");
    setTimeout(() => {
      setFeedback(null);
      setLoadingPregunta(true);
      avanzarSiguientePaso();
    }, 1500);
  };

  // --- MAPEO DE CONTROLES FÍSICOS (HOOK) ---
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

  // --- 4. GUARDAR PUNTAJES ---
  const manejarFinDelJuego = async () => {
    // Preparamos el JSON
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

    // Usamos el servicio (mucho más limpio)
    await guardarPuntajeFinal(datosFinales);
  };

  // Efecto que detecta el Game Over
  useEffect(() => {
    if (fase === "Game_Over") {
      manejarFinDelJuego();
    }
  }, [fase]);

  // --- RENDERIZADO CONDICIONAL DE VISTAS ---
  if (fase === "Inicio")
    return (
      <VistaInicio
        onIniciar={iniciarJuego}
        preguntas={preguntas}
        setPreguntas={setPreguntas}
      />
    );
  if (fase === "Game_Over")
    return <VistaGameOver stats={stats} jugadores={infoJugadores} />;
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
