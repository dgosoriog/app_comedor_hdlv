import axios from 'axios';
import React, { useState } from 'react';

function Lector(props) {

    const [input, setInput] = useState({rfid:''});
    const [empleado, setEmpleado] = useState(null);
    const [showButton, setShowButton] = useState(false);
    const [error, setError] = useState(null);
    //const manejarTexto = e => {
    //    setInput(e.target.value)
    //    console.log(e.target.value)
    //}

    //const buscarUsuario = e => {
    //    const options = {
    //        'method': 'GET',
    //        'url': 'http://localhost:3001/empleado',
    //        'params':{'rfid': e.target.value}
    //    }
    //    axios.request(options).then((response) => {
    //        console.log(response.data)
    //
    //    }).catch((error) =>{
    //        console.error(error)
    //    })
    //}
    function handleChange(event){
        const {name, value} = event.target
        setInput(prevInput =>{
            return{
                ...prevInput,
                [name]: value
            }
        })
        console.log('Escribiendo..')
    }
    
    async function handleEnterKey(event){
        //event.preventDefault();
        //if (event.key === 'Enter') { event.preventDefault(); }
        const {name, value} = event.target
        //axios.request(options).then((response) => {
        //    console.log('Respuesta en Frontend')
        //    console.log(response.data)
            //setEmpleado(response.data)
        //}).catch((error) =>{
        //    console.error(error)
        //})
        //const res = axios.get('http://localhost:3001/empleado', {params:{rfid: input.rfid}})
        //                        .catch(function (error) {
        //                        console.log(error.toJSON())})
        if (event.key === "Enter") {
            if (value !== "") {
            try {
                const response = await axios.get('http://localhost:3001/empleado', {params:{rfid: input.rfid}
                });
                console.log('Llego al frontend')
                console.log(response)
                if ('message' in response.data){
                    setError(response.data.message);
                }else{
                    setEmpleado(response.data);
                    setShowButton(true);
                }
                } catch (error) {
                    console.log('Error frontend')
                    if (error.response){
                        console.log(error.response.data)
                        console.log(error.response.status)
                        console.log(error.response.headers)
                        if (error.response.status === 404){
                            setError('Recurso no encontrado!');
                        }else if(error.response.status === 500){
                            setError('Servidor no disponible!');
                        }
                    } else if(error.request){
                        console.log(error.request)
                    } else {
                        console.log(error.message)
                    }
                }
            }else {
                alert("Ingrese el RFID o la cédula del Colaborador");
            }
            setInput("");
        }
    }
    
    const imprimirTicket = () => {
        console.log('Click')
    }
        
    
    return (
        <div className='rfid-contenedor'>
            <label>
                CEDULA/RFID  
                <input type="text"
                    name='rfid' 
                    value={input.rfid}
                    onChange={handleChange}
                    onKeyDown={handleEnterKey}/>
            </label>
            <h4>COLABORADOR:</h4>
            {empleado != null ?
                <div>
                {empleado.map(emp => <p key={emp.id}>{emp.name}</p>)}</div>:
                <div>{ error }</div>}
        </div>
    )
}
export default Lector;