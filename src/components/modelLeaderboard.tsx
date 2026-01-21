import React from "react";

type Usuario = {
  id_usuario: number | string;
  nickname: string;
  puntos_totales: number;
};

type Props = {
  usuarios: Usuario[];
  onClose: () => void;
};

// Modal de Leaderboard
const ModelLeaderboard: React.FC<Props> = ({ usuarios, onClose }) => {
  // Fallback ejemplo solicitado en el requerimiento
  const ejemplo = { nickname: "Juanito", puntos_totales: 1200 };

  const datos =
    usuarios && usuarios.length > 0
      ? [...usuarios].sort(
          (a, b) => (b.puntos_totales ?? 0) - (a.puntos_totales ?? 0),
        )
      : [ejemplo];

  return (
    <div className="modal-fondo" style={{ zIndex: 1000 }}>
      <div className="modal-caja" style={{ maxWidth: 520 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h2 style={{ margin: 0 }}>🏆 Leaderboard</h2>
          <button className="btn-cancelar" onClick={onClose}>
            Cerrar
          </button>
        </div>

        <div style={{ marginTop: 16 }}>
          {datos.map((u, idx) => (
            <div
              key={(u as any).id_usuario ?? `${u.nickname}-${idx}`}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                borderRadius: 12,
                background:
                  idx === 0
                    ? "linear-gradient(90deg, #ffd54f, #ffe082)"
                    : idx === 1
                      ? "linear-gradient(90deg, #cfd8dc, #eceff1)"
                      : idx === 2
                        ? "linear-gradient(90deg, #bcaaa4, #d7ccc8)"
                        : "#ffffff",
                boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
                marginBottom: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 24 }}
                >
                  emoji_events
                </span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 18 }}>
                    {u.nickname}
                  </div>
                  <div style={{ opacity: 0.7, fontSize: 12 }}>
                    Posición #{idx + 1}
                  </div>
                </div>
              </div>
              <div style={{ fontWeight: 800, fontSize: 20 }}>
                {u.puntos_totales ?? 0} pts
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ModelLeaderboard;
