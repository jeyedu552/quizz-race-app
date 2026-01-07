import { useEffect } from "react";

export const useInputHandler = (acciones) => {
    useEffect (() => {
        const handleTeclado = (event) => {
            //Mapeo de teclas simulando el hardware

            //Botón Grande (Acelerar y Responder primero) -> Barra espaciadora 
            if (event.code === 'Space') {
                acciones.onBigButton && acciones.onBigButton();
            }

            //Botones de colores que representan las opciones 
            //Número 1 = Rojo (Opción A)
            if (event.key === '1') acciones.onRed && acciones.onRed();

            //Número 2 = Verde (Opción B)
            if (event.key === '2') acciones.onGreen && acciones.onGreen();

            //Número 3 = Amarillo (Opción C)
            if (event.key === '3') acciones.onYellow && acciones.onYellow();

            //Número 4 = Azul (Opción D)
            if (event.key === '4') acciones.onBlue && acciones.onBlue();

        };
            window.addEventListener('keydown', handleTeclado);

            //Limpieza al desmontar el componente
            return () => {
                window.removeEventListener('keydown', handleTeclado);
            };
        }, [acciones]);
    };