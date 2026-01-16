const DEFAULT_HOST = "172.29.81.205:5001";
const IP = import.meta.env?.VITE_API_HOST ?? DEFAULT_HOST;
const ENDPOINT_PREGUNTA_FACIL = `http://${IP}/preguntafacil`;
const ENDPOINT_PREGUNTA = `http://${IP}/predecir`;
export const fetchPreguntaFacil = async () => {
  try {
    const response = await fetch(ENDPOINT_PREGUNTA_FACIL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lista_ids_cache: [] }),
    });
    const data = await response.json();
    return data.Pregunta || data;
  } catch (error) {
    console.error("Error fetching pregunta facil:", error);
    return null;
  }
};

export const fetchPredecir = async (tiempo, acertividad) => {
  try {
    const response = await fetch(ENDPOINT_PREGUNTA, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tiempo_respuesta_seg: tiempo,
        aciertos_pct_ult5: acertividad,
      }),
    });
    const data = await response.json();
    return data.Pregunta[0] || data;
  } catch (error) {
    console.error("Error fetching pregunta facil:", error);
    return null;
  }
};
