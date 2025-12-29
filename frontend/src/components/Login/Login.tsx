import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { Link } from 'react-router-dom';
import style from './Login.module.css';
import { useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import { loginUser } from '../../services/api';

function Login() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setLoading(true);
		try {
			const response = await loginUser({ email, password });

			if (response.user_rol === 'doctor') {
				navigate('/doctor/inicio');
				window.location.reload();
			} else if (response.user_rol === 'paciente') {
				navigate('/paciente/inicio');
				window.location.reload();
			} else {
				setError('Rol de usuario desconocido.');
			}
		} catch (err: unknown) {
			if (err instanceof Error) {
				setError(err.message || 'Error al iniciar sesión');
			} else {
				setError('Error al iniciar sesión');
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<section className={style['main-container']}>
			<div className={style['form-container']}>
				<h1>Iniciar Sesión</h1>

				{error && <Alert variant="danger">{error}</Alert>}

				<Form className={style['form']} onSubmit={handleSubmit}>
					<Form.Group className="mb-3" controlId="formBasicEmail">
						<Form.Label>Correo Electrónico</Form.Label>
						<Form.Control
							required
							type="email"
							placeholder="Ingresar Correo Electrónico"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							disabled={loading}
						/>
					</Form.Group>

					<Form.Group className="mb-3" controlId="formBasicPassword">
						<Form.Label>Contraseña</Form.Label>
						<Form.Control
							required
							type="password"
							placeholder="Ingresar Contraseña"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							disabled={loading}
						/>
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
