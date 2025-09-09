import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import ActorForm from './ActorForm';
import PartyForm from './PartyForm';
import PartyList from './PartyList';
import Button from './ui/Button';
import Card from './ui/Card';
import LanguageToggle from './LanguageToggle';

type FormType = 'actor' | 'party' | null;

export default function Home() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeForm, setActiveForm] = useState<FormType>(null);
  const [editParty, setEditParty] = useState<any>(null);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleEditParty = (party: any) => {
    setEditParty(party);
    setActiveForm('party');
  };

  const handleAddNew = () => {
    setEditParty(null);
    setActiveForm('party');
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 ${i18n.language === 'ar' ? 'rtl' : 'ltr'}`}>
      {/* Modern Navbar */}
      <nav className="bg-white shadow-md backdrop-blur-md bg-opacity-80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {t('party.title')}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageToggle />
              <div className="flex items-center">
                <span className="text-gray-700 mx-4 font-medium">
                  {t('auth.welcome')}, {user?.first_name || user?.username}
                </span>
                <Button variant="danger" size="sm" onClick={handleLogout}>
                  {t('auth.logout')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Form Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card 
            className={`cursor-pointer transition-all duration-200 hover:shadow-xl ${activeForm === 'actor' ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setActiveForm('actor')}
          >
            <div className="flex flex-col items-center p-4">
              <svg className="w-12 h-12 text-blue-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h2 className="text-xl font-semibold text-gray-900">{t('actor.add')}</h2>
              <p className="mt-2 text-gray-600 text-center">{t('actor.title')}</p>
            </div>
          </Card>

          <Card 
            className={`cursor-pointer transition-all duration-200 hover:shadow-xl ${activeForm === 'party' && !editParty ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => { setEditParty(null); setActiveForm('party'); }}
          >
            <div className="flex flex-col items-center p-4">
              <svg className="w-12 h-12 text-blue-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h2 className="text-xl font-semibold text-gray-900">{t('party.add')}</h2>
              <p className="mt-2 text-gray-600 text-center">{t('party.title')}</p>
            </div>
          </Card>
        </div>

        {/* Active Form or Party List */}
        <div className="mt-8">
          {activeForm === 'actor' && (
            <div className="animate-fade-in">
              <ActorForm />
            </div>
          )}
          {activeForm === 'party' && (
            <div className="animate-fade-in">
              <PartyForm editParty={editParty} onSubmitSuccess={() => setActiveForm(null)} />
            </div>
          )}
          {!activeForm && (
            <div className="animate-fade-in">
              <PartyList onEdit={handleEditParty} onAddNew={handleAddNew} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}