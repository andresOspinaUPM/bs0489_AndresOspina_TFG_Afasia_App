import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Image from "react-bootstrap/Image";
import style from "./NavegationBar.module.css";
import icons from "../../assets/icons";
import {logoutUsuario, getUserName} from '../../services/api';


function NavigationBarPatient() {
    const patientName = getUserName();
    const navigate = useNavigate();
    const handleLogout = () => {
      logoutUsuario();
      navigate("/inicio");
      window.location.reload();
    }
  return (
    <Navbar collapseOnSelect expand="lg" className={style["body"]}>
      <Container>
        <Navbar.Brand as={Link} to="/inicio" className="text-white">
          Tratamiento Afasia
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" className={style["toggle"]} />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <div className={style["link-container"]}>
              <Image src={icons.inicio} alt="Inicio" className={style["image-icons"]} />
              <Nav.Link as={Link} to="/paciente/inicio" className="text-white">
                Inicio
              </Nav.Link>
            </div>
            <div className={style["link-container"]}>
              <Image src={icons.prueba} alt="Prueba" className={style["image-icons"]} />
              <Nav.Link as={Link} to="/paciente/sesiones-pruebas" className="text-white">
                Pruebas
              </Nav.Link>
            </div>
            <div className={style["link-container"]}>
              <Image src={icons.registros} alt="Registros" className={style["image-icons"]} />
              <Nav.Link as={Link} to="/paciente/sesiones-registros" className="text-white">
                Registros
              </Nav.Link>
            </div>
          </Nav>
          <Nav>
            <div className={style["link-container"]}>
                <Navbar.Text>
                    <span className={style["white-text"]}>Bienvenido, {patientName}</span>
                </Navbar.Text>
            </div>
            <div className={style["link-container"]}>
              <Image src={icons.logout} alt="Cerrar Sesión" className={style["image-icons"]} />
              <Nav.Link onClick={handleLogout} className="text-white">
                Cerrar Sesión
              </Nav.Link>
            </div>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavigationBarPatient;