import Form from "react-bootstrap/Form";
import { RegisterBaseProps } from "../../types";

// interface RegisterBaseProps {
//   formData: {
//     dni: string;
//     nombre: string;
//     apellidos: string;
//     centro_medico: string;
//     email: string;
//     contrasena: string;
//   };
//   onChange: (name: string, value: string) => void;
// }

function RegisterBase({formData, onChange}: RegisterBaseProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
    onChange(name, value)
  }
  return (
    <>
      <Form.Group className="mb-3">
        <Form.Label>Nombre</Form.Label>
        <Form.Control
        required 
        type="text" 
        name="nombre"
        onChange={handleInputChange}
        value={formData.nombre}
        placeholder="Ingresar Nombre" />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Apellidos</Form.Label>
        <Form.Control
          required
          type="text"
          name="apellidos"
          onChange={handleInputChange}
          value={formData.apellidos} 
          placeholder="Ingresar Apellidos" />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>DNI</Form.Label>
        <Form.Control
          required
          type="text"
          name="dni"
          onChange={handleInputChange}
          value={formData.dni}
          placeholder="Ingresar número de DNI" />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Centro Médico</Form.Label>
        <Form.Control
          required
          type="text"
          name="centro_medico"
          onChange={handleInputChange}
          value={formData.centro_medico}
          placeholder="Ingresar Centro Médico" />
      </Form.Group>

      <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Label>Correo Electrónico</Form.Label>
        <Form.Control
          required
          type="email"
          name="email"
          onChange={handleInputChange}
          value={formData.email}
          placeholder="Ingresar Correo Electrónico" />
      </Form.Group>

      <Form.Group className="mb-3" controlId="formBasicPassword">
        <Form.Label>Contraseña</Form.Label>
        <Form.Control
          required
          type="password"
          name="contrasena"
          onChange={handleInputChange}
          value={formData.contrasena}
          placeholder="Ingresar Contraseña" />
      </Form.Group>
    </>
  );
}

export default RegisterBase;
