import { useState, useEffect, useRef } from 'react'
import './App.css'
import { baseDeDatosPreguntas } from './datos'
import { useInputHandler } from './useInputHandler'

function App() {
  //Estados del Juego 
  const [fase, setFase] = useState('Trivia'); //'Trivia' | 'Carrera' | 'Game_Over'
  const [preguntaActual, setPreguntaActual] = useState(null);
  const [ronda, setRonda] = useState(1);
  const [puntos, setPuntos] = useState(0);
  const [idsUsados, setIdsUsados] = useState([]);
  // Guarda la lista de tiempos: [2.5, 4.1, 1.2, ...]
  const [tiemposRespuesta, setTiemposRespuesta] = useState([]);
  // Marca el momento exacto (milisegundos) en que apareció la pregunta
  const tiempoInicioRef = useRef(Date.now());

  //Estados de la Pregunta 
  const [timer, setTimer] = useState(30);
  const [botonHabilitado, setBotonHabilitado] = useState(false); //¿Se presionó el botón grande?
  const [feedback, setFeedback] = useState(null); // 'Correcto', 'Incorrecto', 'Tiempo'

  //Estados de la carrera para el minijuego 
  const [progresoCarro, setProgresoCarro] = useState(0);

  //Referencia para limpiar el intervalo del timer
  const timerRef = useRef(null);

  //1. Cargar Preguntas 
  const cargarPregunta = () => {
    let nueva;
    //Se sigue el diagrama de actividades 
    if (ronda <= 5) {
      // Fase 1: Preguntas Fáciles. Se filtran las preguntas de Nivel 1 y que no estén en la lista de usados
      const disponibles = baseDeDatosPreguntas.filter(p => p.nivel === 1 && !idsUsados.includes(p.id));
      //Se elige de ese filtrado una pregunta al azar 
      nueva = disponibles[Math.floor(Math.random() * disponibles.length)];
    } else {
      // Fase 2: Preguntas Difíciles 
      // ============================================================
      //  CÓDIGO PARA EL BACKEND (DESCOMENTAR CUANDO TENGAS SERVIDOR)
      // ============================================================
      /* try {
          // Calculamos el promedio real de tus tiempos guardados
          const sumaTiempos = tiemposRespuesta.reduce((a, b) => a + b, 0);
          const promedioTiempos = tiemposRespuesta.length > 0 ? (sumaTiempos / tiemposRespuesta.length) : 3.5;

          const datosParaEnviar = {
              tiempo_respuesta_seg: promedioTiempos, 
              aciertos_pct_ult5: (puntos / 5) * 100,
              ID_seleccionados: idsUsados // A veces el backend pide esto también
          };

          console.log("Enviando al backend:", datosParaEnviar);

          const respuesta = await fetch('http://127.0.0.1:5000/predecir', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(datosParaEnviar)
          });

          const data = await respuesta.json();
          const nivelRecomendado = data.Prediccion; // Ej: 4

          // Buscamos pregunta de ese nivel
          const disponibles = baseDeDatosPreguntas.filter(
              p => p.nivel === nivelRecomendado && !idsUsados.includes(p.id)
          );
          nueva = disponibles[Math.floor(Math.random() * disponibles.length)];
      } catch (error) {
          console.error("Error backend:", error);
      }
      */
      // ============================================================

      // LOGICA LOCAL (RESPALDO MIENTRAS NO HAY BACKEND)
      // Si la variable 'nueva' sigue vacía (porque el bloque de arriba está comentado), usamos esto:
      const disponibles = baseDeDatosPreguntas.filter(p => p.nivel === 2 && !idsUsados.includes(p.id));
      nueva = disponibles[Math.floor(Math.random() * disponibles.length)];
    }

    if (nueva) {
      setPreguntaActual(nueva); //Se presenta la pregunta en pantalla 
      setIdsUsados(prev => [...prev, nueva.id]); // Agrega el id de la pregunta a las que ya salieron para no repetirla
      setTimer(30); //Se pone el reloj en 30s 
      setBotonHabilitado(false); // Bloquear respuestas (botones de colores)
      setFeedback(null);

      //Iniciar cuenta regresiva. Se limpia el reloj anterior.
      if (timerRef.current) clearInterval(timerRef.current);
      // 2. INICIO: Arranca un nuevo reloj que se ejecuta cada 1000 milisegundos (1 segundo)
      timerRef.current = setInterval(() => {
        //Se actualiza el estado del timer 
        setTimer(t => {
          //Si el tiempo llega a 1 o menos
          if (t <= 1) {
            manejarTiempoAgotado(); // Se terminó el tiempo, llama a la función de fin
            return 0; // El reloj se queda en 0
          }
          return t - 1;// Si no, se resta 1 segundo 
        });
      }, 1000);
    } else {
      setFase('Game_Over')
    }
  };

  const manejarTiempoAgotado = () => {
    clearInterval(timerRef.current); //Se detiene el reloj para que no se siga contando en negativo
    setFeedback('Tiempo'); //Cambia el color a la pantalla para dar avso al usuario
    setTimeout(avanzarSiguientePaso, 2000); // Espera 2 segundos para que se muestre "Tiempo Agotado" y se llame a avanzarSiguientePaso 
  };

  // 2. Control del Flujo (Trivia vs Carrera)
  const avanzarSiguientePaso = () => {
    if (ronda === 5) {
      //MINIJUEGO
      setFase('Carrera');
      setProgresoCarro(0); //El carro empieza en la línea de salida 
    } else if (ronda === 10) {
      setFase('Game_Over'); //Cuando ya se terminen la preguntas, se cambia a la pantalla Game Over 
    } else {
      setRonda(r => r + 1); //Se suma 1 al contador de rondas
      cargarPregunta(); //Se llama a cargar pregunta 
    }
  };

  //3. Input Handler 
  const presionarBotonGrande = () => {
    // Solo funciona si el botón NO está habilitado (nadie ha pulsado)
    // Y si NO hay feedback (el juego no está pausado mostrando si ganaste/perdiste)
    if (fase === 'Trivia') {
      if (!botonHabilitado && !feedback) {
        setBotonHabilitado(true); //Se habilita los botoones para responder 
      }
    } else if (fase === 'Carrera') {
      setProgresoCarro(prev => {
        const nuevo = prev + 5; //Se avanza un 5% por click 
        if (nuevo >= 100) {
          // Ganador de la Carrera 
          alert("¡Ganaste la carrera! +500 Puntos Extra");
          setPuntos(p => p + 500);
          setFase('Trivia');
          setRonda(6);
          cargarPregunta();
          return 100;
        }
        return nuevo;
      });
    }
  };

  const responder = (respuestaUsuario) => {
    if (!botonHabilitado || feedback) return;

    clearInterval(timerRef.current); // Detener reloj visual

    // --- CÁLCULO DEL TIEMPO REAL ---
    const tiempoFinal = Date.now();
    // Restamos (Ahora - Inicio) y dividimos por 1000 para tener segundos (ej: 3.45s)
    const segundosTomados = (tiempoFinal - tiempoInicioRef.current) / 1000;

    // Guardamos este tiempo en la lista
    setTiemposRespuesta(prev => [...prev, segundosTomados]);
    // -------------------------------

    if (respuestaUsuario === preguntaActual.correcta) {
      setFeedback('Correcto');
      setPuntos(p => p + 100);
    } else {
      setFeedback('Incorrecto');
    }

    setTimeout(avanzarSiguientePaso, 2000);
  };

  // Se conecta el Hook personalizado 
  useInputHandler({
    onBigButton: presionarBotonGrande,
    onRed: () => responder(preguntaActual?.opcion_a), //Número 1
    onBlue: () => responder(preguntaActual?.opcion_b), //Número 2
    onGreen: () => responder(preguntaActual?.opcion_c), //Número 3
    onYellow: () => responder(preguntaActual?.opcion_d), //Número 4
  });

  // Carga inicial 
  useEffect(() => {
    cargarPregunta();
    return () => clearInterval(timerRef.current);
  }, []);

}