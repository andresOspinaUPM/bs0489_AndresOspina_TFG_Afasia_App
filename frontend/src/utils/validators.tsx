import {DefaultUser} from "../types"

const validateDNI = (dni: string): boolean => {
  if(!dni.match(/^[0-9]{8}[A-Za-z]$/)){
      return false;
    }
    const numero = dni.substring(0, 8);
    const letra = dni.substring(8, 9).toUpperCase();
    const letras = 'TRWAGMYFPDXBNJZSQVHLCKE';
    const letraCorrecta = letras.charAt(parseInt(numero, 10) % 23);
    return letra === letraCorrecta;
}

export const validateDate = (date: string): string => {
  if(!date){
    return 'La fecha de nacimiento es obligatoria.';
  }
  
  const dateOfBirth = new Date(date);
  const today = new Date();
  const age = today.getFullYear() - dateOfBirth.getFullYear();
  

  if(isNaN(dateOfBirth.getTime())){
    return 'La fecha de nacimiento no es válida.';
  }

  if(dateOfBirth > today){
    return 'La fecha de nacimiento no puede ser una fecha futura';
  }

  if(age <= 0 || age > 120){
    return 'La fecha de nacimiento no es válida';
  }

  return '';

}

export const validateCommonFields = (data: DefaultUser): Record<string, string> => {
  const errors: Record<string, string> = {};

    if (data.dni !== undefined) {
    if (!data.dni.trim()) {
      errors.dni = 'El DNI es obligatorio y no puede estar vacío';
    } else if (data.dni.trim().length !== 9 || !validateDNI(data.dni.trim())) {
      errors.dni = 'El DNI no es válido';
    }
  }

  if (data.nombre !== undefined) {
    if (!data.nombre.trim()) {
      errors.nombre = 'El nombre es obligatorio y no puede estar vacío';
    } else if (data.nombre.length < 2) {
      errors.nombre = 'El nombre debe tener al menos 2 caracteres';
    }
  }

  if (data.apellidos !== undefined) {
    if (!data.apellidos.trim()) {
      errors.apellidos = 'Los apellidos son obligatorios y no pueden estar vacíos';
    } else if (data.apellidos.length < 2) {
      errors.apellidos = 'Los apellidos deben tener al menos 2 caracteres';
    }
  }

  if (data.centro_medico !== undefined) {
    if (!data.centro_medico.trim()) {
      errors.centro_medico = 'El centro médico es obligatorio y no puede estar vacío';
    } else if (data.centro_medico.length < 5) {
      errors.centro_medico = 'El centro médico debe tener al menos 5 caracteres';
    }
  }

  if (data.email !== undefined) {
    if (!data.email.trim()) {
      errors.email = 'El email es obligatorio y no puede estar vacío';
    } else if (!data.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errors.email = 'El email no es válido';
    }
  }

  if(data.contrasena !== undefined){
    if (!data.contrasena.trim()) {
      errors.contrasena = 'La contraseña es obligatoria y no puede estar vacía';
    } else if (data.contrasena.length < 6) {
      errors.contrasena = 'La contraseña debe tener al menos 6 caracteres';
    }
  }
  return errors;
}