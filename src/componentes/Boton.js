import React from 'react';
import '../styles/Boton.css' 

function Boton({ texto, imprimirTicket }){ //desectructuracion
    return(
        <button
            className='boton-imprimir'
            onClick={imprimirTicket}>
            {texto}
        </button>
    );
}

export default Boton; //solo se puede exportar un elemento
