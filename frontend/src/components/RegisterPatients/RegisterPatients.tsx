import {useState, useEffect} from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import style from "./RegisterPatients.module.css";
import { Link } from "react-router-dom";
import RegisterBase from "../RegisterBase/RegisterBase";
import {registerPatient, getDoctorList, DoctorList} from "../../services/api";
import { DropdownButton, Dropdown } from "react-bootstrap";

function RegisterPatient() {
  const[formData, setFormData] = useState({
    dni: "",
    nombre: "",
    apellidos: "",
    centro_medico: "",
    email: "",
    contrasena: "",
    fecha_nacimiento: "",
    dni_medico: "",
    sexo: "",
  });

  const [message, setMessage]= useState('');
  const [error, setError] = useState('');
  const[loading, setLoading] = useState(false);
  const [doctorList, setDoctorList] = useState<DoctorList[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [selectedDoctorName, setSelectedDoctorName] = useState('');

  useEffect(() => {
    getDoctorListData();
  },[]);

    const getDoctorListData = async () => {
    try {
      setLoadingDoctors(true);
      const response = await getDoctorList();
      if (response.length > 0) {
        setDoctorList(response);
        console.log('Médicos obtenidos:', response);
      } else {
        setDoctorList([]);
        throw new Error('No se encontraron médicos disponibles.');
      }
    } catch (error) {
      setDoctorList([]);
      throw new Error('Error al obtener la lista de médicos.');
    } finally {
      setLoadingDoctors(false);
    }
  }

   const cleanData = (data: typeof formData)=>{
    return{
      dni: data.dni.trim().toUpperCase(),
      nombre: data.nombre.replace(/\s+/g, ' ').trim(),
      apellidos: data.apellidos.replace(/\s+/g, ' ').trim(),
      centro_medico: data.centro_medico.replace(/\s+/g, ' ').trim(),
      email: data.email.trim().toLowerCase(),
      contrasena: data.contrasena.trim(),
      fecha_nacimiento: data.fecha_nacimiento,
      dni_medico: data.dni_medico.trim().toUpperCase(),
      sexo: data.sexo
    }
  }

  const validateData = (data: ReturnType<typeof cleanData>) =>{
    const errors: string[] = [];
    if(!data.dni.trim()){
      errors.push('El DNI es obligatorio');
    }else if(data.dni.trim().length !== 9 || !validateDNI(data.dni.trim())){
      errors.push('El DNI no es válido.');
    }
    if(data.nombre.length < 2){
      errors.push('El nombre debe tener al menos 2 caracteres.');
    }
    if(data.apellidos.length < 2){
      errors.push('El apellido debe tener al menos 2 caracteres.');
    }
    if(data.centro_medico.length < 2){
      errors.push('El centro médico debe tener al menos 2 caracteres.');
    }
    if(!data.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)){
      errors.push('El email no es válido.');
    }
    if(data.contrasena.length < 6){
      errors.push('La contraseña debe tener al menos 6 caracteres.');
    }
    if(!data.fecha_nacimiento){
      errors.push('La fecha de nacimiento es obligatoria.');
    }
    if(!data.dni_medico){
      errors.push('El médico es obligatorio.');
    }
    if(!data.sexo){
      errors.push('El sexo es obligatorio.');
    }
    return errors;
  }

  const validateDNI = (dni: string) =>{
    if(!dni.match(/^[0-9]{8}[A-Za-z]$/)){
      return false;
    }
    const numero = dni.substring(0, 8);
    const letra = dni.substring(8, 9).toUpperCase();
    const letras = 'TRWAGMYFPDXBNJZSQVHLCKE';
    const letraCorrecta = letras.charAt(parseInt(numero, 10) % 23);
    return letra === letraCorrecta;
  }

  const preparePatientData = (processedData: ReturnType<typeof cleanData>) => {
    return {
      dni: processedData.dni,
      nombre: processedData.nombre.charAt(0).toUpperCase() + processedData.nombre.slice(1).toLowerCase(),
      apellidos: processedData.apellidos.charAt(0).toUpperCase() + processedData.apellidos.slice(1).toLowerCase(),
      centro_medico: processedData.centro_medico.charAt(0).toUpperCase() + processedData.centro_medico.slice(1).toLowerCase(),
      email: processedData.email,
      contrasena: processedData.contrasena,
      fecha_nacimiento: processedData.fecha_nacimiento,
      dni_medico: processedData.dni_medico,
      sexo: processedData.sexo
    };
  }

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if(error) setError('');
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if(error) setError('');
};

const handleDoctorSelect = (doctorName: DoctorList) => {
    setFormData(prev => ({
      ...prev,
      dni_medico: doctorName.dni
    }));
    setSelectedDoctorName(`${doctorName.nombre} ${doctorName.apellidos}`);
    if(error) setError('');
}
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setMessage('');
    setError('');
    setLoading(true);

    try {

      const cleanedData = cleanData(formData);
      const validationErrors = validateData(cleanedData);
      if(validationErrors.length > 0){
        throw new Error(validationErrors.join(' '));
      }

      const patientData = preparePatientData(cleanedData);

      const response = await registerPatient(patientData);

      setMessage(`${response.message}. Bienvenido/a ${formData.nombre}`);
      
      setFormData({
        dni: '',
        nombre: '',
        apellidos: '',
        centro_medico: '',
        email: '',
        contrasena: '',
        fecha_nacimiento: '',
        dni_medico: '',
        sexo: ''
      });
      setSelectedDoctorName('');

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error al registrar paciente');
      }
    } finally {
      setLoading(false);
    }
  };

   return (
    <section className={style["main-container"]}>
      <div className={style["form-container"]}>
        <h1>Registro de Paciente</h1>

        {message && <Alert variant="success">{message}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}

        <Form className={style["form"]} onSubmit={handleSubmit}>
          <RegisterBase 
            formData={formData}
            onChange={handleInputChange}
          />
          <Form.Group className="mb-3">
            <Form.Label>Fecha de Nacimiento</Form.Label>
            <Form.Control 
              required 
              type="date" 
              name="fecha_nacimiento"
              value={formData.fecha_nacimiento}
              onChange={handleRadioChange}
              placeholder="Ingresar Fecha de Nacimiento" 
            />
          </Form.Group>
            <Form.Label>Medico Responsable</Form.Label>
            <DropdownButton 
              title = {selectedDoctorName || 'Seleccione un médico'} 
              className={style["doctor-dropdown-list"]}>
            {loadingDoctors ? (
              <Dropdown.Item 
              className={style["doctor-dropdown-item"]}
              disabled>Cargando médicos...</Dropdown.Item>
            ) :
            doctorList.length > 0 ? (
              doctorList.map((doctor) => (
                <Dropdown.Item 
                  className={style["doctor-dropdown-item"]}
                  key={doctor.dni} 
                  onClick={() => {
                    handleDoctorSelect(doctor);
                    
                  }}
                >
                  {doctor.nombre} {doctor.apellidos}
                </Dropdown.Item>
              ))
            ) : (
              <Dropdown.Item 
              className={style["doctor-dropdown-item"]}
              disabled>No hay médicos disponibles</Dropdown.Item>
            )} 
            </DropdownButton>
          <Form.Group>

          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Sexo</Form.Label>
            <div key="inline-radio" className="mb-3">
              <Form.Check 
                inline 
                label="Hombre" 
                name="sexo" 
                type="radio" 
                id="inline-radio-hombre"
                value="Hombre"
                checked={formData.sexo === 'Hombre'}
                onChange={handleRadioChange}
              />
              <Form.Check 
                inline 
                label="Mujer" 
                name="sexo" 
                type="radio" 
                id="inline-radio-mujer"
                value="Mujer"
                checked={formData.sexo === 'Mujer'}
                onChange={handleRadioChange}
              />
              <Form.Check 
                inline 
                label="Otro" 
                name="sexo" 
                type="radio" 
                id="inline-radio-otro"
                value="Otro"
                checked={formData.sexo === 'Otro'}
                onChange={handleRadioChange}
              />
            </div>
          </Form.Group>

          <Button 
            className={style["form-button"]} 
            variant="primary" 
            type="submit"
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Registrar'}
          </Button>
          
          <p className={style["form-redirection-text"]}>
            ¿Ya tienes cuenta?&nbsp;
            <Link to="/login">Inicia sesión</Link>
          </p>
        </Form>
      </div>
    </section>
  );
}

export default RegisterPatient;
