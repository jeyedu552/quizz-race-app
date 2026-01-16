export const fetchPreguntaFacil = async () => {
  try {
    const response = await fetch("http://127.0.0.1:5000/preguntafacil", {
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
