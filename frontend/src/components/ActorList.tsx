import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';
import Card from './ui/Card';

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
  user: {
    username: string;
  };
}

export default function ActorList() {
  const { t } = useTranslation();
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const [actors, setActors] = useState<Actor[]>([]);
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchActors = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/auth/actors/', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setActors(response.data);
      setLoading(false);
    } catch (err) {
      setError(t('common.error'));
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActors();
  }, [accessToken, t]);

  const handleDelete = async (id: number) => {
    if (window.confirm(t('actor.confirmDelete'))) {
      try {
        await axios.delete(`http://localhost:8000/api/auth/actors/${id}/`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        fetchActors();
      } catch (err) {
        setError(t('common.error'));
      }
    }
  };

  const filteredActors = actors.filter(actor => 
    actor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    actor.family.toLowerCase().includes(searchTerm.toLowerCase()) ||
    actor.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    actor.user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{t('actor.title')}</h2>
          <Button variant="primary" onClick={() => navigate('/actors/new')}>
            {t('actor.add')}
          </Button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t('actor.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredActors.map(actor => (
          <Card key={actor.id} className="hover:shadow-lg transition-shadow duration-200">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">
                    {actor.name} {actor.family}
                  </h3>
                  <p className="text-gray-600">{actor.role}</p>
                </div>
                <div className="text-sm text-gray-500">
                  @{actor.username}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <p><strong>{t('actor.age')}:</strong> {actor.age}</p>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">{t('actor.permissions.title')}</h4>
                <div className="space-y-1">
                  {actor.can_view_upcoming_parties && (
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-2">
                      {t('actor.permissions.viewUpcoming')}
                    </span>
                  )}
                  {actor.can_view_completed_parties && (
                    <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mr-2">
                      {t('actor.permissions.viewCompleted')}
                    </span>
                  )}
                  {actor.can_view_all_actors && (
                    <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full mr-2">
                      {t('actor.permissions.viewActors')}
                    </span>
                  )}
                  {actor.can_manage_parties && (
                    <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full mr-2">
                      {t('actor.permissions.manageParties')}
                    </span>
                  )}
                  {actor.can_manage_actors && (
                    <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                      {t('actor.permissions.manageActors')}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate(`/actors/${actor.id}/edit`)}
                >
                  {t('common.edit')}
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(actor.id)}
                >
                  {t('common.delete')}
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {filteredActors.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            {searchTerm ? t('actor.noSearchResults') : t('actor.noActors')}
          </div>
        )}
      </div>
    </div>
  );
}
