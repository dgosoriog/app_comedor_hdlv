import Lector from './componentes/Lector';
import Cabecera from './componentes/Cabecera';
import RegistroAsistencia from './componentes/RegistroAsistencia';
import 'bootstrap/dist/css/bootstrap.css';

function App() {
  return (
    <div className="app-comedor-hdlv">
      <Cabecera/>
      <Lector/>
      <RegistroAsistencia/>
    </div>
  );
}

export default App
