import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import style from './AfasiaTests.module.css';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TestData, TestDescriptions, TestResult, TestResponse } from '../../types';
import { useSessionContext } from '../../context/sessionContext';
import { useUserActivity } from '../../context/userActivityContext';
import {
	startSessionInstance,
	getPredefinedTestData,
	getRandomTestData,
	saveCurrentTestRun,
	getCurrentTestDescriptions,
	saveTestResponse,
	saveInstanceSessionAsCompleted,
	removeSessionInstance
} from '../../services/api';
import { formatTime, capitalize } from '../../utils/format';

function AfasiaTests() {
	const { sessionId } = useParams<{ sessionId: string }>();
	const navigate = useNavigate();
	const totalOfDescriptions = 6;
	const{
		activateActivityMonitoring,
		deactivateActivityMonitoring,
		showNavigationModal,
	} = useUserActivity()

// ********** States *********
	const [sessionInstanceId, setSessionInstanceId] = useState<number | null>(null);
	const [isTestCompleted, setIsTestCompleted] = useState<boolean>(false);
	const { session, loading, error, fetchSession, setContextSessionInstance, sessionInstanceIdRef } = useSessionContext();
	const [loadingTest, setLoadingTest] = useState<boolean>(false);
	const [currentTest, setCurrentTest] = useState<number>(1);
	const [testWordData, setTestWordData] = useState<TestData[]>([]);
	const [currentTestData, setCurrentTestData] = useState<TestData | null>(null);
	const [descriptionData, setDescriptionData] = useState<TestDescriptions | null>(null);
	const [visibleDescriptions, setVisibleDescriptions] = useState<boolean[]>(Array(totalOfDescriptions).fill(false));
	const [testTime, setTestTime] = useState<number>(0);
	const [userAnswer, setUserAnswer] = useState<string>('');
	const [testResults, setTestResults] = useState<TestResult[]>([]);
	const [showModal, setShowModal] = useState(false);
	const [startError, setStartError] = useState<boolean>(false);

// ********** Refs *********
	const loadTestsRef = useRef(false);
	const currentTestRef = useRef(0);
	const currentTestRunRef = useRef(0);
	const isTestResponseRef = useRef(false);
	const testResponseRef = useRef<TestResponse | null>(null)
	const sessionInstanceStartedRef = useRef(false);
	const initialLoadRef = useRef(false);
	const testReadyRef = useRef(false);
	const isTestCompletedRef = useRef(false);

	// *********************** UseEffects ***************************************

	const memFetchSession = useCallback((id: number) => {
		fetchSession(id);
	}, []);

	useEffect(() => {
		return ()=> {
			if(!isTestCompletedRef.current && sessionInstanceIdRef.current !== null){
				removeSessionInstance(sessionInstanceIdRef.current)
			} 
		}
	},[])

	useEffect(() => {
		activateActivityMonitoring();
		return() => {
			deactivateActivityMonitoring()
		}
	},[])

	useEffect(() => {
		if (initialLoadRef.current) return;

		if (session && session.id_sesion.toString() === sessionId) {
			initialLoadRef.current = true;
			return;
		}
		// ************ EN CASE DE RELOAD DE LA PAGINA ************
		if (!session && sessionId) {
			resetTestsData();
			const id = parseInt(sessionId, 10);
			if (!isNaN(id)) {
				initialLoadRef.current = true;
				resetTestsData();
				memFetchSession(id);
			}
		}
	}, [session, sessionId, memFetchSession]);

	useEffect(() => {
		if (!session) return;
		if (sessionInstanceId) return;
		if (sessionInstanceStartedRef.current) return;
		sessionInstanceStartedRef.current = true;
		startInstanceOfSession(session.id_sesion);
	}, [session, sessionInstanceId]);

	useEffect(() => {
		if (!session) return;
		if (testWordData.length > 0) return;
		if(session.imagenes_aleatorias && !sessionInstanceId){
			return;
		}
		if(loadTestsRef.current){
			return
		}
		const loadTestData = async () => {
			try {
				loadTestsRef.current = true;
				setLoadingTest(true);
				let response: TestData[];
				if (!session.imagenes_aleatorias) {
					response = await getPredefinedTestData(session.id_sesion);
				} else {
					response = await getRandomTestData(sessionInstanceId as number, session.cantidad_pruebas, session.nivel);
				}
				setTestWordData(response);
			} catch (error) {
				console.error('Error al cargar los datos de la prueba inicial');
			} finally {
				setLoadingTest(false);
			}
		};
		loadTestData();
	}, [session, sessionId, sessionInstanceId, testWordData.length]);

	useEffect(() => {
		if (testWordData.length === 0) return;
		if (currentTest < 1 || currentTest > testWordData.length) return;
		if (!sessionInstanceId) return;
		if(currentTestRef.current === currentTest){
			return
		}
		isTestResponseRef.current = false;
		currentTestRef.current = currentTest;
		const loadCurrentTestData = async () => {
			try {
				testReadyRef.current = false;
				const testData = testWordData[currentTest - 1];
				if (!testData) {
					return;
				}
				setCurrentTestData(testData);
				if (testData.id_palabra) {
					currentTestRunRef.current = await saveCurrentTestRun(sessionInstanceId as number, testData.id_palabra)
					if(!currentTestRunRef.current){
						console.error(`Error al guardar el registro de la prueba actual`);
						return;
					}
					const descriptions = await getCurrentTestDescriptions(testData.id_palabra);
					setDescriptionData(descriptions);
				}
				setTestTime(0);
				setVisibleDescriptions(Array(6).fill(false));
				setUserAnswer('');
			} catch (error) {
				console.error(
					`Error al obtener las respectivas descripciones de la palabra ${currentTestData?.nombre_palabra}`
				);
			}finally{
				testReadyRef.current = true;
			}
		};
		loadCurrentTestData();
	}, [currentTest, testWordData.length, sessionInstanceId]);

	useEffect(() => {
		if (isTestCompleted || showNavigationModal ) return;
		const testInterval = setInterval(() => {
			if(testReadyRef.current) {
				setTestTime((prev) => prev + 1);
			}
		}, 1000);

		return () => {
			clearInterval(testInterval);
		}
	}, [isTestCompleted, showNavigationModal]);

	useEffect(() => {
		setTestTime(0);
		isTestResponseRef.current = false;
}, [currentTest]);

	useEffect(() => {
		if (!currentTestData || !session) return;
		const totalTimeForDescriptions = session.tiempo_limite_por_prueba / 2;
		const secondsPerDescription = Math.floor(totalTimeForDescriptions / totalOfDescriptions);
		const timeInSecondHalf = testTime - totalTimeForDescriptions;

		if (timeInSecondHalf >= 0 && timeInSecondHalf % secondsPerDescription === 0 ) {
			const descriptionIndex = Math.floor(timeInSecondHalf / secondsPerDescription);
			if (descriptionIndex >= 0 && descriptionIndex < totalOfDescriptions) {
				setVisibleDescriptions((prevVisibleDescriptions) => {
					const newVisibleDescriptions = [...prevVisibleDescriptions];
					newVisibleDescriptions[descriptionIndex] = true;
					return newVisibleDescriptions;
				});
			}
		}
	}, [testTime, currentTestData, session, session?.tiempo_limite_por_prueba]);

	useEffect(() => {
		if(isTestResponseRef.current) return;
		if (!currentTestData || !session) return;
		const timeLimit = session.tiempo_limite_por_prueba;
		if (testTime >= timeLimit && !isTestCompleted && !isTestResponseRef.current) {
			const handleTimeout = async() =>{
				try {
					isTestResponseRef.current = true;
					setTestResults((prevResults) => [
						...prevResults,
						{
							palabraObjetivo: currentTestData?.nombre_palabra.trim().toLowerCase() || '',
							resultado: 'Fallado',
							tiempo: testTime,
						},
					]);
					testResponseRef.current = {
						id_prueba: currentTestRunRef.current,
						tiempo_respuesta: testTime,
						respuesta_correcta: false
					};
					await saveResponse(testResponseRef.current)
					if (session?.cantidad_pruebas && currentTestRef.current < session?.cantidad_pruebas) {
						setCurrentTest((prevCurrentTest) => prevCurrentTest + 1);
					} else {
						if (sessionInstanceId != null){
							await saveSessionInstanceAsCompleted(sessionInstanceId)
						}
						deactivateActivityMonitoring();
						setIsTestCompleted(true);
						isTestCompletedRef.current = true;
						setShowModal(true);
					}
				}catch(error){
					console.error(`Error en el timeout de la prueba ${error}`)
					if (session?.cantidad_pruebas && currentTestRef.current < session.cantidad_pruebas) {
            setCurrentTest(prev => prev + 1);
					} else {
							deactivateActivityMonitoring();
							setIsTestCompleted(true);
							isTestCompletedRef.current = true;
							setShowModal(true);
					}
				}
			}
			handleTimeout();
		}
	}, [testTime, isTestCompleted, session]);

	// *********************** Funciones ***************************************

	const resetTestsData = () => {
		setLoadingTest(false);
		setCurrentTest(1);
		setTestWordData([]);
		setCurrentTestData(null);
		setDescriptionData(null);
		setVisibleDescriptions(Array(totalOfDescriptions).fill(false));
		setTestTime(0);
		setUserAnswer('');
		setTestResults([]);
	};

	const startInstanceOfSession = async (sessionId: number) => {
		try {
			const response = await startSessionInstance(sessionId);
			if (response.payload === undefined) {
				setStartError(true);
			} else {
				setSessionInstanceId(response.payload as number);
				setContextSessionInstance(response.payload as number);
			}
		} catch (error) {
			sessionInstanceStartedRef.current = false;
			setStartError(true);
		}
	};

	const saveResponse = async (saveCurrentTestResponse: TestResponse) =>{
		try{
			const response = await saveTestResponse(saveCurrentTestResponse);
			if(!response.success){
				console.error('ha habido un error al guardar la respuesta de la prueba actual')
			}
		}catch(error){
			console.error('Error al guardar la respuesta de la prueba', error)
		}
	}

	const saveSessionInstanceAsCompleted = async(sessionInstanceId: number) => {
		try{
			const response = await saveInstanceSessionAsCompleted(sessionInstanceId)
			if(!response.success){
				console.error('Error al guardas la sesion como completada')
			}
		}catch(error){
			console.error('Error al marcar la instancia de la session como completada', error);
		}
	}

	const handleUserAnswer = (e: React.ChangeEvent<HTMLInputElement>) => {
		setUserAnswer(e.target.value);
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!currentTestData || !session) {
			return;
		}
		const userAnswerNormalized = userAnswer.trim().toLowerCase();
		const correctWordNormalized = currentTestData?.nombre_palabra.trim().toLowerCase();
		if (userAnswerNormalized === correctWordNormalized) {
			setTestResults((prevResults) => [
				...prevResults,
				{ palabraObjetivo: correctWordNormalized, resultado: 'Acertado', tiempo: testTime },
			]);
			isTestResponseRef.current = true;
			testResponseRef. current = {
				id_prueba: currentTestRunRef.current,
				tiempo_respuesta: testTime,
				respuesta_correcta: true
			};
			await saveResponse(testResponseRef.current)
			if (session?.cantidad_pruebas && currentTest < session?.cantidad_pruebas) {
				setCurrentTest((prevCurrentTest) => prevCurrentTest + 1);
			} else {
				if (sessionInstanceId != null){
					try{

						await saveSessionInstanceAsCompleted(sessionInstanceId)
						deactivateActivityMonitoring();
						setIsTestCompleted(true);
						isTestCompletedRef.current = true;
						setShowModal(true);
					}catch(error){
						console.error('No se pudo marcar la sesion como completada: ', error);
						alert('Error al guardar los datos')
					}
				}
			}
			setUserAnswer('');
		} else {
			setUserAnswer('');
		}
	};

	const handleCloseModal = () => {
			deactivateActivityMonitoring();
			setShowModal(false);
			navigate('/paciente/sesiones-pruebas');
	}

	// *********************** HTML ***************************************

	if (loading || loadingTest) {
		return (
			<div className={style['main-test-container']}>
				<div style={{ textAlign: 'center', padding: '50px' }}>
					<h3>Cargando prueba...</h3>
				</div>
			</div>
		);
	}

	if (error || !session) {
		return (
			<div className={style['main-test-container']}>
				<div style={{ textAlign: 'center', padding: '50px' }}>
					<h3>Error: No se pudieron cargar los datos de la prueba</h3>
				</div>
			</div>
		);
	}

	if (startError) {
		return (
			<div className={style['main-test-container']}>
				<div style={{ textAlign: 'center', padding: '50px' }}>
					<h3>No se pudo iniciar esta prueba</h3>
					<p>Puede que la sesión indicada ya no esté disponible para tu usuario.</p>
					<Button variant="primary" onClick={() => navigate('/paciente/sesiones-pruebas')}>
						Volver a mis pruebas
					</Button>
				</div>
			</div>
		);
	}

	if(isTestCompleted){
		return(
			<div className={style['main-test-container']}>
				<Modal show={showModal} onHide={() => {handleCloseModal()}} backdrop="static" centered>
					<Modal.Header>
						<Modal.Title>Se ha completado la sesión exitosamente</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<h4>Has completado la sesión con los siguientes resultados</h4>
						<br/>
						<Table striped>
							<thead>
								<tr>
									<th>Palabra</th>
									<th>Tiempo</th>
									<th>Resultado</th>
								</tr>
							</thead>
							<tbody>
								{
								testResults.map((result, index) => (
									<tr key= {`${index}`}>
										<td>{capitalize(result.palabraObjetivo)}</td>
										<td>{formatTime(result.tiempo)}</td>
										<td>{result.resultado}</td>
									</tr>
								))
								}
							</tbody>
						</Table>
					</Modal.Body>
					<Modal.Footer>
						<Button variant='primary' onClick={() => {handleCloseModal()}}>Cerrar</Button>
					</Modal.Footer>
				</Modal>
			</div>
		)
	}

	return (
		<div className={style['main-test-container']}>
			{/*******************TESTS TIMER*******************/}
			<div className={style['info-test-container']}>
				<h3>Prueba {currentTest}</h3>
				<h4>Tiempo: {formatTime(testTime)}</h4>
				<div>
					<h4>Resultados:</h4>
					{testResults.length > 0 ? (
						testResults.map((result, index) => (
							<p className={style['result-item']} key={index}>
								{capitalize(result.palabraObjetivo)} - {result.resultado}
							</p>
						))
					) : (
						<h4>Ninguna palabra completada</h4>
					)}
				</div>
			</div>
			{/*******************TESTS CARDS*******************/}
			<div className={style['test-container']}>
				<div className={style['test-cards-container']}>
				{currentTestData?.ruta_imagen
				?<div className={style['image-card-container']}>
						<img alt="Imagen-palabra" className={style['word-image']} src={currentTestData?.ruta_imagen as string} />
					</div>
					:
					<div className={style['image-card-container']}>
						<span className={style['word-image']} style={{display: 'block'}}>
							{currentTestData?.nombre_palabra}
						</span>
					</div>
				}
					<div className={`${style['surrounding-card']} ${style['category-card']}`}>
						<h4>Categoria - ¿Es un tipo de...?
						</h4>
						{visibleDescriptions[0] && <p>{descriptionData?.categoria}</p>}
					</div>

					<div className={`${style['surrounding-card']} ${style['use-card']}`}>
						<h4>Uso - ¿Cómo se usa?
						</h4>
						{visibleDescriptions[1] && <p>{descriptionData?.uso}</p>}
					</div>

					<div className={`${style['surrounding-card']} ${style['properties-card']}`}>
						<h4>Propiedades - ¿Cómo es?</h4>
						{visibleDescriptions[2] && <p>{descriptionData?.propiedades}</p>}
					</div>

					<div className={`${style['surrounding-card']} ${style['association-card']}`}>
						<h4>Asociación - ¿Con qué lo puedo asociar?</h4>
						{visibleDescriptions[3] && <p>{descriptionData?.asociacion}</p>}
					</div>

					<div className={`${style['surrounding-card']} ${style['localization-card']}`}>
						<h4>Localización - ¿Dónde se encuentra?</h4>
						{visibleDescriptions[4] && <p>{descriptionData?.localizacion}</p>}
					</div>

					<div className={`${style['surrounding-card']} ${style['action-card']}`}>
						<h4>Acción - ¿Qué hace?</h4>
						{visibleDescriptions[5] && <p>{descriptionData?.accion}</p>}
					</div>
				</div>

				{/*******************USER ANSWER*******************/}
				<div className={style['test-answer-container']}>
					<Form className={style['answer-space']} onSubmit={handleSubmit}>
						<h4>¿Cuál es el nombre del objeto?</h4>
						<Form.Group className="mb-0">
							<Form.Control
								className={style['answer-input']}
								required
								type="text"
								placeholder="Ingresar nombre del objeto"
								value={userAnswer}
								onChange={handleUserAnswer}
							/>
						</Form.Group>
						<Button className={style['answer-button']} variant="primary" type="submit">
							Responder
						</Button>
					</Form>
				</div>
			</div>
		</div>
	);
}

export default AfasiaTests;
