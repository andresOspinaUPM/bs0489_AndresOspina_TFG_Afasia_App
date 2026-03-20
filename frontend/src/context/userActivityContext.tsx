import {createContext, useContext, useState, useEffect, ReactNode, useRef} from 'react';
import { useNavigate } from 'react-router-dom';
import { UserActivityContextType } from '../types';

// interface UserActivityContextType {
//   //isActivityMonitoringActiveRef: boolean;
//   showNavigationModal: boolean;
//   activateActivityMonitoring: () => void;
//   deactivateActivityMonitoring: () => void;
//   handleNavigationAttempt: (navigation: () => void) => void;
//   confirmNavigation: () => void;
//   cancelNavigation: () => void;
// }

const UserActivityContext = createContext<UserActivityContextType | null>(null);


export const useUserActivity = () => {
  const context = useContext(UserActivityContext);

  if(!context){
    throw new Error('useActivity debe usarse dentro del UserActivityProvider');
  }
  return context;

}

export const UserActivityProvider = ({children}:{children:ReactNode}) => {
  const isNavigating = useRef(false);
  const [isActivityMonitoringActive, setIsActivityMonitoringActive] = useState<boolean>(false);
  const [showNavigationModal, setShowNavigationModal] = useState<boolean>(false);
  const [pendingNavigation, setPendingNavigation] = useState<(()=> void) | null>(null);
  const navigate = useNavigate();

  const activateActivityMonitoring = () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('ACTIVAR PROTECCIÓN');
    console.log('   Estado antes:', isActivityMonitoringActive);
    setIsActivityMonitoringActive(true);
    //isActivityMonitoringActiveRef.current = true;
    if(isNavigating.current) return;
    console.log('   Estado después: true');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }
    
  const deactivateActivityMonitoring = () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('DESACTIVAR PROTECCIÓN');
    console.log('   Estado antes:', isActivityMonitoringActive);
    setIsActivityMonitoringActive(false);
    //isActivityMonitoringActiveRef.current = false;
    console.log('   Estado después: false');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }

  const handleNavigationAttempt = (navigation: () => void) => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('handleNavigationAttempt');
    console.log('   isActivityMonitoringActive:', isActivityMonitoringActive);
    if (!isActivityMonitoringActive) {
      navigation();
      console.log('   No hay protección - navegar directamente');
      return;
    }
    console.log('   Hay protección - mostrar modal');
    setPendingNavigation(() => navigation);
    setShowNavigationModal(true);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  };
  
  const confirmNavigation = () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('confirmNavigation');
    console.log('   isActivityMonitoringActive antes:', isActivityMonitoringActive);
    setIsActivityMonitoringActive(false);
    //isActivityMonitoringActiveRef.current = false;
    setShowNavigationModal(false);
    console.log('   isActivityMonitoringActive después: false');
    console.log('   Ejecutando navegación...');
    
    if (pendingNavigation) {
      pendingNavigation();
    }
    
    
    setPendingNavigation(null);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  };
  
  const cancelNavigation = () => {
    setShowNavigationModal(false);
    setPendingNavigation(null);
  };

  useEffect(()=>{
    if(!isActivityMonitoringActive) return;

    //Cierre de pagina/pestaña o recarga
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      //@ts-expected-error - aparece como deprecado pero según la informacion aún puede ser necesarios en ciertos navegadores
      e.returnValue = '';
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => window.removeEventListener('beforeunload', handleBeforeUnload);

  },[isActivityMonitoringActive])

  useEffect(() => {
    if(!isActivityMonitoringActive) return;
    
    window.history.pushState(null, '', window.location.href);
    
    const handlePopState = () => {
      if(isNavigating.current) return;
      if(!window.confirm('Si abandonas la prueba se perderá todo el progreso. ¿Seguro desea abandonar la prueba?')){
        window.history.pushState(null, '', window.location.href);
      }else{
        setIsActivityMonitoringActive(false);
        //isActivityMonitoringActiveRef.current = false;
        isNavigating.current = true;
        setTimeout(() => navigate(-1),0);
      }
    }

    window.addEventListener('popstate', handlePopState);

    return () => window.removeEventListener('popstate', handlePopState);

  }, [isActivityMonitoringActive, navigate])

  useEffect(() => {
    if(!isActivityMonitoringActive){
      isNavigating.current = false;
    }
  },[isActivityMonitoringActive])

    return (
    <UserActivityContext.Provider value={{
      //isActivityMonitoringActiveRef,
      showNavigationModal,
      activateActivityMonitoring,
      deactivateActivityMonitoring,
      handleNavigationAttempt,
      confirmNavigation,
      cancelNavigation,
    }}>
      {children}
    </UserActivityContext.Provider>
  );

}