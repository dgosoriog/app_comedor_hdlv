const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());


app.use("/", require("./routes/empleadoRoute"))

//app.get('/', function(req, res){
//   res.send('Express running!') 
//})
app.use("/", require("./routes/asistenciaRoute"));

app.listen(3001, () =>{
    console.log(`El servidor está escuchando en el puerto 3001...`);
});