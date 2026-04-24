import { Link } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Image from "react-bootstrap/Image";
import style from "./NavegationBar.module.css";
import icons from "../../assets/icons";
import NavDropdown from "react-bootstrap/esm/NavDropdown";

function NavegationBar() {
  return (
    <Navbar collapseOnSelect expand="lg" className={style["body"]}>
      <Container>
        <Navbar.Brand className="text-white" href="#home">
          Tratamiento Afasia SFA
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" className={style["toggle"]} />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <div className={style["link-container"]}>
              <Image src={icons.inicio} alt="Inicio" className={style["image-icons"]} />
              <Nav.Link as={Link} to="/inicio" className="text-white" href="#inicio">
                Inicio
              </Nav.Link>
            </div>
          </Nav>
          <Nav>
            <div className={style["link-container"]}>
              <Image src={icons.nuevoUsuario} alt="Nuevo Usuario" className={style["image-icons"]} />
              <NavDropdown
                id="nav-dropdown"
                className={style["dropdown-toggle"]}
                title={<span className={style["white-text"]}>Registrar</span>}
                menuVariant="dark"
              >
                <NavDropdown.Item as={Link} to="/registrarDoctor" className="text-white">
                  Registro de Médico
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/registrarPaciente" className="text-white">
                  Registro de Paciente
                </NavDropdown.Item>
              </NavDropdown>
            </div>
            <div className={style["link-container"]}>
              <Image src={icons.login} alt="Iniciar Sesión" className={style["image-icons"]} />
              <Nav.Link as={Link} to="/login" className="text-white" href="#iniciarSesion">
                Iniciar Sesión
              </Nav.Link>
            </div>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
export default NavegationBar;
