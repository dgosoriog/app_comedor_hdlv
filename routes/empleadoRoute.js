const express = require('express')
const router = express.Router();
//const {Client} = require('pg');
const Odoo = require("odoo-await");
//const Odoo = require("odoo-xmlrpc");

const odoo = new Odoo({
    baseUrl: "http://localhost:8075",
    port: undefined, // see comments below regarding port option
    db: "odoo12_eventos",
    username: "admin",
    password: "odoo12",
  });
/*const odoo = new Odoo({
    url: "http://localhost",
    port: 8075, // see comments below regarding port option
    db: "odoo12_eventos",
    username: "admin",
    password: "odoo12",
  })*/

/*const client = new Client({
    host: "localhost",
    user: "odoo12",
    port: 5432,
    database: "odoo12_eventos",
    password: "odoo12",
})*/
  
router.route('/empleado').get(async (req, res) =>{
    console.log('Llego al backend');
    try{
        await odoo.connect();
        const empleado = await odoo.searchRead(
            `hr.employee`, ["|",
             ["identification_id", "=", req.query.rfid],
             ["rfid_employee", "=", req.query.rfid]],
            ["id", "name", "identification_id", "horario_id"]
            )
        
        if (empleado.length > 0){
            
            let other_date = new Date().toISOString().split('.')[0].replace('T',' ').replace('Z','');
            //let now = new Date(Date.now()+(1000*60*(-(new Date()).getTimezoneOffset())));
            let now = new Date();

            const employee_calendar = await odoo.searchRead(`hdlv.calendar.planning`, 
                 {"id": empleado[0].horario_id[0]})
            console.log(now)
            console.log(employee_calendar)
            if (employee_calendar.length > 0){
                let comidasPermitidas = employee_calendar[0].nro_comidas_permitido
                const calendar_planning_ids = await odoo.searchRead(
                    `hdlv.calendar.planning.lines`, [['calendar_planning_id', '=', employee_calendar[0].id]],
                    ["id","fecha_desde", "fecha_hasta"]
                    )
                console.log(calendar_planning_ids)
                let enHorario = false
                let calendar_planning_line_id = 0
                for (let i = 0; i < calendar_planning_ids.length; i++) {
                    fecha_desde = subtractHours(new Date(calendar_planning_ids[i].fecha_desde), 5)
                    fecha_hasta = subtractHours(new Date(calendar_planning_ids[i].fecha_hasta), 5)
                    if (now >= fecha_desde && now <= fecha_hasta){
                        enHorario = true;
                        calendar_planning_line_id = calendar_planning_ids[i].id
                        console.log('Encontrado!');
                        break;
                    }                    
                };
                if (!enHorario){
                    throw new Error("El Colaborador no se encuentra en horario de trabajo!");
                }else{
                    if (calendar_planning_line_id != 0){
                        const lunchRegister = await odoo.searchRead(
                            `hdlv.lunch.register`, [['linea_horario_id', '=', calendar_planning_line_id], ['empleado_id', "=", empleado[0].id]],
                            ["id","fecha_hora_comida_1", "fecha_hora_comida_2"]
                            )
                        let hora_comida = now.toISOString().split('.')[0].replace('T',' ').replace('Z','')
                        if (lunchRegister.length > 0){
                            if (comidasPermitidas == 1){
                                if (lunchRegister[0].fecha_hora_comida_1 == false){
                                    console.log(hora_comida)
                                    const updated = await odoo.update("hdlv.lunch.register", lunchRegister[0].id, {
                                        fecha_hora_comida_1: hora_comida,
                                    });
                                    console.log('Almuerzo registrado!')
                                } else{
                                    throw new Error("El Colaborador ya tomó la comida en su horario de trabajo!");
                                }
                            }
                            else if (comidasPermitidas == 2){
                                if (lunchRegister[0].fecha_hora_comida_1 != false && lunchRegister[0].fecha_hora_comida_2 != false){
                                    throw new Error("El Colaborador ya tomó las comidas en su horario de trabajo!");
                                }

                                if (lunchRegister[0].fecha_hora_comida_1 == false){
                                    console.log(hora_comida)
                                    const updated = await odoo.update("hdlv.lunch.register", lunchRegister[0].id, {
                                        fecha_hora_comida_1: hora_comida
                                    });
                                    console.log('Almuerzo 1 registrado!')
                                } else{
                                    console.log(hora_comida)
                                    const updated = await odoo.update("hdlv.lunch.register", lunchRegister[0].id, {
                                        fecha_hora_comida_2: hora_comida
                                    });
                                    console.log('Almuerzo 2 registrado!')
                                }
                            }

                        } else{
                            const hdlvLunchRegisterId = await odoo.create("hdlv.lunch.register", {
                                linea_horario_id: calendar_planning_line_id,
                                fecha_hora_comida_1: hora_comida,
                                empleado_id: empleado[0].id
                              });
                            console.log('Almuerzo registrado!')
                        }
                    }
                }
                
            }
            else{
                throw new Error("El Colaborador no posee horario!");
            }
            res.json(empleado)
        }else{
            throw new Error("El Colaborador no está registrado en el ERP!");
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

Date.prototype.addHours = function(h) {
    this.setTime(this.getTime() + (h*60*60*1000));
    return this;
}

module.exports = router;