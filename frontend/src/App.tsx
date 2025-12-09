import { Route, Routes } from "react-router-dom";
import NavigationBar from "./components/NavegationBar/NavegationBar";
import NavigationBarPatient from "./components/NavegationBar/NavigaionBarPatient";
import NavigationBarDoctors from "./components/NavegationBar/NavigationBarDoctors";
import Home from "./components/Home/Home";
import PatientSessionsList from "./components/PatientSessionsList/PatientSessionsList";
import AfasiaTests from "./components/AfasiaTests/AfasiaTests";
import DoctorPatients from "./components/DoctorPatients/DoctorPatients";
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
      <Routes>
        
        <Route path="/*" element={
          <>
            <NavigationBarComponent />
            <main className={style["main-content"]}>
              <Routes>
                <Route path="/inicio" element={<Home />}/>
                <Route path="pruebas/:idSesion" element={<AfasiaTests />}/>
                <Route path="registros" element={<Records />}/>
                <Route path="/registrarPaciente" element={<RegisterPatients />}/>
                <Route path="/registrarDoctor" element={<RegisterDoctors />}/>
                <Route path="/login" element={<Login />}/>
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
                <Route path="/inicio" element={<Home />}/>
                <Route path="/sesiones-pruebas" element={<PatientSessionsList />}/>
                <Route path="/pruebas" element={<AfasiaTests />}/>
                <Route path="/registros" element={<Records />}/>
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
                <Route path="/configuracion-pruebas" element={<ConfigurationSessions />}/>
                <Route path="/inicio" element={<Home />}/>
                <Route path="/pruebas" element={<AfasiaTests />}/>
                <Route path="/pacientes" element={<DoctorPatients />}/>
                <Route path="/pacientes/:pacienteId/registros" element={<Records />}/>
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
