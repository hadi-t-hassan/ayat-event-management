import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';
import Card from './ui/Card';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

interface Actor {
  id: number;
  name: string;
  family: string;
  age: number;
  role: string;
  username: string;
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

interface ActorFormData {
  name: string;
  family: string;
  age: string;
  role: string;
  username: string;
  password: string;
  permissions: {
    can_view_upcoming_parties: boolean;
    can_view_completed_parties: boolean;
    can_view_all_actors: boolean;
    can_manage_parties: boolean;
    can_manage_actors: boolean;
    can_access_dashboard: boolean;
    can_access_actors: boolean;
    can_access_parties: boolean;
    can_access_schedule: boolean;
  };
}

interface ActorFormProps {
  actor?: Actor;
  onSuccess?: () => void;
}

export default function ActorForm({ actor, onSuccess }: ActorFormProps) {
  const { t } = useTranslation();
  useAuth(); // Keep the hook for authentication context
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<ActorFormData>({
    name: '',
    family: '',
    age: '',
    role: '',
    username: '',
    password: '',
    permissions: {
      can_view_upcoming_parties: true,
      can_view_completed_parties: true,
      can_view_all_actors: false,
      can_manage_parties: false,
      can_manage_actors: false,
      can_access_dashboard: true,
      can_access_actors: false,
      can_access_parties: false,
      can_access_schedule: false
    }
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (actor) {
      setFormData({
        name: actor.name,
        family: actor.family,
        age: actor.age.toString(),
        role: actor.role,
        username: actor.username,
        password: '', // Password is not included in GET response
        permissions: {
          can_view_upcoming_parties: actor.can_view_upcoming_parties,
          can_view_completed_parties: actor.can_view_completed_parties,
          can_view_all_actors: actor.can_view_all_actors,
          can_manage_parties: actor.can_manage_parties,
          can_manage_actors: actor.can_manage_actors,
          can_access_dashboard: actor.can_access_dashboard,
          can_access_actors: actor.can_access_actors,
          can_access_parties: actor.can_access_parties,
          can_access_schedule: actor.can_access_schedule
        }
      });
    }
  }, [actor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data: Record<string, any> = {
        name: formData.name,
        family: formData.family,
        age: parseInt(formData.age),
        role: formData.role,
        username: formData.username,
        ...formData.permissions // Spread the permissions at root level
      };

      // Only include password for new actors or if it's changed during edit
      if (!actor || formData.password) {
        data['password'] = formData.password;
      }

      if (actor) {
        // Update existing actor
        await api.patch(`/auth/actors/${actor.id}/`, data);
      } else {
        // Create new actor
        await api.post('/auth/actors/', data);
      }

      setSuccess(true);
      
      if (!actor) {
        // Reset form only for new actors
        setFormData({
          name: '',
          family: '',
          age: '',
          role: '',
          username: '',
          password: '',
          permissions: {
            can_view_upcoming_parties: true,
            can_view_completed_parties: true,
            can_view_all_actors: false,
            can_manage_parties: false,
            can_manage_actors: false,
            can_access_dashboard: true,
            can_access_actors: false,
            can_access_parties: false,
            can_access_schedule: false
          }
        });
      }

      onSuccess?.();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      if (err.response?.data) {
        // Handle validation errors
        const errors = err.response.data;
        const errorMessages = [];
        for (const field in errors) {
          errorMessages.push(`${field}: ${errors[field].join(' ')}`);
        }
        setError(errorMessages.join('\n'));
      } else {
        setError(t('common.error'));
      }
    }
  };

  const handlePermissionChange = (permission: keyof typeof formData.permissions) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: !prev.permissions[permission]
      }
    }));
  };

  const inputClasses = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200";
  const labelClasses = "block text-gray-700 font-medium mb-2";
  const checkboxClasses = "h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer";

  return (
    <Card className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('actor.add')}</h2>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6" role="alert">
          <div className="text-red-700 whitespace-pre-line">{error}</div>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6" role="alert">
          <p className="text-green-700">{t('common.success')}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Authentication Information */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-4">{t('actor.authInfo')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClasses} htmlFor="username">
                {t('actor.username')}
              </label>
              <input
                id="username"
                type="text"
                required
                className={inputClasses}
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClasses} htmlFor="password">
                {t('actor.password')}
                {actor && !formData.password && (
                  <span className="text-sm text-gray-500 ml-2">
                    ({t('actor.leaveBlankToKeep')})
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required={!actor} // Only required for new actors
                  className={inputClasses}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">{t('actor.personalInfo')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClasses} htmlFor="name">
                {t('actor.name')}
              </label>
              <input
                id="name"
                type="text"
                required
                className={inputClasses}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClasses} htmlFor="family">
                {t('actor.family')}
              </label>
              <input
                id="family"
                type="text"
                required
                className={inputClasses}
                value={formData.family}
                onChange={(e) => setFormData({ ...formData, family: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClasses} htmlFor="age">
                {t('actor.age')}
              </label>
              <input
                id="age"
                type="number"
                required
                className={inputClasses}
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClasses} htmlFor="role">
                {t('actor.role')}
              </label>
              <input
                id="role"
                type="text"
                required
                className={inputClasses}
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Permissions */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">{t('actor.permissions.title')}</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="can_view_upcoming_parties"
                className={checkboxClasses}
                checked={formData.permissions.can_view_upcoming_parties}
                onChange={() => handlePermissionChange('can_view_upcoming_parties')}
              />
              <label htmlFor="can_view_upcoming_parties" className="ml-2 text-gray-700">
                {t('actor.permissions.viewUpcoming')}
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="can_view_completed_parties"
                className={checkboxClasses}
                checked={formData.permissions.can_view_completed_parties}
                onChange={() => handlePermissionChange('can_view_completed_parties')}
              />
              <label htmlFor="can_view_completed_parties" className="ml-2 text-gray-700">
                {t('actor.permissions.viewCompleted')}
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="can_view_all_actors"
                className={checkboxClasses}
                checked={formData.permissions.can_view_all_actors}
                onChange={() => handlePermissionChange('can_view_all_actors')}
              />
              <label htmlFor="can_view_all_actors" className="ml-2 text-gray-700">
                {t('actor.permissions.viewActors')}
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="can_manage_parties"
                className={checkboxClasses}
                checked={formData.permissions.can_manage_parties}
                onChange={() => handlePermissionChange('can_manage_parties')}
              />
              <label htmlFor="can_manage_parties" className="ml-2 text-gray-700">
                {t('actor.permissions.manageParties')}
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="can_manage_actors"
                className={checkboxClasses}
                checked={formData.permissions.can_manage_actors}
                onChange={() => handlePermissionChange('can_manage_actors')}
              />
              <label htmlFor="can_manage_actors" className="ml-2 text-gray-700">
                {t('actor.permissions.manageActors')}
              </label>
            </div>
          </div>
        </div>

        {/* Page Access Permissions */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">{t('actor.pagePermissions', 'Page Access Permissions')}</h3>
          <p className="text-sm text-gray-600 mb-4">
            {t('actor.pagePermissionsDescription', 'Select which pages this actor can access in the navigation menu.')}
          </p>
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="can_access_dashboard"
                className={checkboxClasses}
                checked={formData.permissions.can_access_dashboard}
                onChange={() => handlePermissionChange('can_access_dashboard')}
              />
              <label htmlFor="can_access_dashboard" className="ml-2 text-gray-700">
                {t('actor.pageAccess.dashboard', 'Dashboard')}
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="can_access_actors"
                className={checkboxClasses}
                checked={formData.permissions.can_access_actors}
                onChange={() => handlePermissionChange('can_access_actors')}
              />
              <label htmlFor="can_access_actors" className="ml-2 text-gray-700">
                {t('actor.pageAccess.actors', 'Actors')}
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="can_access_parties"
                className={checkboxClasses}
                checked={formData.permissions.can_access_parties}
                onChange={() => handlePermissionChange('can_access_parties')}
              />
              <label htmlFor="can_access_parties" className="ml-2 text-gray-700">
                {t('actor.pageAccess.parties', 'Parties')}
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="can_access_schedule"
                className={checkboxClasses}
                checked={formData.permissions.can_access_schedule}
                onChange={() => handlePermissionChange('can_access_schedule')}
              />
              <label htmlFor="can_access_schedule" className="ml-2 text-gray-700">
                {t('actor.pageAccess.schedule', 'Schedule')}
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" variant="primary">
            {t('common.submit')}
          </Button>
        </div>
      </form>
    </Card>
  );
}