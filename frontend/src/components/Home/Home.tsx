import style from './Home.module.css';

function Home() {
	return (
		<div className={style['main-container']}>
			<div className={style['home-container']}>
				<h1>Ejercicios de rehabilitación de pacientes con Afasia</h1>
				<br />
				<p>
					Se incluirán ejercicios interactivos adaptativos que estimulen la comprensión y expresión lingüística, así
					como la memoria y concentración, factores clave para la recuperación, ajustandose al progreso individual del
					paciente, facilitando el seguimiento y optimización del tratamiento, en busca mejorar la calidad de vida de
					los pacientes y ampliar el acceso a recursos de rehabilitación desde cualquier entorno.
				</p>
			</div>
		</div>
	);
}

export default Home;
