import {RefObject} from 'react';

export interface ProtectedRouteProps {
  allowedRole?: 'doctor' | 'paciente'
}

export interface RegisterBaseProps {
  formData: {
    dni: string;
    nombre: string;
    apellidos: string;
    centro_medico: string;
    email: string;
    contrasena: string;
  };
  onChange: (name: string, value: string) => void;
}

interface DefaultUser {
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

export interface PatientData {
	dni: string;
	nombre: string;
	apellidos: string;
}

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

// export interface CurrentTestRun{
//   id_ejecucion_prueba: number;
// }

export interface PatientContextType{
  selectedPatient: PatientData | null;
  setSelectedPatient: (patient: PatientData | null) => void;
  clearSelectedPatient: () => void;
}

export interface Session{
  id_sesion: number;
  nombre_sesion: string;
  nivel: 'Facil' | 'Medio' | 'Dificil';
  cantidad_pruebas: number;
  tiempo_limite_por_prueba: number;
  imagenes_aleatorias: boolean;
}

export interface SessionContextType{
  session: Session | null;
  loading: boolean;
  error: string | null;
  setSession: (session: Session | null) => void;
  fetchSession: (id: number) => Promise<void>;
  cleanSession: () => void;
  sessionInstanceId: number | null,
  sessionInstanceIdRef: RefObject<number | null>;
  setContextSessionInstance: (id: number) => void
}

export interface PredefinedSessionTest{
  id_sesion: number;
  id_palabra: number;
  orden_prueba: number;
}

export interface TestData{
  id_palabra: number;
  nombre_palabra: string;
  ruta_imagen: string | null;
  orden_prueba: number;
}

export interface TestDescriptions{
    categoria: string;
    uso: string;
    propiedades: string;
    asociacion: string;
    localizacion: string;
    accion: string;
}

export interface TestResult{
    palabraObjetivo: string;
    resultado: "acertado" | "fallado";
    tiempo: number;
}

export interface TestResponse{
  id_prueba: number;
  tiempo_respuesta: number;
  respuesta_correcta: boolean;
}

export interface InstancesRecords{
  nombre_palabra: string;
  fecha_respuesta: string;
  tiempo_respuesta: number;
  respuesta_correcta: boolean
}

export interface SessionInstanceRecords{
  id_instancia: number;
  respuestas: InstancesRecords[]
}

export interface UserActivityContextType {
  //isActivityMonitoringActiveRef: boolean;
  showNavigationModal: boolean;
  activateActivityMonitoring: () => void;
  deactivateActivityMonitoring: () => void;
  handleNavigationAttempt: (navigation: () => void) => void;
  confirmNavigation: () => void;
  cancelNavigation: () => void;
}