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
      <div
        className="modal-caja"
        style={{
          width: "90%",
          maxWidth: 600,
          maxHeight: "85vh",
          overflowY: "auto",
          textAlign: "left",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "clamp(1.2rem, 4vw, 1.8rem)" }}>
            🏆 Historial de Puntos
          </h2>

          <button
            onClick={onClose}
            aria-label="Cerrar leaderboard"
            style={{
              background: "linear-gradient(90deg,#ff7a18,#ffb456)",
              color: "#fff",
              border: "none",
              padding: "8px 14px",
              borderRadius: 12,
              cursor: "pointer",
              fontWeight: 700,
              boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              transition: "transform .12s ease, box-shadow .12s ease",
              fontSize: "0.95rem",
            }}
            onMouseEnter={(e) => {
              const t = e.currentTarget;
              t.style.transform = "translateY(-2px)";
              t.style.boxShadow = "0 10px 22px rgba(0,0,0,0.18)";
            }}
            onMouseLeave={(e) => {
              const t = e.currentTarget;
              t.style.transform = "translateY(0)";
              t.style.boxShadow = "0 6px 18px rgba(0,0,0,0.12)";
            }}
            onMouseDown={(e) =>
              (e.currentTarget.style.transform = "scale(0.98)")
            }
            onMouseUp={(e) =>
              (e.currentTarget.style.transform = "translateY(-2px)")
            }
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 16, lineHeight: 1 }}
            >
              close
            </span>
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
                padding: "clamp(8px, 2vw, 14px) clamp(10px, 3vw, 16px)",
                borderRadius: 16,
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
                gap: 10,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "clamp(20px, 5vw, 24px)", flexShrink: 0 }}
                >
                  emoji_events
                </span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: "clamp(0.9rem, 3vw, 1.1rem)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {u.nickname}
                  </div>
                  <div
                    style={{
                      opacity: 0.65,
                      fontSize: "clamp(0.7rem, 2.5vw, 0.85rem)",
                    }}
                  >
                    Posición #{idx + 1}
                  </div>
                </div>
              </div>
              <div
                style={{
                  fontWeight: 900,
                  fontSize: "clamp(0.95rem, 3.5vw, 1.2rem)",
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}
              >
                {u.puntos_totales ?? 0} pts
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 10,
            opacity: 0.6,
            fontSize: "clamp(0.7rem, 2.5vw, 0.85rem)",
            textAlign: "center",
            padding: "0 10px",
          }}
        >
          Los mejores pilotos primero. ¡Sigue practicando para subir en el
          podio!
        </div>
      </div>
    </div>
  );
};

export default ModelLeaderboard;
