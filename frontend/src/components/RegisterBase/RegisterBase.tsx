import {useState} from "react";
import Form from "react-bootstrap/Form";
import { RegisterBaseProps } from "../../types";


function RegisterBase({formData, onChange, registerErrors = {}}: RegisterBaseProps) {

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
    setErrors(prev => ({
      ...prev, [name]:value.trim() === "" ? "Este campo es obigatorio" : ""
    }));
    onChange(name, value)
  }

  const getError = (fieldName: string) => errors[fieldName] || registerErrors[fieldName] || '';

  return (
    <>
      <Form.Group className="mb-3">
        <Form.Label>Nombre</Form.Label>
        <Form.Control
        //required 
        type="text" 
        name="nombre"
        onChange={handleInputChange}
        value={formData.nombre}
        placeholder="Ingresar Nombre"
        isInvalid={!!getError('nombre')}
        //isValid={formData.nombre.trim() !== "" && !errors.nombre}
        />
        <Form.Control.Feedback type="invalid">
          {getError('nombre')}
          </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Apellidos</Form.Label>
        <Form.Control
          //required
          type="text"
          name="apellidos"
          onChange={handleInputChange}
          value={formData.apellidos} 
          placeholder="Ingresar Apellidos"
          isInvalid={!!getError('apellidos')}
          //isValid={formData.apellidos.trim() !== "" && !errors.apellidos}
          />
          <Form.Control.Feedback type="invalid">
          {getError('apellidos')}
          </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>DNI</Form.Label>
        <Form.Control
          //required
          type="text"
          name="dni"
          onChange={handleInputChange}
          value={formData.dni}
          placeholder="Ingresar número de DNI"
          isInvalid={!!getError('dni')}
          //isValid={formData.dni.trim() !== "" && !errors.dni}
          />
          <Form.Control.Feedback type="invalid">
          {getError('dni')}
          </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Centro Médico</Form.Label>
        <Form.Control
          //required
          type="text"
          name="centro_medico"
          onChange={handleInputChange}
          value={formData.centro_medico}
          placeholder="Ingresar Centro Médico"
          isInvalid={!!getError('centro_medico')}
          //isValid={formData.centro_medico.trim() !== "" && !errors.centro_medico}
          />
          <Form.Control.Feedback type="invalid">
          {getError('centro_medico')}
          </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Label>Correo Electrónico</Form.Label>
        <Form.Control
          //required
          type="email"
          name="email"
          onChange={handleInputChange}
          value={formData.email}
          placeholder="Ingresar Correo Electrónico"
          isInvalid={!!getError('email')}
          //isValid={formData.email.trim() !== "" && !errors.email}
          />
          <Form.Control.Feedback type="invalid">
          {getError('email')}
          </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3" controlId="formBasicPassword">
        <Form.Label>Contraseña</Form.Label>
        <Form.Control
          //required
          type="password"
          name="contrasena"
          onChange={handleInputChange}
          value={formData.contrasena}
          placeholder="Ingresar Contraseña"
          isInvalid={!!getError('contrasena')}
          //isValid={formData.contrasena.trim() !== "" && !errors.contrasena}
          />
          <Form.Control.Feedback type="invalid">
          {getError('contrasena')}
          </Form.Control.Feedback>
      </Form.Group>
    </>
  );
}

export default RegisterBase;
