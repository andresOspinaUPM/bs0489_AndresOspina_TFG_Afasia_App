import {createContext, useContext, useState, ReactNode} from 'react';
import { getSessionById } from '../services/api';
import {Session, SessionContextType} from '../types';

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useSessionContext = () => {
  const context = useContext(SessionContext);
  if(!context){
    throw new Error ('useSession debe usarse dentro del SessionProvider');
  }
  return context;
}

export const SessionProvider = ({children}: {children: ReactNode}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSession = async (id: number): Promise<void> => {
      try{
      setLoading(true);
      setError(null);

      const data = await getSessionById(id);
      setSession(data);
      console.log('Sesión obtenida:', data);
    }catch(err){
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      setSession(null);
    }finally{
      setLoading(false);
    }
  };

  const cleanSession = () => {
    setSession(null);
    setError(null);
    setLoading(false);
  }

  const value: SessionContextType = {
    session,
    loading,
    error,
    setSession,
    fetchSession,
    cleanSession,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

