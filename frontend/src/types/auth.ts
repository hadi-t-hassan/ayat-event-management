export interface ActorProfile {
  id: number;
  name: string;
  family: string;
  age: number;
  role: string;
  can_view_upcoming_parties: boolean;
  can_view_completed_parties: boolean;
  can_view_all_actors: boolean;
  can_manage_parties: boolean;
  can_manage_actors: boolean;
  can_access_dashboard: boolean;
  can_access_actors: boolean;
  can_access_parties: boolean;
  can_access_schedule: boolean;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  actor_profile?: ActorProfile;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password2: string;
  first_name?: string;
  last_name?: string;
}

// Each type is already exported individually above