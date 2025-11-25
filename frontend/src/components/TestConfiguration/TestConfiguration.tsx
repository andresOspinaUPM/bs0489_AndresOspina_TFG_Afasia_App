import {useEffect, useState} from "react";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import style from './TestConfiguration.module.css';
import { useNavigate } from 'react-router-dom';
import { getPatientsListPerDoctor, PatientsList } from "../../services/api";
import { DropdownButton, Dropdown } from "react-bootstrap";

function TestConfiguration() {
const[configurationData, setConfigurationData] =  useState({
	dni_paciente: '',
	nivel: 'facil',
	cantidad_pruebas: 0,
	tiempo_limite_por_prueba: 0,
	imagenes_aleatorias: null,
});

const [error, setError] = useState('');
const [patientsList, setPatientsList] = useState<PatientsList[]>([]);
const [loadingPatients, setLoadingPatients] = useState(false);
const [selectedPatientName, setSelectedPatientName] = useState('');

const navigate = useNavigate();

// const patientsList = [
//   { id: 1, name: 'Juan Pérez' },
//   { id: 2, name: 'María Gómez' },
//   { id: 3, name: 'Carlos López' },
// ];

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
		throw new Error('Error al obtener la lista de pacientes.');
	}finally{
		setLoadingPatients (false);
	}
};


useEffect(() => {
  getPatientsList();
},[]);

const handlePatientSelected = (selectedPatient: PatientsList | null) => {
  setConfigurationData(prev => ({
	...prev,
	dni_paciente: selectedPatient ? selectedPatient.dni : '',
  }));
  setSelectedPatientName(selectedPatient ? `${selectedPatient.nombre} ${selectedPatient.apellidos}` : '');
  if(error) setError('');
}

const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfigurationData(prev => ({
      ...prev,
      [name]: value
    }));
    if(error) setError('');
};

const cleanData = (data: typeof configurationData) => {
	return{
		dni_paciente: data.dni_paciente.trim().toUpperCase(),
		cantidad_pruebas: data.cantidad_pruebas,
		tiempo_limite_por_prueba: data.tiempo_limite_por_prueba,
		imagenes_aleatorias: data.imagenes_aleatorias,
	}
}

const handleSubmit = (event: React.FormEvent) => {
  event.preventDefault();
  try{
	const cleanedData = cleanData(configurationData);
  }catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error al registrar paciente');
      }
    }
  
  alert('Configuración guardada');
  navigate('/medico.inicio');
}

  return (
    <section className={style['main-container']}>
			<div className={style['form-container']}>
				<h1>Configuración Pruebas Pacientes</h1>
				<Form className={style['form']} onSubmit={handleSubmit}>
					<Form.Group className="mb-3">
						<Form.Label>Seleccione un paciente</Form.Label>
						<DropdownButton
						title={selectedPatientName || "Seleccione un paciente"}
						className={style['patient-dropdown-list']}>
							{
								loadingPatients ? (
									<Dropdown.Item 
									className={style['patient-dropdown-item']}
									disabled>Cargando pacientes...</Dropdown.Item>
								) :
								patientsList.length > 0 ? (
									patientsList.map((patient) => (
										<Dropdown.Item 
											className={style['patient-dropdown-item']}
											key={patient.dni}
											onClick={() => handlePatientSelected (patient)}
										>
											{patient.nombre} {patient.apellidos}
										</Dropdown.Item>
									))
								) : (
									<Dropdown.Item className={style['patient-dropdown-item']} disabled>No hay pacientes disponibles</Dropdown.Item>
								)
							}
						</DropdownButton>
						{/* <Form.Label>Seleccione un paciente</Form.Label>
						<Form.Select>
							{patientsList.map(patient => (
								<option key={patient.dni} value={patient.dni}>
									{patient.nombre} {patient.apellidos}
								</option>
							))}
						</Form.Select> */}
					</Form.Group>

					<Form.Group className="mb-3">
						<Form.Label>Introduzca la cantidad de imagenes para la prueba</Form.Label>
						<Form.Control 
						required type="number" 
						value={configurationData.cantidad_pruebas} 
						placeholder="Cantidad de imágenes" />
					</Form.Group>

					<Form.Group className="mb-3">
						<Form.Label>Introduzca el tiempo por imagen</Form.Label>
						<Form.Control 
						required type="number" 
						value={configurationData.tiempo_limite_por_prueba} 
						placeholder="Tiempo por imagen (segundos)" />
					</Form.Group>


					<Form.Group className="mb-3">
						<Form.Label>Sexo</Form.Label>
						<div key="inline-radio" className="mb-3">
							<Form.Check 
								inline 
								label="True" 
								name="imagenes_aleatorias" 
								type="radio" 
								id="inline-radio-true"
								value="imagenes aleatorias"
								checked={configurationData.imagenes_aleatorias === true}
								onChange={handleRadioChange}
							/>
							<Form.Check 
								inline 
								label="False" 
								name="imagenes_aleatorias" 
								type="radio" 
								id="inline-radio-false"
								value="Mantener siempre las mismas imagenes"
								checked={configurationData.imagenes_aleatorias === false}
								onChange={handleRadioChange}
							/>
						</div>
					</Form.Group>

					<Button className={style['form-button']} variant="primary" type="submit">
						Finalizar configuración
					</Button>
                            
				</Form>
			</div>
		</section>
  )
}

export default TestConfiguration;