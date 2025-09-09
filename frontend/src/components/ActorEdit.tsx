import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ActorForm from './ActorForm';

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

export default function ActorEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { accessToken } = useAuth();
  const [actor, setActor] = useState<Actor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchActor = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/auth/actors/${id}/`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        setActor(response.data);
      } catch (err) {
        setError(t('common.error'));
      } finally {
        setLoading(false);
      }
    };

    fetchActor();
  }, [id, accessToken, t]);

  const handleSuccess = () => {
    navigate('/actors');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!actor) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t('actor.notFound')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-2xl font-bold mb-6">{t('actor.edit')}</h2>
      <ActorForm actor={actor} onSuccess={handleSuccess} />
    </div>
  );
}
