import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import style from "./AfasiaTests.module.css";
import { useState, useEffect, useRef} from "react";
import { useParams } from "react-router-dom";
import { TestData, TestDescriptions, TestResult } from '../../types';
import {useSessionContext} from "../../context/sessionContext";
import { startSessionInstance, getPredefinedTestData, getRandomTestData, getCurrentTestDescriptions } from "../../services/api";


function AfasiaTests() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [sessionInstanceId, setSessionInstanceId] = useState<number | null>(null);
  const [isTestCompleted, setIsTestCompleted] = useState<boolean>(false);
  const {session, loading, error, fetchSession} = useSessionContext();
  const [loadingTest, setLoadingTest] = useState<boolean>(false)
  const [currentTest, setCurrentTest] = useState<number>(1);
  const [testWordData, setTestWordData] = useState<TestData[]>([]);
  const [currentTestData, setCurrentTestData] = useState<TestData | null>(null)
  const [descriptionData, setDescriptionData] = useState<TestDescriptions | null>(null);
  const totalOfDescriptions = 6;
  const [visibleDescriptions, setVisibleDescriptions] = useState<boolean[]>(Array(totalOfDescriptions).fill(false));
  const [testTime, setTestTime] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [testResults, setTestResults] = useState<TestResult[]>([]);

const sessionInstanceStartedRef = useRef(false);

// *********************** UseEffects ***************************************

  useEffect(() => {
    
    if(session && session.id_sesion.toString() === sessionId){
      console.log('datos de la sesion', session)
      return;
    }
    // ************ EN CASE DE RELOAD DE LA PAGINA ************
    if(!session && sessionId){
      resetTestsData();
      const id = parseInt(sessionId, 10);
      if(!isNaN(id)){
        fetchSession(id);
        console.log('datos de la sesion', session)
      }
    }
  }, [session, sessionId, fetchSession]);

  useEffect(()=>{
    if(!session || sessionInstanceId) return;
    if(sessionInstanceStartedRef.current) return
    sessionInstanceStartedRef.current = true;
    startInstanceOfSession(session.id_sesion);
    
    return
  },[session, sessionInstanceId])

  useEffect(() => {
    if (!session) return;
    if (testWordData.length > 0) return
    const loadTestData = async () => {
      try{
        setLoadingTest(true)
        console.log(`Cargando los datos de la primera prueba para la sesion: ${sessionId}`);
        let response: TestData[];
        if(!session?.imagenes_aleatorias){
          console.log("Las imágenes no son aleatorias para esta sesión.");
          response = await getPredefinedTestData(session.id_sesion);
        }else{
          console.log("Las imágenes son aleatorias para esta sesión.");
          if(sessionInstanceId){
            response = await getRandomTestData(sessionInstanceId, session.cantidad_pruebas, session.nivel);
          }else{
            throw new Error('No se ha iniciado correctamente una nueva instancia de la sesión');
          }
        }
        console.log("Datos de la prueba cargada:", response);
        setTestWordData(response);
      }catch(error){
          throw new Error("Error al cargar los datos de la prueba inicial");
      }finally{
        setLoadingTest(false)
      }
    };
    loadTestData();
  }, [session, sessionId, sessionInstanceId]);

  useEffect(() => {
    if (testWordData.length === 0) return;
    if (currentTest < 1 || currentTest > testWordData.length) return;
    const loadCurrentTestData = async () => {
      try{
        const testData = testWordData[currentTest -1];
        console.log(`datos de la palabra actual ${testData.nombre_palabra}:`, testData)
        if(!testData){
          throw new Error(`No se ha encontrado la pruba ${currentTest}`)
        }
        setCurrentTestData(testData);
        if(testData.id_palabra){
          console.log(`Se buscaran las decripciones de la palabra con ID: ${testData.id_palabra}`)
          const descriptions = await getCurrentTestDescriptions(testData.id_palabra)
          setDescriptionData(descriptions)
          console.log(`descripciones actuales de la palabra ${testData.nombre_palabra}`, descriptions)
        }else{
          throw new Error("Ha habido un error con los datos de la prueba, no ID palabra")
        }
      }catch(error){
        throw new Error(`Error al obtener las respectivas descripciones de la palabra ${currentTestData?.nombre_palabra}`)
      }
    }
    loadCurrentTestData()
    setTestTime(0);
    setVisibleDescriptions(Array(6).fill(false));
    setUserAnswer("");

  },[currentTest, testWordData])

  useEffect(() => {
    if (isTestCompleted || testWordData.length === 0) return;
    const testInterval = setInterval(() => {
      setTestTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(testInterval);
  }, [isTestCompleted, testWordData]);

  useEffect(() => {
    if(!currentTestData || !session) return;
    const totalTimeForDescriptions = session.tiempo_limite_por_prueba / 2;
    const secondsPerDescription = Math.floor(totalTimeForDescriptions / totalOfDescriptions);

    if(testTime > 0 && testTime <= totalTimeForDescriptions && testTime % secondsPerDescription === 0){
      const descriptionIndex = Math.floor(testTime / secondsPerDescription) - 1;
      if(descriptionIndex >= 0 && descriptionIndex < totalOfDescriptions){
        setVisibleDescriptions((prevVisibleDescriptions) => {
          const newVisibleDescriptions = [...prevVisibleDescriptions];
          newVisibleDescriptions[descriptionIndex] = true;
          return newVisibleDescriptions;
        });
      }
    }
  },[testTime, currentTestData, session?.tiempo_limite_por_prueba]);

  useEffect(() => {
    if(!currentTestData || !session){
      return;
    }
    const timeLimit = session.tiempo_limite_por_prueba;
    if(testTime >= timeLimit && !isTestCompleted){
      setTestResults((prevResults) => [
        ...prevResults,
        {palabraObjetivo: currentTestData?.nombre_palabra.trim().toLowerCase() || "", resultado: "fallado", tiempo: testTime}
      ]);
      if(session?.cantidad_pruebas && currentTest < session?.cantidad_pruebas){
        setCurrentTest((prevCurrentTest) => prevCurrentTest + 1);
      }else{
        setIsTestCompleted(true);
      }
    }
  },[testTime, isTestCompleted]);

// *********************** Funciones ***************************************
  const resetTestsData = () => {
    setLoadingTest(false);
    setCurrentTest(1);
    setTestWordData([]);
    setCurrentTestData(null);
    setDescriptionData(null);
    setVisibleDescriptions(Array(totalOfDescriptions).fill(false));
    setTestTime(0);
    setUserAnswer("");
    setTestResults([]);
  }
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const startInstanceOfSession = async (sessionId: number) => {
    try{
      console.log(`Iniciando la sesión de pruebas para la sesión ID: ${sessionId}`);
      const response = await startSessionInstance(sessionId);
      if(response.payload === undefined){
        throw new Error('No se obtuvo el ID de la instancia de sesión');
      }else{
        setSessionInstanceId(response.payload as number);
      }
      console.log("Sesión de pruebas iniciada con ID de instancia:", response.payload);
    }catch(error){
      throw new Error('Error al iniciar la sesión de pruebas');
    }
  }

  const handleUserAnswer = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserAnswer(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(!currentTestData || !session){
      return;
    }
    const userAnswerNormalized = userAnswer.trim().toLowerCase();
    const correctWordNormalized = currentTestData?.nombre_palabra.trim().toLowerCase().trim().toLowerCase();
    if(userAnswerNormalized === correctWordNormalized){
      setTestResults((prevResults) => [
        ...prevResults,
        {palabraObjetivo: correctWordNormalized, resultado: "acertado", tiempo: testTime,},
      ]);
      if(session?.cantidad_pruebas && currentTest < session?.cantidad_pruebas){
        setCurrentTest((prevCurrentTest) => prevCurrentTest + 1);
      }else{
        setIsTestCompleted(true);
      }
      setUserAnswer("");
    }else{
      setUserAnswer("");
    }
  };

// *********************** HTML ***************************************

  if(loading || loadingTest){
    return(
      <div className={style["main-test-container"]}>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h3>Cargando prueba...</h3>
        </div>
      </div>
    )
  }

  if(error || !session){
    return (
      <div className={style["main-test-container"]}>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h3>Error: No se pudieron cargar los datos de la prueba</h3>
        </div>
      </div>
    );
  }

  return (
    <div className={style["main-test-container"]}>
      {/*******************TESTS TIMER*******************/}
      <div className={style["info-test-container"]}>
        <h3>Prueba {currentTest}</h3>
        <h4>Tiempo: {formatTime(testTime)}</h4>
        <div>
          <h4>Resultados:</h4>
          {testResults.length > 0 ? testResults.map((result, index) => (
            <p className={style["result-item"]} key={index}>{result.palabraObjetivo}  - {result.resultado}</p>
          )): 
          <h4>Ninguna palabra completada</h4>}
        </div>
      </div>
      {/*******************TESTS CARDS*******************/}
      <div className={style["test-container"]}>
        <div className={style["test-cards-container"]}>
          <div className={style["image-card-container"]}>
            <img className={style["word-image"]} src={currentTestData?.ruta_imagen as string} />
          </div>

          <div className={`${style["surrounding-card"]} ${style["category-card"]}`}>
            <h4>Categoria</h4>
            {visibleDescriptions[0] && <p>{descriptionData?.categoria}</p>}
          </div>

          <div className={`${style["surrounding-card"]} ${style["use-card"]}`}>
            <h4>Uso</h4>
            {visibleDescriptions[1] && <p>{descriptionData?.uso}</p>}
          </div>

          <div className={`${style["surrounding-card"]} ${style["properties-card"]}`}>
            <h4>Propiedades</h4>
            {visibleDescriptions[2] && <p>{descriptionData?.propiedades}</p>}
          </div>

          <div className={`${style["surrounding-card"]} ${style["association-card"]}`}>
            <h4>Asociación</h4>
            {visibleDescriptions[3] && <p>{descriptionData?.asociacion}</p>}
          </div>

          <div className={`${style["surrounding-card"]} ${style["localization-card"]}`}>
            <h4>Localización</h4>
            {visibleDescriptions[4] && <p>{descriptionData?.localizacion}</p>}
          </div>

          <div className={`${style["surrounding-card"]} ${style["action-card"]}`}>
            <h4>Acción</h4>
            {visibleDescriptions[5] && <p>{descriptionData?.accion}</p>}
          </div>
        </div>

        {/*******************USER ANSWER*******************/}
        <div className={style["test-answer-container"]}>
          <Form className={style["answer-space"]} onSubmit={handleSubmit}>
            <h4>¿Cuál es el nombre del objeto?</h4>
            <Form.Group className="mb-0">
              <Form.Control
                className={style["answer-input"]}
                required
                type="text"
                placeholder="Ingresar nombre del objeto"
                value={userAnswer}
                onChange={handleUserAnswer}
              />
            </Form.Group>
            <Button className={style["answer-button"]} variant="primary" type="submit">
              Responder
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default AfasiaTests;
