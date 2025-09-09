import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';
import LanguageToggle from './LanguageToggle';
import { useState } from 'react';

export default function Navbar() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();
  const isAdmin = !user?.actor_profile;
  const actor = user?.actor_profile;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinkClasses = (path: string) => `
    relative px-4 py-2 rounded-xl transition-all duration-300 flex items-center space-x-2
    hover:bg-gray-50 group
    ${location.pathname === path 
      ? 'text-blue-600 font-medium' 
      : 'text-gray-600'}
  `;

  const navIconClasses = (path: string) => `
    w-5 h-5 transition-colors duration-300
    ${location.pathname === path 
      ? 'text-blue-600' 
      : 'text-gray-400 group-hover:text-gray-600'}
  `;

  const activeLinkIndicator = (path: string) => (
    location.pathname === path && (
      <div className="absolute inset-0 rounded-xl bg-blue-50 -z-10" />
    )
  );

  return (
    <nav className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Primary Navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link 
                to="/dashboard" 
                className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
              >
                {t('party.title')}
              </Link>
            </div>

            {/* Main Navigation Links */}
            <div className="hidden md:ml-8 md:flex md:space-x-2 items-center">
              {/* Dashboard */}
              {(isAdmin || actor?.can_access_dashboard) && (
                <Link to="/dashboard" className={navLinkClasses('/dashboard')}>
                  {activeLinkIndicator('/dashboard')}
                  <svg className={navIconClasses('/dashboard')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>{t('nav.dashboard')}</span>
                </Link>
              )}

              {/* Actors */}
              {(isAdmin || actor?.can_access_actors) && (
                <Link to="/actors" className={navLinkClasses('/actors')}>
                  {activeLinkIndicator('/actors')}
                  <svg className={navIconClasses('/actors')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>{t('nav.actors')}</span>
                </Link>
              )}

              {/* Parties */}
              {(isAdmin || actor?.can_access_parties) && (
                <Link to="/parties" className={navLinkClasses('/parties')}>
                  {activeLinkIndicator('/parties')}
                  <svg className={navIconClasses('/parties')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>{t('nav.parties')}</span>
                </Link>
              )}

              {/* Schedule */}
              {(isAdmin || actor?.can_access_schedule) && (
                <Link to="/schedule" className={navLinkClasses('/schedule')}>
                  {activeLinkIndicator('/schedule')}
                  <svg className={navIconClasses('/schedule')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{t('nav.schedule')}</span>
                </Link>
              )}
            </div>
          </div>

          {/* Right side - User menu and Language toggle */}
          <div className="flex items-center space-x-4">
            <LanguageToggle />
            
            <div className="hidden md:flex items-center space-x-4">
              {/* User Avatar and Name */}
              <div className="flex items-center space-x-3 px-3 py-1.5 rounded-xl bg-gray-50">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-medium">
                  {(user?.first_name?.[0] || user?.username?.[0] || '?').toUpperCase()}
                </div>
                <span className="text-gray-700 font-medium">
                  {user?.first_name || user?.username}
                </span>
              </div>

              {/* Logout Button */}
              <Button 
                variant="danger" 
                size="sm"
                className="rounded-xl hover:shadow-md transition-shadow duration-300"
                onClick={logout}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>{t('auth.logout')}</span>
                </div>
              </Button>
            </div>

            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2 rounded-xl text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="px-4 pt-2 pb-3 space-y-1">
          {/* Dashboard */}
          {(isAdmin || actor?.can_access_dashboard) && (
            <Link 
              to="/dashboard" 
              className={`block px-3 py-2 rounded-xl text-base font-medium transition-colors duration-300
                ${location.pathname === '/dashboard' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('nav.dashboard')}
            </Link>
          )}

          {/* Actors */}
          {(isAdmin || actor?.can_access_actors) && (
            <Link 
              to="/actors" 
              className={`block px-3 py-2 rounded-xl text-base font-medium transition-colors duration-300
                ${location.pathname === '/actors' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('nav.actors')}
            </Link>
          )}

          {/* Parties */}
          {(isAdmin || actor?.can_access_parties) && (
            <Link 
              to="/parties" 
              className={`block px-3 py-2 rounded-xl text-base font-medium transition-colors duration-300
                ${location.pathname === '/parties' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('nav.parties')}
            </Link>
          )}

          {/* Schedule */}
          {(isAdmin || actor?.can_access_schedule) && (
            <Link 
              to="/schedule" 
              className={`block px-3 py-2 rounded-xl text-base font-medium transition-colors duration-300
                ${location.pathname === '/schedule' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('nav.schedule')}
            </Link>
          )}

          {/* Mobile User Info and Logout */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center px-3 py-2">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-medium">
                  {(user?.first_name?.[0] || user?.username?.[0] || '?').toUpperCase()}
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">
                  {user?.first_name || user?.username}
                </div>
              </div>
            </div>
            <div className="mt-3 px-2">
              <Button 
                variant="danger" 
                size="sm" 
                className="w-full justify-center rounded-xl"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  logout();
                }}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>{t('auth.logout')}</span>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}