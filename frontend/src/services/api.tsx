import axios from 'axios';
import { TestData, TestDescriptions, TestResponse, SessionIntanceRecords } from '../types';

const API_BASE_URL = 'http://localhost:8000';

export const api = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		'Content-Type': 'application/json',
	},
});

export interface DefaultUser {
	dni: string;
	nombre: string;
	apellidos: string;
	centro_medico: string;
	email: string;
	contrasena: string;
}

export interface RegisterPatient extends DefaultUser {
	sexo: string;
	fecha_nacimiento: string;
}

export interface MedicoRegistro extends DefaultUser {}

export interface ApiResponse<responseData = unknown> {
	success: boolean;
	message: string;
	payload?: responseData;
}

export interface LoginData {
	email: string;
	password: string;
}

export interface LoginResponse {
	success: boolean;
	message: string;
	access_token: string;
	token_type: string;
	user_rol: string;
	name: string;
}

export interface UserResponse {
	dni: string;
	nombre: string;
	apellidos: string;
	email: string;
	centro_medico: string;
}

export interface DoctorList {
	dni: string;
	nombre: string;
	apellidos: string;
}

//esta interfaz se ha puesto en afasiaInterfaces
//ToDo: ver en donde se ha utilizado a parte de este api y modificar (refactorizar)
export interface PatientsList { 
	dni: string;
	nombre: string;
	apellidos: string;
}

export interface AfasiaTestConfig {
	dni_paciente: string;
	nivel: string;
	cantidad_pruebas: number;
	tiempo_limite_por_prueba: number;
	imagenes_aleatorias: boolean;
}

export interface PatientSessions {
	id_sesion: number;
	nombre_sesion: string;
	nivel: 'Facil' | 'Medio' | 'Dificil';
	cantidad_pruebas: number;
	tiempo_limite_por_prueba: number;
	imagenes_aleatorias: boolean;
}

export interface CurrentTestRun{
	id_ejecucion_prueba: number;
}

export type SessionsListResponse = ApiResponse<PatientSessions[]>;

export type UserResponseData = ApiResponse<UserResponse>;

export type DoctorListResponse = ApiResponse<DoctorList[]>;

export type PatientsListResponse = ApiResponse<PatientsList[]>;

export type CurrentTestRunResponse = ApiResponse<CurrentTestRun>;

api.interceptors.request.use(
	(config) => {
		const token = getToken();
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

export const registerPatient = async (patientData: RegisterPatient): Promise<UserResponseData> => {
	try {
		const response = await api.post<UserResponseData>('/paciente/registro', patientData);

		if (!response.data.success) {
			throw new Error(response.data.message || 'Error al registrar paciente');
		}

		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data.message || 'Error al registrar paciente');
		}
		throw new Error('Error al registrar paciente');
	}
};

export const registerDoctor = async (medicoData: MedicoRegistro): Promise<UserResponseData> => {
	try {
		const response = await api.post<UserResponseData>('/doctor/registro', medicoData);

		if (!response.data.success) {
			throw new Error(response.data.message || 'Error al registrar médico');
		}

		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			if (error.response.status === 422 && error.response.data.detail) {
				const details = error.response.data.detail;

				if (typeof details === 'string') {
					throw new Error(details);
				}
			}
			throw new Error(error.response.data.message || 'Error al registrar médico');
		}
		throw new Error('Error al registrar médico');
	}
};

export const loginUser = async (loginData: LoginData): Promise<LoginResponse> => {
	try {
		const response = await api.post<LoginResponse>('/auth/login', loginData);
		if (!response.data.success) {
			throw new Error(response.data.message || 'Error al inicair la sesión');
		}

		if (response.data.success) {
			localStorage.setItem('access_token', response.data.access_token);
			localStorage.setItem('token_type', response.data.token_type);
			localStorage.setItem('user_rol', response.data.user_rol);
			localStorage.setItem('name', response.data.name);
		}

		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data.message || 'Usuario o contraseña incorrectos');
		}
		throw new Error('Usuario o contraseña incorrectos');
	}
};

export const getUserName = (): string | null => {
	return localStorage.getItem('name');
};

export const getUserRol = (): string | null => {
	return localStorage.getItem('user_rol');
};

export const isUserAuthenticated = (): boolean => {
	const token = localStorage.getItem('access_token');
	return token !== null;
};

export const logoutUsuario = (): void => {
	localStorage.removeItem('access_token');
	localStorage.removeItem('token_type');
	localStorage.removeItem('user_rol');
};

export const getToken = (): string | null => {
	return localStorage.getItem('access_token');
};

export const getDoctorList = async (): Promise<DoctorList[]> => {
	try {
		const response = await api.get<DoctorListResponse>('/doctor/list');
		if (!response.data.success) {
			throw new Error(response.data.message || 'Error al obtener la lista de doctores');
		}
		return response.data.payload || [];
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data.message || 'Error al obtener la lista de doctores');
		}
		throw new Error('Error de conexión al obtener la lista de doctores');
	}
};

export const getPatientsListPerDoctor = async (): Promise<PatientsList[]> => {
	try {
		const token = localStorage.getItem('access_token');
		console.log('Token obtenido para lista de pacientes por doctor: ' + token);
		if (!token) {
			throw new Error('Usuario no autenticado');
		}
		const response = await api.get<PatientsListResponse>(`/doctor/listOfPatients`);
		if (!response.data.success) {
			throw new Error(response.data.message || 'Error al obtener la lista de pacientes');
		}
		return response.data.payload || [];
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data.message || 'Error al obtener la lista de pacientes');
		}
		throw new Error('Error de conexión al obtener la lista de pacientes');
	}
};

export const getTotalOfWords = async (): Promise<number> => {
	try {
		const response = await api.get<ApiResponse>('configuration-sessions/total-words');
		if (!response.data.success) {
			throw new Error(response.data.message || 'Error al obtener el total de palabras');
		}
		if (typeof response.data.payload !== 'number') {
			throw new Error('Datos inválidos al obtener el total de palabras');
		}
		return response.data.payload;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data.message || 'Error al obtener el total de palabras');
		}
		throw new Error('Error de conexión al obtener el total de palabras');
	}
};

export const configureAfasiaSessions = async (configData: AfasiaTestConfig): Promise<ApiResponse> => {
	try {
		console.log('Datos enviados para configurar sesiones:' + JSON.stringify(configData));
		const response = await api.post<ApiResponse>('configuration-sessions/configure', configData);
		if (!response.data.success) {
			throw new Error(response.data.message || 'Error al configurar las sesiones de afasia');
		}
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data.message || 'Error al configurar las sesiones de afasia');
		}
		throw new Error('Error de conexión al configurar las sesiones de afasia');
	}
};

export const getSessionsListPerPatient = async (dniPaciente ?:string): Promise<PatientSessions[]> => {
	try {
		const requestBody = dniPaciente ? { patient_dni: dniPaciente } : {};
		const response = await api.post<SessionsListResponse>('/afasia-tests-sessions/patient-sessions-list', requestBody);
		if (!response.data.success) {
			throw new Error(response.data.message || 'Error al obtener la lista de sesiones del paciente');
		}
		return response.data.payload || [];
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data.message || 'Error al obtener la lista de sesiones del paciente');
		}
		throw new Error('Error de conexión al obtener la lista de sesiones del paciente');
	}
};

export const getSessionById = async (id_sesion: number): Promise<PatientSessions> => {
	try {
		const response = await api.get<ApiResponse<PatientSessions>>(`/afasia-tests-sessions/session/${id_sesion}`);
		if (!response.data.success) {
			throw new Error(response.data.message || 'Error al obtener la sesión del paciente');
		}
		if (!response.data.payload) {
			throw new Error('No se encontraron datos de la sesión del paciente');
		}
		return response.data.payload;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			if (error.response.data.detail?.includes('autenticación')) {
				logoutUsuario();
				window.location.href = '/login';
			}
			throw new Error(error.response.data.message || 'Error al obtener la sesión del paciente');
		}
		throw new Error('Error de conexión al obtener la sesión del paciente');
	}
};

export const startSessionInstance = async (id_sesion: number): Promise<ApiResponse> => {
	try {
		const response = await api.post<ApiResponse<number>>(`/afasia-tests/start-session-instance/${id_sesion}`);
		if (!response.data.success) {
			throw new Error(response.data.message || 'Error al iniciar la instancia de sesión');
		}
		if (response.data.payload === undefined) {
			throw new Error('No se obtuvo el ID de la instancia de sesión');
		}
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data.message || 'Error al iniciar la instancia de sesión');
		}
		throw new Error('Error de conexión al iniciar la instancia de sesión');
	}
};

export const getPredefinedTestData = async (id_sesion: number): Promise<TestData[]> => {
	try {
		const response = await api.get<ApiResponse<TestData[]>>(`/afasia-tests/test-data/${id_sesion}`);
		if (!response.data.success) {
			throw new Error(response.data.message || 'Error al obtener los datos de la prueba predefinida');
		}
		if (!response.data.payload) {
			throw new Error('No se encontraron datos de la prueba predefinida');
		}
		return response.data.payload;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data.message || 'Error al obtener los datos de la prueba predefinida');
		}
		throw new Error('Error de conexión al obtener los datos de la prueba predefinida');
	}
};

export const getRandomTestData = async (
	id_session_instance: number,
	total_tests: number,
	nivel: string
): Promise<TestData[]> => {
	try {
		const response = await api.get<ApiResponse<TestData[]>>(
			`/afasia-tests/random-test-data/${id_session_instance}/${total_tests}/${nivel}`
		);
		if (!response.data.success) {
			throw new Error(response.data.message || 'Error al obtener los datos de la prueba aleatoria');
		}
		if (!response.data.payload) {
			throw new Error('No se encontraron datos de la prueba aleatoria');
		}
		return response.data.payload;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data.message || 'Error al obtener los datos de la prueba aleatoria');
		}
		throw new Error('Error de conexión al obtener los datos de la prueba aleatoria');
	}
};

export const getCurrentTestDescriptions = async (id_palabra: number): Promise<TestDescriptions> => {
	try {
		const response = await api.get<ApiResponse<TestDescriptions>>(`/afasia-tests/descriptions/${id_palabra}`);
		if (!response.data.success) {
			throw new Error(response.data.message || 'Error al obtener las descripciones de afasia');
		}
		if (!response.data.payload) {
			throw new Error('No se encontraron descripciones de afasia');
		}
		return response.data.payload;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data.message || 'Error al obtener las descripciones de afasia');
		}
		throw new Error('Error de conexión al obtener las descripciones de afasia');
	}
};

export const saveCurrentTestRun = async (id_instance: number, id_word: number): Promise<number> => {
	try{
		const response = await api.post<ApiResponse>(`/afasia-tests/save-current-test-run/${id_instance}/${id_word}`)
		if(!response.data.success){
			throw new Error(response.data.message || 'Error al guardar el registro de la ejecucion del test actual')
		}
		if(typeof response.data.payload !== 'number'){
			throw new Error('No se puedo obtener el id de la ajecución de la prueba actual')
		}
		return response.data.payload
	}catch(error){
		if(axios.isAxiosError(error) && error.response){
			throw new Error(error.response.data.message || 'Error al guardar el registro de la ejecucion del test actual')
		}
		throw error
	}
}

export const saveTestResponse = async(test_response: TestResponse): Promise<ApiResponse> => {
	try{
		const response = await api.post<ApiResponse>('/afasia-tests/save-response/',test_response)
		if(!response.data.success){
			throw new Error(response.data.message || 'Error al guardar la respuesta de la prueba')
		}
		return response.data;
	}catch (error){
		if(axios.isAxiosError(error) && error.response){
			throw new Error(error.response.data.message || 'Error al guardar la respuesta')
		}
		throw error
	}
}

export const saveInstanceSessionAsCompleted = async(id_session_instance: number): Promise<ApiResponse> => {
	try{
		const response = await api.post<ApiResponse>(`/afasia-tests/set-session-completed/${id_session_instance}`)
		if(!response.data.success){
			throw new Error(response.data.message || "Error al marcar la instancia de la sesion como completada")
		}
		return response.data;
	}catch(error){
		if(axios.isAxiosError(error) && error.response){
			throw new Error(error.response.data.message || 'Error al ingresar instancia como completada')
		}
		throw error
	}
}


export const isSessionInstanceCompleted = async(sessionId: number): Promise<ApiResponse> => {
	try{
		const response = await api.get<ApiResponse>(`/afasia-test-records/session-instance-completed/${sessionId}`)
		if(!response.data.success){
			throw new Error(response.data.message || "Error al obtener instancia de sesion completada")
		}
		return response.data
	}catch(error){
		if(axios.isAxiosError(error) && error.response){
			throw new Error(error.response.data.detail || "Error al obtener instancia de sesion completada")
		}
		throw error
	}
}

export const getInstancesSessionRecords = async(sessionId: number): Promise<SessionIntanceRecords[]> => {
	try{
		const response = await api.get<ApiResponse<SessionIntanceRecords[]>>(`/afasia-test-records/get-instances-records/${sessionId}`)
		if(!response.data.success){
			throw new Error(response.data.message || "Error al obtener los registros de la sesion")
		}
		if(!response.data.payload){
			throw new Error('No se encontraron los registros de las instancias de sesión')
		}
		return response.data.payload
	}catch(error){
		if(axios.isAxiosError(error) && error.response){
			throw new Error(error.response.data.detail || "Error al obtener los registros de las intancias de la sesion")
		}
		throw error
	}
}

export const removeSessionInstance = async(sessionInstanceId: number): Promise<ApiResponse> => {
	try{
		const response = await api.delete<ApiResponse>(`/afasia-tests/remove-session-instance/${sessionInstanceId}`)
		if(!response.data){
			throw new Error("Respuesta vacía del servidor");
		}		
		if(!response.data.success){
			throw new Error(response.data.message || `Error al aliminar la instancia de sesion con id: ${sessionInstanceId}`)
		}
		return response.data
	}catch(error){
		if(axios.isAxiosError(error) && error.response){
			throw new Error(error.response.data.detail || "Error al aliminar la instancia de sesion")
		}
		throw error
	}
}

export const GetAnsweredWords = async(sessionIntanceId: number): Promise<string[]> => {
	try{
		const response = await api.get<ApiResponse<string[]>>(`/get-answered-words/${sessionIntanceId}`);
		if(!response.data.success){
			throw new Error("Error al obtener las palabras guardadas");
		}
		if(!response.data.payload){
			throw new Error('Error, No hay palabras respondidas');
		}
		return response.data.payload;
	}catch(error){
		if(axios.isAxiosError(error) && error.response){
			throw new Error(error.response.data.detail || "Error al obtener las palabras respondidas");
		}
		throw Error;
	}
}