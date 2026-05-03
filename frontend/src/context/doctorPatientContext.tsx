import {createContext, useContext, useState, ReactNode} from 'react';
import { PatientData, PatientContextType } from '../types';

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const useDoctorPatientContext = () => {
  const context = useContext(PatientContext)
  if(!context){
    console.error('usePatient debe usarse dentro del PatientProvider')
  }
  return context;
}

export const PatientProvider = ({children}: {children:ReactNode}) => {

  const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null);

  const clearSelectedPatient = () => {
    setSelectedPatient(null);
  }

  const value: PatientContextType = {
    selectedPatient,
    setSelectedPatient,
    clearSelectedPatient,
  };

  return(
    <PatientContext.Provider value={value}>
      {children}
    </PatientContext.Provider>
  )
}