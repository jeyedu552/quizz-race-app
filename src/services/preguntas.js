const DEFAULT_HOST = "172.29.81.0:5000";
const IP = import.meta.env?.VITE_API_HOST ?? DEFAULT_HOST;
const ENDPOINT_PREGUNTA_FACIL = `http://${IP}/preguntafacil`;
const ENDPOINT_PREGUNTA = `http://${IP}/predecir`;
const ENDPOINT_FACILES = `http://${IP}/cargarFaciles`;
const ENDPOINT_USUARIOS = `http://${IP}/usuarios`; //Para listar
const ENDPOINT_CREAR_USUARIO = `http://${IP}/usuariosCrear`; // Para guardar nuevo

// --- DATOS QUEMADOS (SIMULACIÓN) ---
const USUARIOS_MOCK = [
  {
    id_usuario: 1,
    nickname: "Súper Pepe",
    avatar_code: "batman",
    puntos_totales: 1500,
  },
  {
    id_usuario: 2,
    nickname: "Ana Rayo",
    avatar_code: "wonderwoman",
    puntos_totales: 2300,
  },
  {
    id_usuario: 3,
    nickname: "Capitán X",
    avatar_code: "capitanAmerica",
    puntos_totales: 500,
  },
  {
    id_usuario: 4,
    nickname: "Princesa",
    avatar_code: "rapunzel",
    puntos_totales: 3200,
  },
  {
    id_usuario: 5,
    nickname: "Spidey",
    avatar_code: "spiderman",
    puntos_totales: 1200,
  },
];

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
  // --- MODO SIMULACIÓN (ACTIVO) ---
  /*  console.log("⚠️ [MOCK] Cargando lista de usuarios simulada...");
  return new Promise((resolve) => {
    // Simulamos que tarda 0.5 segundos en llegar del servidor
    setTimeout(() => {
      resolve(USUARIOS_MOCK);
    }, 500);
  });*/

  // --- MODO REAL (COMENTADO - DESCOMENTAR CUANDO ESTÉ EL BACKEND) ---

  try {
    const response = await fetch(ENDPOINT_USUARIOS);
    const data = await response.json();
    console.log("Usuarios cargados desde service:", data);
    return data.usuarios;
    console.log;
  } catch (error) {
    console.error("Error cargando usuarios:", error);
    return [];
  }
};

// 3. CREAR USUARIO (MODO HÍBRIDO)
export const crearUsuario = async (nickname, avatarCode) => {
  /*// --- MODO SIMULACIÓN (ACTIVO) ---
  console.log(`⚠️ [MOCK] Creando usuario: ${nickname}`);
  return new Promise((resolve) => {
    setTimeout(() => {
      // Creamos un objeto falso
      const nuevoUsuario = {
        id_usuario: Date.now(), // Usamos la hora como ID único temporal
        nickname: nickname,
        avatar_code: avatarCode,
        puntos_totales: 0,
      };
      // Lo guardamos en la lista temporal para que aparezca al recargar (mientras no cierres la pestaña)
      USUARIOS_MOCK.push(nuevoUsuario);
      resolve(nuevoUsuario);
    }, 500);
  });*/

  // --- MODO REAL (COMENTADO - DESCOMENTAR CUANDO ESTÉ EL BACKEND) ---

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
