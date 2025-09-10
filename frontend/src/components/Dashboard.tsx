import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Card from './ui/Card';
// Removed unused recharts imports

interface DashboardStats {
  // Admin stats
  total_parties?: number;
  total_actors?: number;
  upcoming_parties?: number;
  completed_parties?: number;
  top_actors?: Array<{
    name: string;
    family: string;
    party_count: number;
  }>;
  // Actor stats
  my_total_parties?: number;
  my_upcoming_parties?: number;
  my_completed_parties?: number;
  // Graph data
  monthly_activity?: Array<{
    month: string;
    parties: number;
  }>;
  status_distribution?: Array<{
    status: string;
    count: number;
  }>;
}

export default function Dashboard() {
  const { t } = useTranslation();
  const { user, accessToken } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({});
  const [loading, setLoading] = useState(true);
  const isAdmin = !user?.actor_profile;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/auth/dashboard/stats/');
        setStats(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setLoading(false);
      }
    };

    fetchStats();
  }, [accessToken, user, isAdmin]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {t(isAdmin ? 'dashboard.adminWelcome' : 'dashboard.actorWelcome')}
        </h1>
        <p className="mt-2 text-gray-600">
          {t(isAdmin ? 'dashboard.adminDescription' : 'dashboard.actorDescription')}
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Parties */}
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white transform hover:scale-105 transition-transform duration-200">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">{t('dashboard.totalParties')}</p>
                <h3 className="text-3xl font-bold mt-2">{isAdmin ? stats.total_parties : stats.my_total_parties || 0}</h3>
              </div>
              <div className="rounded-full bg-blue-400 bg-opacity-30 p-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </Card>

        {/* Upcoming Parties */}
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white transform hover:scale-105 transition-transform duration-200">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">{t('dashboard.upcomingParties')}</p>
                <h3 className="text-3xl font-bold mt-2">{isAdmin ? stats.upcoming_parties : stats.my_upcoming_parties || 0}</h3>
              </div>
              <div className="rounded-full bg-green-400 bg-opacity-30 p-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </Card>

        {/* Completed Parties or Total Actors */}
        <Card className={`bg-gradient-to-br ${isAdmin ? 'from-purple-500 to-purple-600' : 'from-yellow-500 to-yellow-600'} text-white transform hover:scale-105 transition-transform duration-200`}>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={isAdmin ? 'text-purple-100' : 'text-yellow-100'}>
                  {t(isAdmin ? 'dashboard.totalActors' : 'dashboard.completedParties')}
                </p>
                <h3 className="text-3xl font-bold mt-2">
                  {isAdmin ? stats.total_actors : stats.my_completed_parties || 0}
                </h3>
              </div>
              <div className={`rounded-full ${isAdmin ? 'bg-purple-400' : 'bg-yellow-400'} bg-opacity-30 p-3`}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isAdmin ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  )}
                </svg>
              </div>
            </div>
          </div>
        </Card>
      </div>



      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isAdmin && (
          <>
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-2">{t('dashboard.quickActions.addParty')}</h3>
                <p className="text-gray-600 mb-4">{t('dashboard.quickActions.addPartyDesc')}</p>
                <a href="/parties/new" className="text-blue-600 hover:text-blue-800 font-medium">
                  {t('dashboard.quickActions.getStarted')} →
                </a>
              </div>
            </Card>
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-2">{t('dashboard.quickActions.manageActors')}</h3>
                <p className="text-gray-600 mb-4">{t('dashboard.quickActions.manageActorsDesc')}</p>
                <a href="/actors" className="text-blue-600 hover:text-blue-800 font-medium">
                  {t('dashboard.quickActions.viewAll')} →
                </a>
              </div>
            </Card>
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-2">{t('dashboard.quickActions.viewParties')}</h3>
                <p className="text-gray-600 mb-4">{t('dashboard.quickActions.viewPartiesDesc')}</p>
                <a href="/parties" className="text-blue-600 hover:text-blue-800 font-medium">
                  {t('dashboard.quickActions.explore')} →
                </a>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
