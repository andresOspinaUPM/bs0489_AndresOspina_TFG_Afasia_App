import { Route, Routes } from "react-router-dom";
import NavigationBar from "./components/NavegationBar/NavegationBar";
import NavigationBarPatient from "./components/NavegationBar/NavigaionBarPatient";
import NavigationBarDoctors from "./components/NavegationBar/NavigationBarDoctors";
import NavigationalModal from "./components/NavigationalModal/NavigationalModal";
import Home from "./components/Home/Home";
import PatientSessionsList from "./components/PatientSessionsList/PatientSessionsList";
import AfasiaTests from "./components/AfasiaTests/AfasiaTests";
import DoctorPatientsList from "./components/DoctorPatientsList/DoctorPatientsList";
import Records from "./components/Records/Records";
import Login from "./components/Login/Login";
import RegisterPatients from "./components/RegisterPatients/RegisterPatients";
import RegisterDoctors from "./components/RegisterDoctors/RegisterDoctors";
import ConfigurationSessions from "./components/configurationSessions/ConfigurationSessions";
import Footer from "./components/Footer/Footer";
import style from "./App.module.css";
import { isUserAuthenticated, getUserRol } from "./services/api";

function App() {

  const isAuthenticated = isUserAuthenticated();
  const userRol = getUserRol();

  let NavigationBarComponent = NavigationBar;
  if(isAuthenticated){
    if(userRol === 'doctor'){
      NavigationBarComponent = NavigationBarDoctors;
    }else if(userRol === 'paciente'){
      NavigationBarComponent = NavigationBarPatient;
    }
  }
  return (
    <div className={style["app-layout"]}>
      <NavigationalModal/>
      <Routes>
        
        <Route path="/*" element={
          <>
            <NavigationBarComponent />
            <main className={style["main-content"]}>
              <Routes>
                <Route path="inicio" element={<Home />}/>
                <Route path="registros" element={<Records />}/>
                <Route path="registrarPaciente" element={<RegisterPatients />}/>
                <Route path="registrarDoctor" element={<RegisterDoctors />}/>
                <Route path="login" element={<Login />}/>
              </Routes>
            </main>
            <Footer />
          </>
        }/>

        <Route path="/paciente/*" element={
          <>
            <NavigationBarComponent />
            <main className={style["main-content"]}>
              <Routes>
                <Route path="inicio" element={<Home />}/>
                <Route path="sesiones-pruebas" element={<PatientSessionsList type='pruebas' />}/>
                <Route path="pruebas/:sessionId" element={<AfasiaTests />}/>
                <Route path="sesiones-registros" element={<PatientSessionsList type='registrosPaciente' />}/>
                <Route path="registros/:sessionId" element={<Records />}/>
              </Routes>
            </main>
            <Footer />
          </>
        }/>

        <Route path="/doctor/*" element={
          <>
            <NavigationBarComponent />
            <main className={style["main-content"]}>
              <Routes>
                <Route path="configuracion-pruebas" element={<ConfigurationSessions />}/>
                <Route path="inicio" element={<Home />}/>
                <Route path="pacientes" element={<DoctorPatientsList />}/>
                <Route path="pacientes/:nombre-paciente/lista-pruebas" element={<PatientSessionsList type='registrosDoctor' />}/>
                <Route path="registros-paciente/:nombre-paciente/:sessionId" element={<Records />}/>
              </Routes>
            </main>
            <Footer />
          </>
        }/>

      </Routes>
    </div>
  );
}

export default App;
