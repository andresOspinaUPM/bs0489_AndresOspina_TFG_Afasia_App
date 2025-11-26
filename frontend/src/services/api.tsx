import axios from 'axios';
import { AfasiaTestSession, AfasiaTestPrueba, AfasiaPalabra, AfasiaTestDescription } from '../types';

const API_BASE_URL = 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface DefaultUser{
    dni: string;
    nombre: string;
    apellidos: string;
    centro_medico: string;
    email: string;
    contrasena: string;
}

export interface RegisterPatient extends DefaultUser{
    sexo: string;
    fecha_nacimiento: string;
}

export interface MedicoRegistro extends DefaultUser{}

export interface ApiResponse<responseData = unknown>{
    success: boolean;
    message: string;
    data?: responseData;
}

export interface LoginData{
    email: string;
    password: string;
}

export interface LoginResponse{
    success: boolean;
    message: string;
    access_token: string;
    token_type: string;
    user_rol: string;
    name: string;
}

export interface UserResponse{
        dni: string;
        nombre: string;
        apellidos: string;
        email: string;
        centro_medico: string;
}

export interface DoctorList{
    dni: string;
    nombre: string;
    apellidos: string;
}

export interface PatientsList{
    dni: string;
    nombre: string;
    apellidos: string;
}

export interface AfasiaTestConfig{
    dni_paciente: string;
    nivel: string;
    cantidad_pruebas: number;
    tiempo_limite_por_prueba: number;
    imagenes_aleatorias: boolean;
}

export type UserResponseData = ApiResponse<UserResponse>;

export type DoctorListResponse = ApiResponse<DoctorList[]>;

export type PatientsListResponse = ApiResponse<PatientsList[]>;

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
}

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
}

export const loginUser = async (loginData: LoginData): Promise<LoginResponse> => {
    try{
        const response = await api.post<LoginResponse>('/auth/login', loginData);
        if(!response.data.success){
            throw new Error(response.data.message||'Error al inicair la sesión')
        }

        if(response.data.success){
            localStorage.setItem('access_token',response.data.access_token);
            localStorage.setItem('token_type',response.data.token_type);
            localStorage.setItem('user_rol',response.data.user_rol);
            localStorage.setItem('name',response.data.name);
        }

        return response.data;
    }catch(error){
        if(axios.isAxiosError(error)&&error.response){
            throw new Error(error.response.data.message||'Error al iniciar la sesión');
        }
        throw new Error('Error de conexión al iniciar la sesión');
    }
}

export const getUserName = (): string | null => {
    return localStorage.getItem('name');
}

export const getUserRol = (): string | null => {
    return localStorage.getItem('user_rol');
}

export const isUserAuthenticated = (): boolean =>{
    const token = localStorage.getItem('access_token');
    return token !== null;
}

export const logoutUsuario = (): void => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_type');
    localStorage.removeItem('user_rol');
}

export const getToken = (): string | null => {
    return localStorage.getItem('access_token');
}

api.interceptors.request.use(
    (config) => {
        const token = getToken();
        if(token){
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
)

export const getDoctorList = async (): Promise<DoctorList[]>=>{
    try{
        const response = await api.get<DoctorListResponse>('/doctor/list');
        if(!response.data.success){
            throw new Error(response.data.message || 'Error al obtener la lista de doctores')
        }
        return response.data.data || [];
    }catch(error){
        if(axios.isAxiosError(error) && error.response){
            throw new Error(error.response.data.message || 'Error al obtener la lista de doctores');
        }
        throw new Error('Error de conexión al obtener la lista de doctores');
    }
}

export const getPatientsListPerDoctor = async(): Promise<PatientsList[]>=>{
    try{
        const token = localStorage.getItem('access_token');
        if(!token){
            throw new Error ('Usuario no autenticado');
        }
        const response = await api.get<PatientsListResponse>(
            `/doctor/listOfPatients`,
            {
                headers:{
                    'Authorization': `Bearer ${token}`,
                }
            }
        )
        if(!response.data.success){
            throw new Error(response.data.message || 'Error al obtener la lista de pacientes')
        }
        return response.data.data || [];
    }catch(error){
        if(axios.isAxiosError(error) && error.response){ 
            throw new Error(error.response.data.message || 'Error al obtener la lista de pacientes');
        }
        throw new Error('Error de conexión al obtener la lista de pacientes');
    }
}

export const configureAfasiaSessions = async (configData: AfasiaTestConfig): Promise<ApiResponse> =>{
    try{
        console.log("Datos enviados para configurar sesiones:" + JSON.stringify(configData))
        const response = await api.post<ApiResponse>('configuration-sessions/configure', configData);
        if(!response.data.success){
           throw new Error(response.data.message || 'Error al configurar las sesiones de afasia') 
        }
        return response.data;
    }catch(error){
        if(axios.isAxiosError(error) && error.response){
            throw new Error(error.response.data.message || 'Error al configurar las sesiones de afasia');
        }
        throw new Error('Error de conexión al configurar las sesiones de afasia');
    }
}

export const getAfasiaSessionData = async() : Promise<AfasiaTestSession> =>{
    try{
        const response = await api.get<ApiResponse<AfasiaTestSession[]>>('/afasiatests/sesiones');
        if(!response.data.success){
            throw new Error(response.data.message || 'Error al obtener los datos de la sesión de afasia');
        }
        if(!response.data.data || response.data.data.length === 0){
            throw new Error('No se encontraron datos de la sesión de afasia');
        }
        return response.data.data[0];
    }catch(error){
        if(axios.isAxiosError(error) && error.response){
            throw new Error(error.response.data.message || 'Error al obtener los datos de la sesión de afasia');
        }
        throw new Error('Error de conexión al obtener los datos de la sesión de afasia');
    }
};

export const getAfasiaTestData = async(id_sesion: number): Promise<AfasiaTestPrueba[]> =>{
    try{
        const response = await api.get<ApiResponse<AfasiaTestPrueba[]>>(`/afasiatests/pruebas/${id_sesion}`);
        if(!response.data.success){
            throw new Error(response.data.message || 'Error al obtener los datos de las pruebas de afasia');
        }
        if(!response.data.data){
            throw new Error('No se encontraron datos de las pruebas de afasia');
        }
        return response.data.data;
    }catch(error){
        if(axios.isAxiosError(error) && error.response){
            throw new Error(error.response.data.message || 'Error al obtener los datos de las pruebas de afasia');
        }
        throw new Error('Error de conexión al obtener los datos de las pruebas de afasia');
    }   
}

export const getAfasiaWordData = async(id_palabra: number): Promise<AfasiaPalabra> =>{
    try{
        const response = await api.get<ApiResponse<AfasiaPalabra>>(`/afasiatests/palabra/${id_palabra}`);
        if(!response.data.success){
            throw new Error(response.data.message || 'Error al obtener los datos de la palabra de afasia');
        }
        if(!response.data.data){
            throw new Error('No se encontraron datos de la palabra de afasia');
        }
        return response.data.data;
    }catch(error){
        if(axios.isAxiosError(error) && error.response){
            throw new Error(error.response.data.message || 'Error al obtener los datos de la palabra de afasia');
        }
        throw new Error('Error de conexión al obtener los datos de la palabra de afasia');
    }   
}

export const getAfasiaTestDescriptions = async(id_palabra: number): Promise<AfasiaTestDescription> =>{
    try{
        const response = await api.get<ApiResponse<AfasiaTestDescription>>(`/afasiatests/descripciones/${id_palabra}`);
        if(!response.data.success){
            throw new Error(response.data.message || 'Error al obtener las descripciones de afasia');
        }
        if(!response.data.data){
            throw new Error('No se encontraron descripciones de afasia');
        }
        return response.data.data;
    }catch(error){
        if(axios.isAxiosError(error) && error.response){
            throw new Error(error.response.data.message || 'Error al obtener las descripciones de afasia');
        }
        throw new Error('Error de conexión al obtener las descripciones de afasia');
    }   
}