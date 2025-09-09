import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Card from './ui/Card';

interface Party {
  id: number;
  date: string;
  time: string;
  place: string;
  status: string;
  status_display: string;
  meeting_time: string;
  meeting_date: string;
  meeting_place: string;
  songs: { title: string }[];
}

export default function ActorDashboard() {
  const { t } = useTranslation();
  const { accessToken, user } = useAuth();
  const [upcomingParties, setUpcomingParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParties = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/auth/actors/${user?.actor_profile}/parties/`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        const parties = response.data;
        
        // Filter upcoming parties (not completed)
        const upcoming = parties.filter((party: Party) => 
          party.status !== 'done' && new Date(party.date) >= new Date()
        ).sort((a: Party, b: Party) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        ).slice(0, 5); // Get next 5 upcoming parties

        setUpcomingParties(upcoming);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching parties:', error);
        setLoading(false);
      }
    };

    fetchParties();
  }, [accessToken, user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">{t('dashboard.actorWelcome')}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Next Party */}
        {upcomingParties[0] && (
          <Card className="col-span-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4">{t('dashboard.nextParty')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm opacity-80">{t('party.date')}</p>
                  <p className="text-lg font-medium">
                    {new Date(upcomingParties[0].date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm opacity-80">{t('party.time')}</p>
                  <p className="text-lg font-medium">{upcomingParties[0].time}</p>
                </div>
                <div>
                  <p className="text-sm opacity-80">{t('party.place')}</p>
                  <p className="text-lg font-medium">{upcomingParties[0].place}</p>
                </div>
                <div>
                  <p className="text-sm opacity-80">{t('party.status.title')}</p>
                  <p className="text-lg font-medium">{upcomingParties[0].status_display}</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Meeting Details */}
        {upcomingParties[0] && (
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">{t('party.meetingDetails')}</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">{t('party.meetingDate')}</p>
                  <p className="font-medium">
                    {new Date(upcomingParties[0].meeting_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('party.meetingTime')}</p>
                  <p className="font-medium">{upcomingParties[0].meeting_time}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('party.meetingPlace')}</p>
                  <p className="font-medium">{upcomingParties[0].meeting_place}</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Songs */}
        {upcomingParties[0] && (
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">{t('party.songs')}</h3>
              <ul className="space-y-2">
                {upcomingParties[0].songs.map((song, index) => (
                  <li key={index} className="flex items-center">
                    <span className="w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full text-sm mr-2">
                      {index + 1}
                    </span>
                    {song.title}
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}