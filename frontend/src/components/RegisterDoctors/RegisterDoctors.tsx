import { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import { Link } from "react-router-dom";
import style from "./RegisterDoctors.module.css";
import RegisterBase from "../RegisterBase/RegisterBase";
import {registerDoctor} from "../../services/api";

function RegisterDoctors() {
  const [formData, setFormData] = useState({
    dni: '',
    nombre: '',
    apellidos: '',
    centro_medico: '',
    email: '',
    contrasena: ''
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const cleanData = (data: typeof formData)=>{
    return{
      dni: data.dni.trim().toUpperCase(),
      nombre: data.nombre.replace(/\s+/g, ' ').trim(),
      apellidos: data.apellidos.replace(/\s+/g, ' ').trim(),
      centro_medico: data.centro_medico.replace(/\s+/g, ' ').trim(),
      email: data.email.trim().toLowerCase(),
      contrasena: data.contrasena.trim()
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

  const prepareMedicoData = (processedData: ReturnType<typeof cleanData>) => {
    return {
      dni: processedData.dni,
      nombre: processedData.nombre.charAt(0).toUpperCase() + processedData.nombre.slice(1).toLowerCase(),
      apellidos: processedData.apellidos.charAt(0).toUpperCase() + processedData.apellidos.slice(1).toLowerCase(),
      centro_medico: processedData.centro_medico.charAt(0).toUpperCase() + processedData.centro_medico.slice(1).toLowerCase(),
      email: processedData.email,
      contrasena: processedData.contrasena
    };
    }

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if(error) setError('');
  };

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
      const medicoData = prepareMedicoData(cleanedData);

      const response = await registerDoctor(medicoData);

      console.log('Response completa:', response);
      console.log('response.message:', response.message);
      console.log('Tipo de message:', typeof response.message);

      setMessage(`${response.message || 'Médico registrado exitosamente'}. Bienvenido/a Dr. ${cleanedData.nombre}`);

      setFormData({
        dni: '',
        nombre: '',
        apellidos: '',
        centro_medico: '',
        email: '',
        contrasena: ''
      });

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Error al registrar médico');
      } else {
        setError('Error al registrar médico');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={style["main-container"]}>
      <div className={style["form-container"]}>
        <h1>Registro de Médico</h1>

        {message && <Alert variant="success">{message}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}

        <Form className={style["form"]} onSubmit={handleSubmit}>
          <RegisterBase 
            formData={formData}
            onChange={handleInputChange}
          />

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

export default RegisterDoctors;
