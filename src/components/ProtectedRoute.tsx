import { Navigate, Outlet } from 'react-router-dom';
import { authUtils } from '@/utils/api';

export function ProtectedRoute() {
  return authUtils.isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;
}
