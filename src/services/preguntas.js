const DEFAULT_HOST = "172.29.82.65:5000";
const IP = import.meta.env?.VITE_API_HOST ?? DEFAULT_HOST;
const ENDPOINT_PREGUNTA_FACIL = `http://${IP}/preguntafacil`;
const ENDPOINT_PREGUNTA = `http://${IP}/predecir`;
const ENDPOINT_FACILES = `http://${IP}/cargarFaciles`;
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
