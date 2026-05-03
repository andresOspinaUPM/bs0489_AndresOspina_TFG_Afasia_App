import {createContext, useContext, useState, useEffect, ReactNode, useRef} from 'react';
import { useNavigate } from 'react-router-dom';
import { UserActivityContextType } from '../types';

const UserActivityContext = createContext<UserActivityContextType | null>(null);


export const useUserActivity = () => {
  const context = useContext(UserActivityContext);

  if(!context){
    throw new Error('useUserActivity debe usarse dentro del UserActivityProvider');
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
    setIsActivityMonitoringActive(true);
  }
    
  const deactivateActivityMonitoring = () => {
    setIsActivityMonitoringActive(false);
  }

  const handleNavigationAttempt = (navigation: () => void) => {
    if (!isActivityMonitoringActive) {
      navigation();
      return;
    }
    setPendingNavigation(() => navigation);
    setShowNavigationModal(true);
  };
  
  const confirmNavigation = () => {
    setIsActivityMonitoringActive(false);
    setShowNavigationModal(false);
    
    if (pendingNavigation) {
      pendingNavigation();
    }
    
    
    setPendingNavigation(null);
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