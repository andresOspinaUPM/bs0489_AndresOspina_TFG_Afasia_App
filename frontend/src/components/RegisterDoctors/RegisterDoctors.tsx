import { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import { Link } from "react-router-dom";
import style from "./RegisterDoctors.module.css";
import RegisterBase from "../RegisterBase/RegisterBase";
import {registerDoctor} from "../../services/api";
import { validateCommonFields } from "../../utils/validators";

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
  const [loading, setLoading] = useState(false);
  const [registerErrors, setRegisterErrors] = useState<Record<string, string>>({});


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
    return validateCommonFields(data);
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
    setFormData(prev => ({ ...prev, [name]: value }));
    if(registerErrors[name]){
      setRegisterErrors(prev => ({...prev, [name]: ''}))
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    const cleanedData = cleanData(formData);
    const validationErrors = validateData(cleanedData);

    if(Object.keys(validationErrors).length > 0){
      setRegisterErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      const medicoData = prepareMedicoData(cleanedData);
      const response = await registerDoctor(medicoData);

      setMessage(`${response.message || 'Médico registrado exitosamente'}. Bienvenido/a Dr. ${cleanedData.nombre}`);

      setFormData({
        dni: '',
        nombre: '',
        apellidos: '',
        centro_medico: '',
        email: '',
        contrasena: ''
      });
      setRegisterErrors({})

    } catch (err: unknown) {
      if (err instanceof Error) {
        setRegisterErrors({ general: err.message || 'Error al registrar médico' });
      } else {
        setRegisterErrors({ general:'Error al registrar médico' });
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
        {registerErrors.general && <Alert variant="danger">{registerErrors.general}</Alert>}

        <Form noValidate className={style["form"]} onSubmit={handleSubmit}>
          <RegisterBase 
            formData={formData}
            onChange={handleInputChange}
            registerErrors={registerErrors}
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
