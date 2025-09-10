import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
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
  transport_vehicle: string;
  dress_details: string;
  songs: { title: string }[];
}

export default function ActorParties() {
  const { t } = useTranslation();
  const { accessToken, user } = useAuth();
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    const fetchParties = async () => {
      try {
        const response = await api.get(`/auth/actors/${user?.actor_profile}/parties/`);
        setParties(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching parties:', error);
        setLoading(false);
      }
    };

    fetchParties();
  }, [accessToken, user]);

  const filteredParties = filterStatus
    ? parties.filter(party => party.status === filterStatus)
    : parties;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{t('actor.myParties')}</h2>
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">{t('party.status.all')}</option>
          <option value="pending">{t('party.status.pending')}</option>
          <option value="in_progress">{t('party.status.in_progress')}</option>
          <option value="done">{t('party.status.done')}</option>
          <option value="cancelled">{t('party.status.cancelled')}</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredParties.map(party => (
          <Card key={party.id}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{party.place}</h3>
                  <p className="text-gray-600">
                    {new Date(party.date).toLocaleDateString()} - {party.time}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  party.status === 'done' ? 'bg-green-100 text-green-800' :
                  party.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  party.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {party.status_display}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">{t('party.meetingDetails')}</h4>
                  <div className="space-y-2 text-gray-600">
                    <p><strong>{t('party.meetingDate')}:</strong> {new Date(party.meeting_date).toLocaleDateString()}</p>
                    <p><strong>{t('party.meetingTime')}:</strong> {party.meeting_time}</p>
                    <p><strong>{t('party.meetingPlace')}:</strong> {party.meeting_place}</p>
                    <p><strong>{t('party.transportVehicle')}:</strong> {party.transport_vehicle}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">{t('party.songs')}</h4>
                  <ul className="space-y-1 text-gray-600">
                    {party.songs.map((song, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-5 h-5 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full text-xs mr-2">
                          {index + 1}
                        </span>
                        {song.title}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="font-medium text-gray-900 mb-2">{t('party.dressDetails')}</h4>
                <p className="text-gray-600">{party.dress_details}</p>
              </div>
            </div>
          </Card>
        ))}

        {filteredParties.length === 0 && (
          <Card>
            <div className="p-6 text-center text-gray-500">
              {t('party.noParties')}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
