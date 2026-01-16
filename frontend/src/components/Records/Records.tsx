import Table from 'react-bootstrap/Table';
import style from './Records.module.css';
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom'; 
import {isSessionInstanceCompleted, getInstancesSessionRecords} from '../../services/api' 
import { SessionIntanceRecords } from '../../types';

function Records() {

	const isInstanceCompletedChecked = useRef(false);
	const recordsLoaded = useRef(false);
	const {sessionId} = useParams<string>();
	const [existSessionInstance, setExistSessionInstance] = useState<boolean>(false)
	const [sessionIntancesRecords, setSessionIntancesRecords] = useState<SessionIntanceRecords[]>([])

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
				getSessionInstancesRecords();
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

	const getSessionInstancesRecords = async () =>{
		if(recordsLoaded.current) return
		try{
			if(sessionId != undefined) {
				const idSession = parseInt(sessionId);
				const instancesRecords = await getInstancesSessionRecords (idSession)
				if(!instancesRecords){
					console.log('No hay registros de sesiones en la base de datos')
					return
				}
				isInstanceCompletedChecked.current = true;
				setSessionIntancesRecords(instancesRecords);
			}
		}catch(error){
			throw new Error('Error al obtener los registros');
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


	if(!existSessionInstance){
		return (
			<div className={style['main-records-container']}>
				<div style={{ textAlign: 'center', padding: '50px' }}>
					<h3>No se han completado ninguna prueba para esta sesión, por favor complete en primer lugar un sesión antes de ver sus registros</h3>
				</div>
			</div>
		);
	}

	return (
		<div className={style['main-records-container']}>
			<div className={style['table-container']}>
				<h1>Registros pruebas</h1>
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
			</div>
		</div>
	);
}

export default Records;
