import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface PermissionRouteProps {
  children: React.ReactNode;
  requiredPermission?: keyof typeof permissionChecks;
}

const permissionChecks = {
  // Action permissions
  can_view_all_actors: (actor: any) => actor?.can_view_all_actors,
  can_manage_actors: (actor: any) => actor?.can_manage_actors,
  can_manage_parties: (actor: any) => actor?.can_manage_parties,
  can_view_upcoming_parties: (actor: any) => actor?.can_view_upcoming_parties,
  can_view_completed_parties: (actor: any) => actor?.can_view_completed_parties,
  
  // Page access permissions
  can_access_dashboard: (actor: any) => actor?.can_access_dashboard,
  can_access_actors: (actor: any) => actor?.can_access_actors,
  can_access_parties: (actor: any) => actor?.can_access_parties,
  can_access_schedule: (actor: any) => actor?.can_access_schedule,
};

export default function PermissionRoute({ children, requiredPermission }: PermissionRouteProps) {
  const { user } = useAuth();
  const actor = user?.actor_profile;
  const isAdmin = !actor;

  // Admin has access to everything
  if (isAdmin) {
    return <>{children}</>;
  }

  // If no specific permission is required, allow access
  if (!requiredPermission) {
    return <>{children}</>;
  }

  // Check if actor has the required permission
  const hasPermission = permissionChecks[requiredPermission](actor);
  if (!hasPermission) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
