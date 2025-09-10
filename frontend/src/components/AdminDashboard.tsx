import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Card from './ui/Card';

interface DashboardStats {
  total_parties: number;
  pending_parties: number;
  in_progress_parties: number;
  completed_parties: number;
  total_actors: number;
  upcoming_parties: number;
}

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { accessToken } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    total_parties: 0,
    pending_parties: 0,
    in_progress_parties: 0,
    completed_parties: 0,
    total_actors: 0,
    upcoming_parties: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/auth/parties/');
        const parties = response.data;
        
        // Calculate stats
        setStats({
          total_parties: parties.length,
          pending_parties: parties.filter((p: any) => p.status === 'pending').length,
          in_progress_parties: parties.filter((p: any) => p.status === 'in_progress').length,
          completed_parties: parties.filter((p: any) => p.status === 'done').length,
          total_actors: [...new Set(parties.flatMap((p: any) => p.actors.map((a: any) => a.id)))].length,
          upcoming_parties: parties.filter((p: any) => new Date(p.date) > new Date()).length
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setLoading(false);
      }
    };

    fetchStats();
  }, [accessToken]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">{t('dashboard.title')}</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Parties */}
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="p-6">
            <h3 className="text-lg font-medium opacity-90">{t('dashboard.totalParties')}</h3>
            <p className="text-3xl font-bold mt-2">{stats.total_parties}</p>
          </div>
        </Card>

        {/* Total Actors */}
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="p-6">
            <h3 className="text-lg font-medium opacity-90">{t('dashboard.totalActors')}</h3>
            <p className="text-3xl font-bold mt-2">{stats.total_actors}</p>
          </div>
        </Card>

        {/* Upcoming Parties */}
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="p-6">
            <h3 className="text-lg font-medium opacity-90">{t('dashboard.upcomingParties')}</h3>
            <p className="text-3xl font-bold mt-2">{stats.upcoming_parties}</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pending Parties */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium text-yellow-600">{t('party.status.pending')}</h3>
            <p className="text-3xl font-bold mt-2">{stats.pending_parties}</p>
          </div>
        </Card>

        {/* In Progress Parties */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium text-blue-600">{t('party.status.in_progress')}</h3>
            <p className="text-3xl font-bold mt-2">{stats.in_progress_parties}</p>
          </div>
        </Card>

        {/* Completed Parties */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium text-green-600">{t('party.status.done')}</h3>
            <p className="text-3xl font-bold mt-2">{stats.completed_parties}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
