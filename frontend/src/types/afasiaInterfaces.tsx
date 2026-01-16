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

export interface SessionIntanceRecords{
  id_instancia: number;
  respuestas: InstancesRecords[]
}