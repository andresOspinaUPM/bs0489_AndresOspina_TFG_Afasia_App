export interface AfasiaTestSession{
    id_sesion: number;
    nivel: string;
    cantidad_pruebas: number;
}

export interface AfasiaTestPrueba{
    id_prueba: number;
    id_palabra: number;
    tiempo_limite_por_prueba: number;
}

export interface AfasiaPalabra{
    nombre_palabra: string;
    ruta_imagen: string;
}

export interface AfasiaTestDescription{
    categoria: string;
    uso: string;
    propiedades: string;
    asociacion: string;
    localizacion: string;
    accion: string;
}

export interface AfasiaTestResult{
    palabraObjetivo: string;
    resultado: "acertado" | "fallado";
    tiempo: number;
}   