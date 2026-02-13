import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useUserActivity} from '../../context/userActivityContext';
import { useSessionContext } from '../../context/sessionContext';
import {removeSessionInstance} from '../../services/api';

const NavigationalModal = () => {
  const {showNavigationModal, confirmNavigation, cancelNavigation} = useUserActivity();
  const{sessionInstanceId} = useSessionContext();

  const handleUserleaves = async() => {
    try{
      if(sessionInstanceId !== null) await removeSessionInstance(sessionInstanceId);
    }catch(error){
      console.log('error al eliminar la instancia de sesion con id: '+ sessionInstanceId + 'por abandono')
    }finally{
      confirmNavigation();
    }
  }

  return(
    <Modal 
    show={showNavigationModal}
    onHide = {cancelNavigation}
    keyboard={false}
    backdrop="static"
    centered
    >
      <Modal.Header>
        <Modal.Title>¿Seguro deseas abandonar la prueba?</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h4>Si abandonas la prueba se perderá todo el progreso</h4>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={cancelNavigation}>Continuar Prueba</Button>
        <Button variant="danger" onClick={() => handleUserleaves()}>Abandonar Prueba</Button>
      </Modal.Footer>
    </Modal>
  )

}

export default NavigationalModal;