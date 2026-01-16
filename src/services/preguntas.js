const DEFAULT_HOST = "172.29.81.205:5001";
const IP = import.meta.env?.VITE_API_HOST ?? DEFAULT_HOST;
const ENDPOINT_PREGUNTA_FACIL = `http://${IP}/preguntafacil`;

export const fetchPreguntaFacil = async () => {
  try {
    const response = await fetch(ENDPOINT_PREGUNTA_FACIL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lista_ids_cache: [] }),
    });
    const data = await response.json();
    return data.pregunta || data;
  } catch (error) {
    console.error("Error fetching pregunta facil:", error);
    return null;
  }
};
