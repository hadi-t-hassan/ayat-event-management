import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';
import LanguageToggle from './LanguageToggle';

export default function Navigation() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();
  const isAdmin = !user?.actor_profile;
  const actor = user?.actor_profile;

  const navLinkClasses = (path: string) => `
    px-4 py-2 rounded-lg transition-colors duration-200
    ${location.pathname === path 
      ? 'bg-blue-100 text-blue-700 font-medium' 
      : 'text-gray-600 hover:bg-gray-100'}
  `;

  return (
    <nav className="bg-white shadow-md backdrop-blur-md bg-opacity-80 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {t('party.title')}
            </h1>
            
            <div className="flex items-center space-x-2 mr-4">
              {/* Show Dashboard link only if admin or actor has dashboard access */}
              {(isAdmin || actor?.can_access_dashboard) && (
                <Link to="/dashboard" className={navLinkClasses('/dashboard')}>
                  {t('nav.dashboard')}
                </Link>
              )}

              {isAdmin ? (
                <>
                  <Link to="/parties" className={navLinkClasses('/parties')}>
                    {t('nav.parties')}
                  </Link>
                  <Link to="/actors" className={navLinkClasses('/actors')}>
                    {t('nav.actors')}
                  </Link>
                </>
              ) : (
                <>
                  {/* Show Parties link only if actor has parties access */}
                  {actor?.can_access_parties && (
                    <Link to="/my-parties" className={navLinkClasses('/my-parties')}>
                      {t('nav.myParties')}
                    </Link>
                  )}
                  {/* Show Actors link only if actor has actors access */}
                  {actor?.can_access_actors && (
                    <Link to="/actors" className={navLinkClasses('/actors')}>
                      {t('nav.actors')}
                    </Link>
                  )}
                  {/* Show Schedule link only if actor has schedule access */}
                  {actor?.can_access_schedule && (
                    <Link to="/schedule" className={navLinkClasses('/schedule')}>
                      {t('nav.schedule')}
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <LanguageToggle />
            <div className="flex items-center">
              <span className="text-gray-700 mx-4 font-medium">
                {t('auth.welcome')}, {user?.first_name || user?.username}
              </span>
              <Button variant="danger" size="sm" onClick={logout}>
                {t('auth.logout')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
