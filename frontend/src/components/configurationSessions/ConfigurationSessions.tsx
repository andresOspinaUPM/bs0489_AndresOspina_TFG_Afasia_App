import {useEffect, useState} from "react";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Alert from "react-bootstrap/Alert";
import style from './ConfigurationSessions.module.css';
import { getPatientsListPerDoctor, getTotalOfWords, configureAfasiaSessions } from "../../services/api";
import { PatientsList } from "../../types";
import { DropdownButton, Dropdown } from "react-bootstrap";

function ConfigurationSessions() {
const[configurationData, setConfigurationData] =  useState({
	dni_paciente: '',
	nivel: 'Facil',
	cantidad_pruebas: '',
	tiempo_limite_por_prueba: '',
	imagenes_aleatorias: false,
});

const [error, setError] = useState('');
const [patientsList, setPatientsList] = useState<PatientsList[]>([]);
const [loadingPatients, setLoadingPatients] = useState(false);
const [totalWordsAvailable, setTotalWordsAvailable] = useState(0);
const [selectedPatientName, setSelectedPatientName] = useState('');
const [message, setMessage]= useState('');
const [allowConfiguration, setAllowConfiguration] = useState(false);

const getPatientsList = async()=>{
	try{
		setLoadingPatients(true);
		const response = await getPatientsListPerDoctor();
		if(response.length > 0){
			setPatientsList(response);
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

const getTotalWordsAvailable = async () => {
	try{
		const response = await getTotalOfWords();
		setTotalWordsAvailable(response);
	}catch(error){
		setTotalWordsAvailable(0);
		throw new Error('Error al obtener el total de palabras disponibles.');
	}
};

useEffect(() => {
  getPatientsList();
  getTotalWordsAvailable();
},[]);

useEffect(()=>{
	handleAllowConfiguration(configurationData);
},[configurationData]);

const handleAllowConfiguration = (data: typeof configurationData) => {
	const dni_paciente = data.dni_paciente.trim().toUpperCase();
	const nivel = data.nivel;
	const cantidad_pruebas = data.cantidad_pruebas;
	const tiempo_limite_por_prueba = data.tiempo_limite_por_prueba;
	if(dni_paciente !== '' && nivel !== '' && cantidad_pruebas !== '' && tiempo_limite_por_prueba !== ''){
		setAllowConfiguration(true);
	}else{
		setAllowConfiguration(false);
	}
}

const handlePatientSelected = (selectedPatient: PatientsList | null) => {
  setConfigurationData(prev => ({
	...prev,
	dni_paciente: selectedPatient ? selectedPatient.dni : '',
  }));
  setSelectedPatientName(selectedPatient ? `${selectedPatient.nombre} ${selectedPatient.apellidos}` : '');
  if(error) setError('');
}

const handleTotalTestsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
	const value = e.target.value;
	const numberValue = parseInt(value);
	const { name } = e.target;
	setConfigurationData(prev => ({
		...prev,
		[name]: value
	}));

	if(value === ''){
		setError('Por favor, ingrese la cantidad de pruebas.');
		return;
	}

	if (isNaN(numberValue) || numberValue < 1) {
		setError('Por favor, ingrese un número válido mayor 0.');
		return;
	}
	if(numberValue > totalWordsAvailable){
		setError(`El número máximo de pruebas permitidas es ${totalWordsAvailable}.`);
		return;
	}
	if(error) setError('');
}

const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
	const MIN_SESSION_TIME = 1;
	const MAX_SESSION_TIME = 10;
	const value = e.target.value;
	const numberValue = parseInt(value);
	const { name } = e.target;
	setConfigurationData(prev => ({
		...prev,
		[name]: value
	}));

	if(value === ''){
		setError('Por favor, ingrese el tiempo límite por prueba.');
		return;
	}

	if (isNaN(numberValue) || numberValue < MIN_SESSION_TIME) {
		setError('Por favor, ingrese un número válido mayor 0.');
		return;
	}

	if(numberValue > MAX_SESSION_TIME){
		setError(`El tiempo máximo por prueba es ${MAX_SESSION_TIME} minutos.`);
		return;
	}
	if(error) setError('');
};

const handleRadioChange = (value: boolean) => {
    setConfigurationData(prev => ({
      ...prev,
      imagenes_aleatorias: value
    }));
    if(error) setError('');
};

const cleanData = (data: typeof configurationData) => {
	data.cantidad_pruebas = String(data.cantidad_pruebas).trim();
	data.tiempo_limite_por_prueba = String(data.tiempo_limite_por_prueba).trim();
	return{
		dni_paciente: data.dni_paciente.trim().toUpperCase(),
		nivel: data.nivel,
		cantidad_pruebas: parseInt(data.cantidad_pruebas),
		tiempo_limite_por_prueba: parseInt(data.tiempo_limite_por_prueba)*60,
		imagenes_aleatorias: data.imagenes_aleatorias,
	}
}

const handleSubmit = async (event: React.FormEvent) => {
  event.preventDefault();
  setAllowConfiguration(true);
  try{
	const cleanedData = cleanData(configurationData);
	const response = await configureAfasiaSessions(cleanedData);
	setMessage(`${response.message}`);
	
	setConfigurationData({
		dni_paciente: '',
		nivel: 'facil',
		cantidad_pruebas: '',
		tiempo_limite_por_prueba: '',
		imagenes_aleatorias: false,
	});
	setSelectedPatientName('');

  }catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error desconocido al guardar la configuración.');
      }
    }finally{
		setAllowConfiguration(false);
	}
}

  return (
    <section className={style['main-container']}>
			<div className={style['form-container']}>
				<h1>Configuración Pruebas Pacientes</h1>
				{message && <Alert variant="success">{message}	</Alert>}
				{error && <Alert variant="danger">{error}</Alert>}
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
					</Form.Group>

					<Form.Group className="mb-3">
						<Form.Label>Introduzca la cantidad de imagenes para la prueba</Form.Label>
						<Form.Control 
						required type="number"
						name="cantidad_pruebas"
						value={configurationData.cantidad_pruebas}
						onChange={handleTotalTestsChange}
						placeholder="Cantidad de pruebas" />
					</Form.Group>

					<Form.Group className="mb-3">
						<Form.Label>Introduzca el tiempo por imagen</Form.Label>
						<Form.Control 
						required type="number"
						name="tiempo_limite_por_prueba"
						value={configurationData.tiempo_limite_por_prueba}
						onChange={handleTimeChange}
						placeholder="Tiempo por imagen (minutos)" />
					</Form.Group>


					<Form.Group className="mb-3">
						<Form.Label>Imagenes Aleatorias</Form.Label>
						<div key="inline-radio" className="mb-3">
							<Form.Check 
								inline 
								label="Si" 
								name="imagenes_aleatorias" 
								type="radio" 
								id="inline-radio-true"
								value="imagenes aleatorias"
								checked={configurationData.imagenes_aleatorias === true}
								onChange={() => handleRadioChange(true)}
							/>
							<Form.Check 
								inline 
								label="No" 
								name="imagenes_aleatorias" 
								type="radio" 
								id="inline-radio-false"
								value="Mantener siempre las mismas imagenes"
								checked={configurationData.imagenes_aleatorias === false}
								onChange={() => handleRadioChange(false)}
							/>
						</div>
					</Form.Group>

					<Button className={style['form-button']} variant="primary" type="submit" disabled={!allowConfiguration}>
						Finalizar configuración
					</Button>
                            
				</Form>
			</div>
		</section>
  )
}

export default ConfigurationSessions;