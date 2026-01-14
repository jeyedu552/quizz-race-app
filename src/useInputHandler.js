import { useEffect } from 'react';

export const useInputHandler = ({ onBigButton, onRed, onBlue, onGreen, onYellow }) => {
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Evita que se repita el evento si dejas la tecla presionada
      if (e.repeat) return;

      switch (e.key) {
        // --- BOTONES GRANDES (BUZZ IN / ACELERAR) ---
        case ' ': // ESPACIO (Jugador 1)
          if (onBigButton) onBigButton('p1');
          break;
        case 'Enter': // ENTER (Jugador 2)
          if (onBigButton) onBigButton('p2');
          break;

        // --- OPCIONES DE RESPUESTA (1, 2, 3, 4) ---
        case '1':
          if (onRed) onRed();       // 1 -> Rojo (A)
          break;
        case '2':
          if (onBlue) onBlue();     // 2 -> Azul (B)
          break;
        case '3':
          if (onGreen) onGreen();   // 3 -> Verde (C)   
          break;
        case '4':
          if (onYellow) onYellow(); // 4 -> Amarillo (D)
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Limpieza al desmontar (importante para que no se dupliquen las acciones)
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onBigButton, onRed, onBlue, onGreen, onYellow]);
};