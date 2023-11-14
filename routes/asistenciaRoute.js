const express = require('express')
const router = express.Router();
const Odoo = require("odoo-await");

const odoo = new Odoo({
    baseUrl: "http://localhost:8075",
    port: undefined, // see comments below regarding port option
    db: "odoo12_eventos",
    username: "admin",
    password: "odoo12",
  });

router.route('/asistencias').get(async (req, res) =>{

    try{
        await odoo.connect(); 
        let now = new Date();
        let fecha_desde = false
        let fecha_hasta = false
        const periodo = await odoo.search(`account.period`,
                        {code: (now.getMonth() + 1).toString() + "/" + now.getFullYear().toString()});
        
        const calendar = await odoo.searchRead(`hdlv.calendar.planning`,{ period_id: periodo[0]},
        ["id", "date_from", "date_to", "tipo"]);

        if (calendar.length > 0){
            let calendar_id = 0
            if (calendar.length == 1){
                calendar_id = calendar[0].id
            } else{
                let fechaLocal = new Date(Date.now()+(1000*60*(-(new Date()).getTimezoneOffset())));
                let fechaDesdeHorario = false
                let fechaHastaHorario = false
                for (let i = 0; i < calendar.length; i++) {
                        fechaDesdeHorario = new Date(calendar[i].date_from)
                        fechaHastaHorario = new Date(calendar[i].date_to)
                        if (fechaLocal >= fechaDesdeHorario && fechaLocal <= fechaHastaHorario){
                            console.log('CALENDARIO ENCONTRADO!')
                            calendar_id = calendar[i].id
                            break;
                        }
                }  
            }

            if (calendar_id != 0){
                const calendar_lines = await odoo.searchRead(
                    `hdlv.calendar.planning.lines`, [['calendar_planning_id', '=', calendar_id]],
                    ["id","fecha_desde", "fecha_hasta"]
                    )
                console.log('CALENDAR LINES')
                console.log(calendar_lines)
                if (calendar_lines.length > 0){
                    for (let i = 0; i < calendar_lines.length; i++) {
                            let fecha_desde_odoo = subtractHours(new Date(calendar_lines[i].fecha_desde), 5)
                            let fecha_hasta_odoo = subtractHours(new Date(calendar_lines[i].fecha_hasta), 5)
                            if (now >= fecha_desde_odoo && now <= fecha_hasta_odoo){
                                fecha_desde = fecha_desde_odoo
                                fecha_hasta = fecha_hasta_odoo
                                break;
                            }                    
                        };
                    if (fecha_desde != false && fecha_hasta != false){
                        const asistencias = await odoo.searchRead(`hdlv.lunch.register`,[
                                    "&",
                                    ["create_date", ">=", fecha_desde.toISOString().split('.')[0].replace('T',' ').replace('Z','')],
                                    ["create_date", "<=", fecha_hasta.toISOString().split('.')[0].replace('T',' ').replace('Z','')]],
                                ["id", "fecha_hora_comida_1","fecha_hora_comida_2", "empleado_id"],
                                {order: "write_date desc"});
                        if (asistencias.length > 0){
                            for (let i = 0; i < asistencias.length; i++) {
                                if (asistencias[i].fecha_hora_comida_1 != false){
                                    let fecha_hora_comida_1 = new Date(asistencias[i].fecha_hora_comida_1 + ' UTC')
                                    asistencias[i].fecha_hora_comida_1 = fecha_hora_comida_1.toLocaleString()}
            
                                if (asistencias[i].fecha_hora_comida_2 != false){
                                    let fecha_hora_comida_2 = new Date(asistencias[i].fecha_hora_comida_2 + ' UTC')
                                    asistencias[i].fecha_hora_comida_2 = fecha_hora_comida_2.toLocaleString()}
                                };
                                res.json(asistencias)
                            }else{
                                throw new Error("No existen datos!");
                            }
                        }
                } else{
                    throw new Error('No existe un detalle configurado del horario en el ERP')
                }
            }
        } else {
            throw new Error("No existen un horario configurado en el ERP para el mes actual!");
        }
    } catch (error){
        res.json({message: error.message})
        }
    }
);


function subtractHours(date, hours) {
    date.setHours(date.getHours() - hours);
    return date;
  }

module.exports = router;