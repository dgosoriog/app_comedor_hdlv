import hdlvLogo from '../imagenes/hdlv_logo.png'
import 'bootstrap/dist/css/bootstrap.css';

function Cabecera() {

  return (
    <div className='hdlv-cabecera-contenedor'>
        <div className='hdlv-logo-contenedor'>
            <img
            className='hdlv-logo'
            src={hdlvLogo}
            alt='Logo HDLV'/>
        </div>
        <div className='hdlv-titulo-contenedor'>
            <h2>REGISTRO DE COMIDAS PARA COLABORADORES</h2>
        </div>
    </div>
  );
}

export default Cabecera;
