import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import style from './Records.module.css';
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom'; 
import {isSessionInstanceCompleted, getInstancesSessionRecords, getAnsweredWords, getRecordsByWord} from '../../services/api' 
import { SessionInstanceRecords } from '../../types';

// type ContentType = 'doctor' | 'patient';

function Records() {

	const isInstanceCompletedChecked = useRef(false);
	const recordsLoaded = useRef(false);
	const answeredWordsLoaded = useRef(false);
	const {sessionId} = useParams<string>();
	const [existSessionInstance, setExistSessionInstance] = useState<boolean>(false);
	const [sessionIntancesRecords, setSessionIntancesRecords] = useState<SessionInstanceRecords[]>([]);
	const [answeredWords, setAnsweredWords] = useState<string[]>([]);
	const [showRecordsPerWord, setShowRecordsPerWord] = useState<boolean>(false);
	const [selectedWord, setSelectedword] = useState<string>('');
	const [sessionRecordsByWord, setSessionRecordsByWord] = useState<SessionInstanceRecords[]>([]);

	useEffect(()=>{
		setExistSessionInstance(false);
	},[])

	useEffect(()=>{
		const hasInstanceCompleted = async (sessionId: number) => {
			if(isInstanceCompletedChecked.current) return
			try{
				console.log(`Se intenta saber si existe una instancia completada para la sesion ${sessionId}`)
				const isSessionInstCompleted = await isSessionInstanceCompleted(sessionId);
				if(!isSessionInstCompleted.success){
					console.log('No hay instancias completadas para la sesion', sessionId);
					return
				}
				console.log(`Existe al menos una instancia completada para la sesion ${sessionId}`)
				isInstanceCompletedChecked.current = true;
				setExistSessionInstance(true);
				await Promise.all([
					getSessionInstancesRecords(sessionId),
					getWordsAnswered(sessionId)
				]);
			}catch(error){
				console.log("Error al obtener si se ha completado al menos una instancia de la sesion", error);
				return
			}
		}
		if(sessionId != undefined) {
			const idSession = parseInt(sessionId);
			hasInstanceCompleted(idSession);
		}	
	},[sessionId])

	const getSessionInstancesRecords = async (sessionId: number) =>{
		if(recordsLoaded.current) return
		try{
				const instancesRecords = await getInstancesSessionRecords (sessionId)
				if(!instancesRecords){
					console.log('No hay registros de sesiones en la base de datos')
					return
				}
				setSessionIntancesRecords(instancesRecords);
				recordsLoaded.current = true;
		}catch(error){
			console.log(`Error al obtener los registros: ${error}`);
		}
	}

	const getWordsAnswered = async(sessionId: number) => {
		if(answeredWordsLoaded.current) return;
		try{
			const words = await getAnsweredWords(sessionId);
			setAnsweredWords(words);
			answeredWordsLoaded.current = true;
			console.log(`Palabras obtenidas: ${words.length}: `, words);
			console.log(`${answeredWords}`);
		}catch(error){
			console.log(`No se pudieron obtener las palabras respondidas para la session ${sessionId}: ${error}`);
		}
	}

	const formatDate = (date: string): string =>{
		return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
	}

	const formatTime = (seconds: number): string => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
	};

	const handleSelectedWord = async(word: string) => {
		try{
			if(sessionId){
				const idSession = parseInt(sessionId)
				const recordsByWord = await getRecordsByWord(idSession, word);
				setSessionRecordsByWord(recordsByWord);
				setSelectedword(word);
				setShowRecordsPerWord(true);
			}
		}catch(error){
			console.log(`No se pudieron obtener los registros de la palabra seleccionada: ${error}`);
		}
	}

	const handleChangeToViewAllRecords = () => {
		setShowRecordsPerWord(false)
		setSelectedword('');
	}

	if(!existSessionInstance){
		return (
			<div className={style['main-records-container']}>
				<div className={style['table-container']}>
					<br/>
					<h5>No se ha completado ninguna prueba para esta sesión, por favor complete en primer lugar una sesión antes de ver sus registros.</h5>
				</div>
			</div>
		);
	}

	return (
		<div className={style['main-records-container']}>
			<div className={style['table-container']}>
				<h1>Registros pruebas</h1>
				<div className={style['table-buttons']}>
					<Button variant="primary" onClick={() => {handleChangeToViewAllRecords()}} >Ver registros por intento</Button>
					<DropdownButton id="dropdown-basic-button" title={selectedWord == '' ? 'Filtrar registros por palabra' : `Registros filtrados por: ${selectedWord}`}>
						{answeredWords.length > 0 ? (
							answeredWords.map((word, index) => (
								<Dropdown.Item key={index} onClick={() => {handleSelectedWord(word)}}>{word}</Dropdown.Item>
							))
						) : (
						<Dropdown.Item href="">No hay palabras respondidas</Dropdown.Item>
					)}						
					</DropdownButton>
				</div>
				{!showRecordsPerWord ? (			
					<Table striped className={style['records-table']}>
						<thead>
							<tr>
								<th>Intento</th>
								<th>Palabra</th>
								<th>Fecha</th>
								<th>Tiempo Respuesta</th>
								<th>Resultado</th>
							</tr>
						</thead>
						<tbody>
							{sessionIntancesRecords.map((instance, instanceIndex)=>
							instance.respuestas.map((respuesta, index) => (
								<tr key={`${instance.id_instancia}-${index}`}>
									<td>Intento {instanceIndex +1}</td>
									<td>{respuesta.nombre_palabra}</td>
									<td>{formatDate(respuesta.fecha_respuesta)}</td>
									<td>{formatTime(respuesta.tiempo_respuesta)}</td>
									<td>{respuesta.respuesta_correcta ? 'Palabra Acertada' : 'Palabra Fallada'}</td>
								</tr>
							)))}
						</tbody>
					</Table>
					) : (
					<Table striped className={style['records-table']}>
						<thead>
							<tr>
							
								<th>Palabra</th>
								<th>Fecha</th>
								<th>Tiempo Respuesta</th>
								<th>Resultado</th>
							</tr>
						</thead>
						<tbody>
							{sessionRecordsByWord.map((instance, instanceIndex)=>
							instance.respuestas.map((respuesta, index) => (
								<tr key={`${instance.id_instancia}-${instanceIndex}-${index}`}>

									<td>{respuesta.nombre_palabra}</td>
									<td>{formatDate(respuesta.fecha_respuesta)}</td>
									<td>{formatTime(respuesta.tiempo_respuesta)}</td>
									<td>{respuesta.respuesta_correcta ? 'Palabra Acertada' : 'Palabra Fallada'}</td>
								</tr>
							)))}
						</tbody>
					</Table>
					)}
				</div>
			</div>
		);
}

export default Records;
