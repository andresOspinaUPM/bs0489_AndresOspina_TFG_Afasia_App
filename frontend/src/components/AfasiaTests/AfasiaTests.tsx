// import Button from "react-bootstrap/Button";
// import Form from "react-bootstrap/Form";
// import style from "./AfasiaTests.module.css";
import { useState, useEffect, useRef } from "react";
// import { AfasiaTestSession, AfasiaTestPrueba, AfasiaPalabra, AfasiaTestDescription, AfasiaTestResult } from "../../types";
// import {getAfasiaSessionData, getAfasiaTestData, getAfasiaWordData, getAfasiaTestDescriptions} from "../../services/api";

function AfasiaTests() {
  const [idSession, setIdSession] = useState<number | null>(null);
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [areRandomTestsGenerated, setAreRandomTestsGenerated] = useState<boolean>(false);

  return(
    <div>
      <h2>Afasia Tests Component</h2>
      
    </div>
  )  // const totalOfDescriptions = 6;
  // const [sessionData, setSessionData] = useState<AfasiaTestSession | null>(null);
  // const [testData, setTestData] = useState<AfasiaTestPrueba | null>(null);
  // const [totalTestTime, setTotalTestTime] = useState<number>(0);
  // const [wordData, setWordData] = useState<AfasiaPalabra | null>(null);
  // const [descriptionData, setDescriptionData] = useState<AfasiaTestDescription | null>(null);
  // const [testResults, setTestResults] = useState<AfasiaTestResult[]>([]);
  // const [visibleDescriptions, setVisibleDescriptions] = useState<boolean[]>(Array(totalOfDescriptions).fill(false));
  // const [currentTest, setCurrentTest] = useState<number>(0);
  // const [testTime, setTestTime] = useState<number>(0);
  // const [isTestRunning, setIsTestRunning] = useState<boolean>(false);
  // const [userAnswer, setUserAnswer] = useState<string>("");
  // const [loadingTest, setLoadingTest] = useState<boolean>(true);
  // const [allTestsData, setAllTestsData] = useState<AfasiaTestPrueba[]>([]);
  
  // const hasProcessedTimeoutRef = useRef<boolean>(false);
  // const currentTestRef = useRef<number>(currentTest);



  // useEffect(() => {
  //   const LoadInitialSessionData = async () =>{
  //     try {
  //       setLoadingTest(true);
  //       setTestResults([]);
  //       const sessionResponse = (await getAfasiaSessionData());
  //       setSessionData(sessionResponse);
  //       console.log("Session Data:", sessionResponse);
  //       const afasiaTestResponse = (await getAfasiaTestData(sessionResponse.id_sesion));
  //       setAllTestsData(afasiaTestResponse);
  //       setTestData(afasiaTestResponse[0]);
  //       console.log("Test Data:", afasiaTestResponse);
        
  //       const currentWordData = await getAfasiaWordData(afasiaTestResponse[0].id_palabra);
  //       setWordData(currentWordData);
  //       const currentDescriptionData = await getAfasiaTestDescriptions(afasiaTestResponse[0].id_palabra);
  //       setDescriptionData(currentDescriptionData);

  //       setCurrentTest(1);
  //       setIsTestRunning(true);
  //     } catch (error: unknown) {
  //       if (error instanceof Error) {
  //         console.error("Error al cargarr los datos de la prueba", error);
  //       } else {
  //         console.error("Error al cargarr los datos de la prueba", String(error));
  //       }
  //     }finally{
  //       setLoadingTest(false);
  //     }
  //   }
  //   LoadInitialSessionData();
  // }, []);

  // useEffect(()=>{
  //   const LoadCurrentTestData = async () =>{
  //     try {
  //       setLoadingTest(true);
  //       const currentTestData = allTestsData[currentTest - 1];
  //       setTestData(currentTestData);
  //       console.log("Current Test Data:", currentTestData);
        
  //       const currentWordData = await getAfasiaWordData(currentTestData.id_palabra);
  //       setWordData(currentWordData);
  //       const currentDescriptionData = await getAfasiaTestDescriptions(currentTestData.id_palabra);
  //       setDescriptionData(currentDescriptionData);
  //     } catch (error: unknown) {
  //       if (error instanceof Error) {
  //         console.error("Error al cargar los datos de la prueba actual", error);
  //       } else {
  //         console.error("Error al cargar los datos de la prueba actual", String(error));
  //       }
  //     }finally{
  //       setLoadingTest(false);
  //     }
  //   }
  //   LoadCurrentTestData();
  // },[currentTest, allTestsData])

  // useEffect(() => {
  //   currentTestRef.current = currentTest;
  // }, [currentTest]);

  // useEffect(() => {
  //   let testInterval: number | null = null;
  //   if(isTestRunning){
  //     testInterval = setInterval(() => {
  //       setTestTime((prevTestTime) => prevTestTime + 1);
  //     }, 1000) as number;
  //   }
  //   return () => {
  //     if(testInterval !== null){
  //       clearInterval(testInterval);
  //     }
  //   }
  // }, [isTestRunning]);

  // useEffect(() =>{
  //   hasProcessedTimeoutRef.current = false;
  //   setTestTime(0);
  //   setVisibleDescriptions(Array(6).fill(false));
  // },[currentTest])

  // useEffect(() =>{
  //   if(!testData || !sessionData){
  //     return;
  //   }
  //   setTotalTestTime(testData?.tiempo_limite_por_prueba || 2);
  // }, [testData, sessionData]);

  // useEffect(() => {
  //   if(!testData || totalTestTime === 0){
  //     return;
  //   }
  //   const totalTimeForDescriptions = (totalTestTime / 2) * 60;
  //   const secondsPerDescription = Math.floor(totalTimeForDescriptions / totalOfDescriptions);

  //   if(testTime > 0 && testTime <= totalTimeForDescriptions && testTime % secondsPerDescription === 0){
  //     const descriptionIndex = Math.floor(testTime / secondsPerDescription) - 1;
  //     if(descriptionIndex >= 0 && descriptionIndex < totalOfDescriptions){
  //       setVisibleDescriptions((prevVisibleDescriptions) => {
  //         const newVisibleDescriptions = [...prevVisibleDescriptions];
  //         newVisibleDescriptions[descriptionIndex] = true;
  //         return newVisibleDescriptions;
  //       });
  //     }
  //   }
  // },[testTime, testData, totalTestTime]);

  // useEffect(() => {
  //   if(!wordData || !sessionData|| totalTestTime === 0){
  //     return;
  //   }
  //   const timeLimit = totalTestTime * 60;
  //   if(testTime === timeLimit && isTestRunning && !hasProcessedTimeoutRef.current){
  //     hasProcessedTimeoutRef.current = true;
  //     setTestResults((prevResults) => [
  //       ...prevResults,
  //       {palabraObjetivo: wordData?.nombre_palabra.trim().toLowerCase() || "", resultado: "fallado", tiempo: testTime}
  //     ]);
  //     if(sessionData?.cantidad_pruebas && currentTestRef.current < sessionData?.cantidad_pruebas){
  //       setCurrentTest((prevCurrentTest) => prevCurrentTest + 1);
  //     }else{
  //       setIsTestRunning(false);
  //     }
  //   }
  // },[testTime, isTestRunning]);

  // useEffect(() => {
  //   if (!isTestRunning) {
  //     console.log("Resultados finales:", testResults);
  //   }
  // }, [testResults, isTestRunning]);

  // const formatTime = (seconds: number): string => {
  //   const minutes = Math.floor(seconds / 60);
  //   const remainingSeconds = seconds % 60;
  //   return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  // };

  // const handleUserAnswer = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setUserAnswer(e.target.value);
  // };

  // const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   if(!wordData || !sessionData){
  //     return;
  //   }
  //   const userAnswerNormalized = userAnswer.trim().toLowerCase();
  //   const correctWordNormalized = wordData?.nombre_palabra.trim().toLowerCase().trim().toLowerCase();
  //   if(userAnswerNormalized === correctWordNormalized){
  //     hasProcessedTimeoutRef.current = true;
  //     setTestResults((prevResults) => [
  //       ...prevResults,
  //       {palabraObjetivo: correctWordNormalized, resultado: "acertado", tiempo: testTime,},
  //     ]);
  //     if(sessionData?.cantidad_pruebas && currentTest < sessionData?.cantidad_pruebas){
  //       setCurrentTest((prevCurrentTest) => prevCurrentTest + 1);
  //     }else{
  //       setIsTestRunning(false);
  //     }
  //     setUserAnswer("");
  //   }else{
  //     setUserAnswer("");
  //   }
  // };

  // if(loadingTest){
  //   return(
  //     <div className={style["main-test-container"]}>
  //       <div style={{ textAlign: 'center', padding: '50px' }}>
  //         <h3>Cargando prueba...</h3>
  //       </div>
  //     </div>
  //   )
  // }

  // if (!sessionData || !testData || !wordData || !descriptionData) {
  //   return (
  //     <div className={style["main-test-container"]}>
  //       <div style={{ textAlign: 'center', padding: '50px' }}>
  //         <h3>Error: No se pudieron cargar los datos de la prueba</h3>
  //       </div>
  //     </div>
  //   );
  // }

//   return (
//     <div className={style["main-test-container"]}>
//       {/*******************TESTS TIMER*******************/}
//       <div className={style["info-test-container"]}>
//         <h3>Prueba {currentTest}</h3>
//         <h4>Tiempo: {formatTime(testTime)}</h4>
//         <div>
//           <h4>Resultados:</h4>
//           {testResults.length > 0 ? testResults.map((result, index) => (
//             <p className={style["result-item"]} key={index}>{result.palabraObjetivo}  - {result.resultado}</p>
//           )): 
//           <h4>Ninguna palabra completada</h4>}
//         </div>
//       </div>
//       {/*******************TESTS CARDS*******************/}
//       <div className={style["test-container"]}>
//         <div className={style["test-cards-container"]}>
//           <div className={style["image-card-container"]}>
//             <img className={style["word-image"]} src={wordData?.ruta_imagen} />
//           </div>

//           <div className={`${style["surrounding-card"]} ${style["category-card"]}`}>
//             <h4>Categoria</h4>
//             {visibleDescriptions[0] && <p>{descriptionData?.categoria}</p>}
//           </div>

//           <div className={`${style["surrounding-card"]} ${style["use-card"]}`}>
//             <h4>Uso</h4>
//             {visibleDescriptions[1] && <p>{descriptionData?.uso}</p>}
//           </div>

//           <div className={`${style["surrounding-card"]} ${style["properties-card"]}`}>
//             <h4>Propiedades</h4>
//             {visibleDescriptions[2] && <p>{descriptionData?.propiedades}</p>}
//           </div>

//           <div className={`${style["surrounding-card"]} ${style["association-card"]}`}>
//             <h4>Asociación</h4>
//             {visibleDescriptions[3] && <p>{descriptionData?.asociacion}</p>}
//           </div>

//           <div className={`${style["surrounding-card"]} ${style["localization-card"]}`}>
//             <h4>Localización</h4>
//             {visibleDescriptions[4] && <p>{descriptionData?.localizacion}</p>}
//           </div>

//           <div className={`${style["surrounding-card"]} ${style["action-card"]}`}>
//             <h4>Acción</h4>
//             {visibleDescriptions[5] && <p>{descriptionData?.accion}</p>}
//           </div>
//         </div>

//         {/*******************USER ANSWER*******************/}
//         <div className={style["test-answer-container"]}>
//           <Form className={style["answer-space"]} onSubmit={handleSubmit}>
//             <h4>¿Cuál es el nombre del objeto?</h4>
//             <Form.Group className="mb-0">
//               <Form.Control
//                 className={style["answer-input"]}
//                 required
//                 type="text"
//                 placeholder="Ingresar nombre del objeto"
//                 value={userAnswer}
//                 onChange={handleUserAnswer}
//               />
//             </Form.Group>
//             <Button className={style["answer-button"]} variant="primary" type="submit">
//               Responder
//             </Button>
//           </Form>
//         </div>
//       </div>
//     </div>
//   );
}

export default AfasiaTests;
