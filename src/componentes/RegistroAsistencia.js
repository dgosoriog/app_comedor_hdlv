import React, {useState, useEffect} from "react";
import axios from 'axios';

function RegistroAsistencia(){

    const [asistencias, setAsistencias] = useState([]);
    const [error, setError] = useState(null);

    useEffect(()=>{
        axios.get('http://localhost:3001/asistencias')
        .then(function(jsonRes) {
            console.log('FRONTEND')
            console.log(jsonRes)
            if ('message' in jsonRes.data){
                setError(jsonRes.data.message);
            }else{
                setAsistencias(jsonRes.data)}
            })
        .catch(function (error) {
            console.log(error.toJSON())
            setError(error.message)
        })
    })

    return (

        <div className="table-responsive">
            <table className="table table-bordered">
                <thead>
                    <tr>
                    <th scope="col">Empleado</th>
                    <th scope="col">Hora 1° Comida</th>
                    <th scope="col">Hora 2° Comida</th>
                    </tr>
                </thead>
                <tbody>
                {error && <tr><td>{ error }</td></tr> }  
                {asistencias && asistencias.map(asistencia => <tr><td>{asistencia.empleado_id[1]}</td>
                <td>{asistencia.fecha_hora_comida_1}</td><td>{asistencia.fecha_hora_comida_2}</td></tr> )}
                </tbody>
            </table>
        </div>)
}

export default RegistroAsistencia;