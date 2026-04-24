import { useNavigate, Link } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import style from './Login.module.css';
import { useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import { loginUser } from '../../services/api';
import { validateCommonFields } from '../../utils/validators';

function Login() {
	const [registerErrors, setRegisterErrors] = useState<Record<string, string>>({});
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);

	const[formData, setFormData] = useState({
			email: '',
			contrasena: '',
		});

	const cleanData = (data: typeof formData)=>{
    return{
      email: data.email.trim().toLowerCase(),
      contrasena: data.contrasena.trim(),
    }
  }

	const validateData = (data: ReturnType<typeof cleanData>) =>{
		return validateCommonFields({
			email: data.email,
			contrasena: data.contrasena

		});
  }

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const {name, value} = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if(registerErrors[name]){
      setRegisterErrors(prev => ({...prev, [name]: ''}))
    }
  };

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const cleanedData = cleanData(formData);
		const validationErrors = validateData(cleanedData);
		
		if(Object.keys(validationErrors).length > 0){
			setRegisterErrors(validationErrors);
			setLoading(false);
			return;
		}
		setRegisterErrors({});
		setLoading(true);
		try {
			
			const response = await loginUser({ email: cleanedData.email, password: cleanedData.contrasena });

			if (response.user_rol === 'doctor') {
				navigate('/doctor/inicio');
				window.location.reload();
			} else if (response.user_rol === 'paciente') {
				navigate('/paciente/inicio');
				window.location.reload();
			} else {
				setRegisterErrors({ general:'Rol de usuario desconocido.' });
			}
		} catch (err: unknown) {
			if (err instanceof Error) {
				setRegisterErrors( {general: err.message || 'Error al iniciar sesión'});
			} else {
				setRegisterErrors({general: 'Error al iniciar sesión'});
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<section className={style['main-container']}>
			<div className={style['form-container']}>
				<h1>Iniciar Sesión</h1>

				{registerErrors.general && <Alert variant="danger">{registerErrors.general}</Alert>}

				<Form noValidate className={style['form']} onSubmit={handleSubmit}>
					<Form.Group className="mb-3" controlId="formBasicEmail">
						<Form.Label>Correo Electrónico</Form.Label>
						<Form.Control
							type="email"
							name="email"
							placeholder="Ingresar Correo Electrónico"
							value={formData.email}
							onChange={handleInputChange}
							disabled={loading}
							isInvalid={!!registerErrors.email}
						/>
						<Form.Control.Feedback type="invalid">
							{registerErrors.email}
						</Form.Control.Feedback>
					</Form.Group>

					<Form.Group className="mb-3" controlId="formBasicPassword">
						<Form.Label>Contraseña</Form.Label>
						<Form.Control
							type="password"
							name="contrasena"
							placeholder="Ingresar Contraseña"
							value={formData.contrasena}
							onChange={handleInputChange}
							disabled={loading}
							isInvalid={!!registerErrors.contrasena}
						/>
						<Form.Control.Feedback type="invalid">
							{registerErrors.contrasena}
						</Form.Control.Feedback>
					</Form.Group>

					<Button className={style['form-button']} variant="primary" type="submit" disabled={loading}>
						{loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
					</Button>
					<p className={style['form-redirection-text']}>
						¿No tienes cuenta?&nbsp;
						<Link to="/registrar">Registrate</Link>
					</p>
				</Form>
			</div>
		</section>
	);
}

export default Login;
