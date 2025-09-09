import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import PartyManagement from './components/PartyManagement';
import PartyForm from './components/PartyForm';
import ActorList from './components/ActorList';
import ActorForm from './components/ActorForm';
import ActorEdit from './components/ActorEdit';
import ActorParties from './components/ActorParties';
import Schedule from './components/Schedule';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import PermissionRoute from './components/PermissionRoute';
import Navbar from './components/Navbar';
import './i18n/config';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            {/* Protected routes with Navbar */}
            <Route
              element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <div className="pt-16"> {/* Add padding for fixed navbar */}
                      <Routes>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/parties" element={
                          <PermissionRoute requiredPermission="can_access_parties">
                            <PartyManagement />
                          </PermissionRoute>
                        } />
                        <Route path="/parties/new" element={
                          <PermissionRoute requiredPermission="can_manage_parties">
                            <PartyForm />
                          </PermissionRoute>
                        } />
                        <Route path="/parties/:id/edit" element={
                          <PermissionRoute requiredPermission="can_manage_parties">
                            <PartyForm />
                          </PermissionRoute>
                        } />
                        <Route path="/actors" element={
                          <PermissionRoute requiredPermission="can_access_actors">
                            <ActorList />
                          </PermissionRoute>
                        } />
                        <Route path="/actors/new" element={
                          <PermissionRoute requiredPermission="can_manage_actors">
                            <ActorForm />
                          </PermissionRoute>
                        } />
                        <Route path="/actors/:id/edit" element={
                          <PermissionRoute requiredPermission="can_manage_actors">
                            <ActorEdit />
                          </PermissionRoute>
                        } />
                        <Route path="/my-parties" element={<ActorParties />} />
                        <Route path="/schedule" element={
                          <PermissionRoute requiredPermission="can_access_schedule">
                            <Schedule />
                          </PermissionRoute>
                        } />
                      </Routes>
                    </div>
                  </>
                </ProtectedRoute>
              }
            >
              {/* Nested routes under protected layout */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/parties" element={<PartyManagement />} />
              <Route path="/parties/new" element={<PartyForm />} />
              <Route path="/parties/:id/edit" element={<PartyForm />} />
              <Route path="/actors" element={<ActorList />} />
              <Route path="/actors/new" element={<ActorForm />} />
              <Route path="/actors/:id/edit" element={<ActorEdit />} />
              <Route path="/my-parties" element={<ActorParties />} />
              <Route path="/schedule" element={<Schedule />} />
            </Route>

            {/* Default redirects */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;