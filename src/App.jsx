import { useState, useEffect, useRef } from "react";
import "./App.css";
import { baseDeDatosPreguntas } from "./datos";
import { useInputHandler } from "./useInputHandler";

// --- IMPORTAMOS LOS COMPONENTES ---
import VistaInicio from "./components/VistaInicio";
import VistaTrivia from "./components/VistaTrivia";
import VistaCarrera from "./components/VistaCarrera";
import VistaGameOver from "./components/VistaGameOver";
import { fetchPreguntaFacil, fetchPredecir } from "../src/services/preguntas";

function App() {
  // --- ESTADOS GENERALES ---
  const [fase, setFase] = useState("Inicio");
  const [preguntaActual, setPreguntaActual] = useState(null);
  const [ronda, setRonda] = useState(1);
  const [idsUsados, setIdsUsados] = useState([]);
  const [preguntas, setPreguntas] = useState([]);

  // --- CONFIGURACIÓN JUGADORES ---
  const [infoJugadores, setInfoJugadores] = useState({
    p1: { nombre: "Jugador 1", avatar: "🤖" },
    p2: { nombre: "Jugador 2", avatar: "👽" },
  });

  // --- ESTADÍSTICAS ---
  const [stats, setStats] = useState({
    p1: { puntos: 0, aciertos: 0, total_respondidas: 0 },
    p2: { puntos: 0, aciertos: 0, total_respondidas: 0 },
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

  // --- 1. LÓGICA DE CARGA DE PREGUNTAS  ---
  const cargarPregunta = async () => {
    let nueva;
    setJugadorActivo(null);
    setFeedback(null);
    setTimer(30);

    // ============================================================
    // FASE 1: RONDAS 1-5 (Pregunta Fácil desde Backend)
    // ============================================================
    if (ronda <= 5) {
      try {
        console.log("Ronda: ", ronda);
        console.log("Preguntas actuales: ", preguntas);

        // Usamos el servicio que ya funciona
        const pregunta = await fetchPreguntaFacil();
        nueva = pregunta; // el servicio ya retorna la pregunta directamente

        /*console.log("Respuesta todo: ", pregunta);
        console.log("Respuesta json: ", pregunta.pregunta);
        console.log("Respuesta llaves: ", pregunta.pregunta[0]);*/
        console.log("Pregunta Fase 1:", nueva);
      } catch (error) {
        console.error("Error conectando al Backend (Fase 1):", error);
      }

      // Fallback Local (Respaldo)
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
    // FASE 2: RONDAS 6-10 (Cálculo de Métricas + Simulacro)
    // ============================================================
    else {
      // ---------------------------------------------------------
      // 1. PREPARACIÓN DE DATOS
      // ---------------------------------------------------------

      // A. Tiempo Promedio
      const sumaTiempos = tiemposRespuesta.reduce((a, b) => a + b, 0);
      const promedioTiempos =
        tiemposRespuesta.length > 0
          ? (sumaTiempos / tiemposRespuesta.length).toFixed(2)
          : 5;

      // B. Asertividad (0 - 100%)
      // Usamos 'aciertos' en lugar de 'puntos' para evitar que la carrera (+500pts) rompa el cálculo.
      // Como venimos de la Ronda 5, el máximo de aciertos posibles es 5.
      const mejorAciertos = Math.max(stats.p1.aciertos, stats.p2.aciertos);
      const porcentajeAsertividad = (mejorAciertos / 5) * 100;

      // Armamos el JSON limpio
      const datosParaEnviar = {
        tiempo_respuesta_seg: parseFloat(promedioTiempos),
        aciertos_pct_ult5: porcentajeAsertividad, // Ahora sí será 0, 20, 40, 60, 80 o 100
        ID_seleccionados: idsUsados,
      };

      // VERIFICACIÓN
      console.log("------------------------------------------------");
      console.log("🚀 [FASE 2] DATOS LISTOS PARA LA IA:");
      console.log(datosParaEnviar);
      console.log("------------------------------------------------");

      console.log(datosParaEnviar.tiempo_respuesta_seg);
      console.log(datosParaEnviar.aciertos_pct_ult5);
      const respuestaIA = await fetchPredecir(
        datosParaEnviar.tiempo_respuesta_seg,
        datosParaEnviar.aciertos_pct_ult5,
      );
      console.log("IA pregunta: ", respuestaIA);
      if (respuestaIA) nueva = respuestaIA;

      // ---------------------------------------------------------
      // 2. LÓGICA PROVISIONAL (Para que sigas jugando)
      // ---------------------------------------------------------
      if (!nueva) {
        // Seleccionamos localmente una pregunta de Nivel 2 mientras no haya IA
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

    // --- ASIGNACIÓN DE LA PREGUNTA ---
    if (nueva) {
      setPreguntaActual(nueva);

      // Normalizamos el ID (El back usa 'ID', local usa 'id')
      const idReal = nueva.ID || nueva.id;
      setIdsUsados((prev) => [...prev, idReal]);

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
    }
  };

  const manejarTiempoAgotado = () => {
    clearInterval(timerRef.current);
    setFeedback("Tiempo");
    setTimeout(avanzarSiguientePaso, 2500);
  };

  const avanzarSiguientePaso = () => {
    if (ronda === 5) {
      setFase("Carrera");
      setProgresoCarro({ p1: 0, p2: 0 });
    } else if (ronda === 10) {
      setFase("Game_Over");
    } else {
      setRonda((r) => r + 1);
      cargarPregunta();
    }
  };

  // --- 2. LÓGICA DE RESPUESTAS ---
  const presionarBotonGrande = (jugador) => {
    if (fase === "Inicio") return;

    if (fase === "Trivia") {
      if (!jugadorActivo && !feedback) {
        tiempoInicioRef.current = Date.now();
        setJugadorActivo(jugador);
      }
    } else if (fase === "Carrera") {
      setProgresoCarro((prev) => {
        const nuevoValor = prev[jugador] + 5;
        if (nuevoValor >= 95) {
          alert(`¡GANÓ ${infoJugadores[jugador].nombre}! +500 PTS`);
          setStats((s) => ({
            ...s,
            [jugador]: { ...s[jugador], puntos: s[jugador].puntos + 500 },
          }));
          setFase("Trivia");
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
    setTiemposRespuesta((prev) => [...prev, segundosTomados]);

    // Comparación (Soporta estructura de Backend con mayúscula y Local con minúscula)
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
    setTimeout(avanzarSiguientePaso, 2500);
  };

  // --- 3. INPUT HANDLER ---
  useInputHandler({
    onBigButton: presionarBotonGrande,
    // Soporte híbrido para mayúsculas (Backend) y minúsculas (Local)
    onRed: () =>
      responder("A", preguntaActual.Opcion_A || preguntaActual.opcion_a),
    onBlue: () =>
      responder("B", preguntaActual.Opcion_B || preguntaActual.opcion_b),
    onGreen: () =>
      responder("C", preguntaActual.Opcion_C || preguntaActual.opcion_c),
    onYellow: () =>
      responder("D", preguntaActual.Opcion_D || preguntaActual.opcion_d),
  });

  // --- 4. RENDERIZADO ---
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
      // Soporte híbrido para Nivel
      nivelNombre={
        preguntaActual
          ? obtenerNombreNivel(preguntaActual.Nivel || preguntaActual.nivel)
          : ""
      }
    />
  );
}

export default App;
