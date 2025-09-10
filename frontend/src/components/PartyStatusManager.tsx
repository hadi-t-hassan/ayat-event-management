import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';

interface Party {
  id: number;
  status: string;
}

interface PartyStatusManagerProps {
  party: Party;
  onStatusChange: () => void;
}

export default function PartyStatusManager({ party, onStatusChange }: PartyStatusManagerProps) {
  const { t } = useTranslation();
  useAuth(); // Keep the hook for authentication context
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateStatus = async (newStatus: string) => {
    try {
      setLoading(true);
      setError('');
      
      await api.patch(`/auth/parties/${party.id}/`, { status: newStatus });
      
      onStatusChange();
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="text-red-600 text-sm mb-2">
          {error}
        </div>
      )}
      
      <div className="flex gap-2">
        {party.status === 'pending' && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => updateStatus('in_progress')}
          >
            {t('party.startProgress')}
          </Button>
        )}
        
        {party.status === 'in_progress' && (
          <Button
            variant="success"
            size="sm"
            onClick={() => updateStatus('done')}
          >
            {t('party.markAsDone')}
          </Button>
        )}
        
        {party.status !== 'cancelled' && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => updateStatus('cancelled')}
          >
            {t('party.cancel')}
          </Button>
        )}
        
        {party.status === 'cancelled' && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => updateStatus('pending')}
          >
            {t('party.reactivate')}
          </Button>
        )}
      </div>
    </div>
  );
}
