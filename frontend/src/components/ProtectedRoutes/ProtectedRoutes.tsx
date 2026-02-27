import {Navigate, Outlet} from 'react-router-dom';
import { isUserAuthenticated, getUserRol } from '../../services/api';
import { ProtectedRouteProps } from '../../types';


const ProtectedRoute = ({allowedRole}: ProtectedRouteProps) => {
  const isAuthenticated = isUserAuthenticated();
  const userRol = getUserRol();

  if(!isAuthenticated){
    return<Navigate to='/login' replace />
  }

  if(allowedRole && userRol !== allowedRole){
    const route = `/${userRol}/inicio`
    return<Navigate to={route} replace/>
  }

  return <Outlet/>
}

export default ProtectedRoute;