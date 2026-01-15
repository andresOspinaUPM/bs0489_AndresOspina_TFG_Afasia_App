import { Link } from "react-router-dom";
import {useState, useEffect} from 'react'
import {getSessionsListPerPatient, PatientSessions} from '../../services/api';
import { useSessionContext } from "../../context/sessionContext";
import { Session } from "../../types";
import Table from 'react-bootstrap/esm/Table';
import style from './PatientSessionsList.module.css';

type ContentType = 'pruebas' | 'registros'

function PatientSessionsList({type}: {type:ContentType}) {

  const contentConfig = {
    pruebas:{
      linkTitle: 'Iniciar Prueba',
      linkUrl: '/paciente/pruebas/'
    },
    registros:{
      linkTitle: 'Ver Registros de la Prueba',
      linkUrl: '/paciente/registros/'
    }
  }

  const config = contentConfig[type]
	
  const [patientSessions, setPatientSessions] = useState<PatientSessions[]>([]);

  const {setSession} = useSessionContext();

  useEffect(() => {
    getPatientSessions();
  }, []);

   async function getPatientSessions(){
    try{
      const response = await getSessionsListPerPatient();
      setPatientSessions(response);
      console.log('Sesiones del paciente obtenidas:', response);
    }catch(error){
       setPatientSessions([]);
       throw new Error('Error al obtener la lista de sesiones del paciente.');
    }
  }

  const handleStartSession = (session:Session) => {
    setSession(session);
  }

  return (
    <div className={style['container']}>
      <div className={style['table-container']}>
        <h1>Listado de Pruebas del Paciente</h1>
        <Table striped className={style['sessions-table']}>
          <thead>
            <tr>
              <th>Nombre Sesión</th>
            </tr>
          </thead>
          <tbody>
            {patientSessions.map((session) => (
              <tr key={session.id_sesion}>
                <td>{session.nombre_sesion}</td>
                <td>
                  <Link to={`${config.linkUrl}${session.id_sesion}`}
                    onClick={() => handleStartSession(session)}
                  >{config.linkTitle}</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  )
}

export default PatientSessionsList