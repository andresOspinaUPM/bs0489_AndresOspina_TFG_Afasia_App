import Table from 'react-bootstrap/Table';
import style from './DoctorPatient.module.css';
import { Link } from "react-router-dom";


function DoctorPatients() {
    const totalPatients = 5;
    const patientsNames = ["John Doe", "Angie Milner", "Catalina Lopera", "Andres Ospina", "Camilo Rodriguez"];
  return (
   <div className={style['container']}>
			<div className={style['table-container']}>
				<h1>Registros pruebas</h1>
				<Table striped className={style['doctor-patients-table']}>
					<thead>
						<tr>
							<th>id</th>
							<th>Nombre Paciente</th>
							<th>Registro</th>
						</tr>
					</thead>
					<tbody>
                        {Array.from({length: totalPatients}, (_, index) => (
                            <tr key={index + 1}>
                                <td>{index + 1}</td>
                                <td>{patientsNames[index]}</td>
                                <td><Link to = {`/medico/pacientes/${index + 1}/registros`}>Registro {patientsNames[index]}</Link></td>
                            </tr>
                        ))}
					</tbody>
				</Table>
			</div>
		</div>
  )
}

export default DoctorPatients;
