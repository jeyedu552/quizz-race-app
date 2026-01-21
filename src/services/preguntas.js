const DEFAULT_HOST = "172.29.81.0:5000";
const IP = import.meta.env?.VITE_API_HOST ?? DEFAULT_HOST;
const ENDPOINT_PREGUNTA_FACIL = `http://${IP}/preguntafacil`;
const ENDPOINT_PREGUNTA = `http://${IP}/predecir`;
const ENDPOINT_FACILES = `http://${IP}/cargarFaciles`;
const ENDPOINT_USUARIOS = `http://${IP}/usuarios`; //Para listar
const ENDPOINT_CREAR_USUARIO = `http://${IP}/usuariosCrear`; // Para guardar nuevo
const ENDPOINT_GUARDAR_PUNTAJE = `http://${IP}/guardarPuntaje`; // Para guardar el puntaje


//Lógica para traer pregunta fácil
export const fetchPreguntaFacil = async () => {
  try {
    console.log("Fetching pregunta facil from", ENDPOINT_PREGUNTA_FACIL);
    const response = await fetch(ENDPOINT_PREGUNTA_FACIL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lista_ids_cache: [] }),
    });
    const data = await response.json();
    // Soporta data.pregunta[0], data.pregunta o data
    return (data && (data.pregunta?.[0] || data.pregunta || data)) ?? null;
  } catch (error) {
    console.error("Error fetching pregunta facil:", error);
    return null;
  }
};

export const fetchFaciles = async () => {
  try {
    const response = await fetch(ENDPOINT_FACILES, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lista_ids_cache: [] }),
    });
    const data = await response.json();
    // Soporta data.pregunta[0], data.pregunta o data
    return (data && (data.pregunta || data)) ?? null;
  } catch (error) {
    console.error("Error fetching preguntas faciles:", error);
    return null;
  }
};

// Lógica para predecir la pregunta
export const fetchPredecir = async (tiempoOrPayload, acertividad) => {
  try {
    const payload =
      typeof tiempoOrPayload === "object"
        ? tiempoOrPayload
        : {
            tiempo_respuesta_seg: tiempoOrPayload,
            aciertos_pct_ult5: acertividad,
          };

    const response = await fetch(ENDPOINT_PREGUNTA, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    // Soporta data.Pregunta[0], data.Pregunta o data
    return (data && (data.Pregunta?.[0] || data.Pregunta || data)) ?? null;
  } catch (error) {
    console.error("Error fetching predecir:", error);
    return null;
  }
};

// 2. FETCH USUARIOS (MODO HÍBRIDO)
export const fetchUsuarios = async () => {
  try {
    const response = await fetch(ENDPOINT_USUARIOS);
    const data = await response.json();
    console.log("Usuarios cargados desde service:", data);
    return data.usuarios;
  } catch (error) {
    console.error("Error cargando usuarios:", error);
    return [];
  }
};

// 3. CREAR USUARIO 
export const crearUsuario = async (nickname, avatarCode) => {
  try {
    const response = await fetch(ENDPOINT_CREAR_USUARIO, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nickname: nickname,
        avatar_code: avatarCode,
      }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log("Error creando usuario:", error);
    return null;
  }
};

// --- 5. GUARDAR PUNTAJE FINAL 
export const guardarPuntajeFinal = async (datosFinales) => {
  try {
    console.log("Enviando puntajes a:", ENDPOINT_GUARDAR_PUNTAJE);
    const response = await fetch(ENDPOINT_GUARDAR_PUNTAJE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosFinales)
    });

    if (response.ok) {
        console.log("Puntajes guardados correctamente");
        return true;
    } else {
        console.error("Error del servidor al guardar puntajes");
        return false;
    }
  } catch (error) {
    console.error("Error de conexión guardando puntajes:", error);
    return false;
  }
};