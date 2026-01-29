import Table from 'react-bootstrap/Table';
import style from './DoctorPatientsList.module.css';
import { Link } from "react-router-dom";
import {useEffect, useState} from 'react';
import {PatientData} from '../../types';
import { getPatientsListPerDoctor } from "../../services/api";
import { useDoctorPatientContext } from '../../context/doctorPatientContext';


function PatientsListForDoctorRecords() {

  const [patientsList, setPatientsList] = useState<PatientData[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const {setSelectedPatient} = useDoctorPatientContext();

  useEffect(()=>{
    getPatientsList()
  },[])
  
  const getPatientsList = async()=>{
    try{
      setLoadingPatients(true);
      const response = await getPatientsListPerDoctor();
      if(response.length > 0){
        setPatientsList(response);
        console.log('Pacientes obtenidos:', response);
      }else{
        throw new Error ('No se encontraron pacientes asignados al médico.');
      }
    }catch(error){
      setPatientsList([]);
      console.error('Error al obtener la lista de pacientes.');
    }finally{
      setLoadingPatients (false);
    }
  };

  const handleSelectedPatient = (patient: PatientData) => {
    setSelectedPatient(patient);
    console.log('PacienteSeleccionado: ', patient)
  }

  if (loadingPatients){
    return (
			<div>
				<div>
					<h1>Listado de Pacientes</h1>
					<br/>
					<h5>Cargando listado de pacientes.</h5>
				</div>
			</div>
		);
  }

  return(
    <div className={style['container']}>
      <div className={style['table-container']}>
        <h1>Listado de Pacientes</h1>
        <Table striped className={style['doctor-patients-table']}>
          <thead>
            <th>Nombre Paciente</th>
          </thead>
          <tbody>
            {patientsList.map((patient) => (
              <tr key={patient.dni}>
                <td>{patient.nombre} {patient.apellidos}</td>
                <td>
                  <Link to={`/doctor/pacientes/${patient.nombre}/lista-pruebas`}
                  onClick={() => handleSelectedPatient(patient)}
                  > Ver Pruebas Asignadas</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  )
}

export default PatientsListForDoctorRecords;
