import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';
import Card from './ui/Card';

interface Song {
  id: number;
  title: string;
  order: number;
}

interface Party {
  id: number;
  day: string;
  date: string;
  time: string;
  place: string;
  status: string;
  status_display: string;
  songs: Song[];
  actors: any[];
  created_by_name: string;
}

interface PartyTableProps {
  onEdit: (party: Party) => void;
}

export default function PartyTable({ onEdit }: PartyTableProps) {
  const { t } = useTranslation();
  const { accessToken } = useAuth();
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState('');
  const [sortField, setSortField] = useState<keyof Party>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout>();

  const fetchParties = async (search?: string) => {
    try {
      setLoading(true);
      const response = await api.get('/auth/parties/', {
        params: { search }
      });
      setParties(response.data);
      setError('');
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    setSearchTimeout(setTimeout(() => {
      fetchParties(value);
    }, 500));
  };

  useEffect(() => {
    fetchParties();
  }, [accessToken, t]);

  const handleDelete = async (id: number) => {
    if (window.confirm(t('party.confirmDelete'))) {
      try {
        await api.delete(`/auth/parties/${id}/`);
        fetchParties();
      } catch (err) {
        setError(t('common.error'));
      }
    }
  };

  const handleSort = (field: keyof Party) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedParties = [...parties].sort((a, b) => {
    if (sortField === 'date') {
      return sortDirection === 'asc' 
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    return sortDirection === 'asc'
      ? String(a[sortField]).localeCompare(String(b[sortField]))
      : String(b[sortField]).localeCompare(String(a[sortField]));
  });

  const filteredParties = filterStatus
    ? sortedParties.filter(party => party.status === filterStatus)
    : sortedParties;

  const SortIcon = ({ field }: { field: keyof Party }) => (
    <span className="ml-1">
      {sortField === field ? (
        sortDirection === 'asc' ? '↑' : '↓'
      ) : '↕'}
    </span>
  );

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4">{t('common.loading')}</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="mb-4 flex justify-between items-center">
        <div className="flex gap-4">
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
          <input
            type="text"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={t('common.search')}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-right cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('date')}
              >
                {t('party.date')}
                <SortIcon field="date" />
              </th>
              <th 
                className="px-6 py-3 text-right cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('time')}
              >
                {t('party.time')}
                <SortIcon field="time" />
              </th>
              <th 
                className="px-6 py-3 text-right cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('place')}
              >
                {t('party.place')}
                <SortIcon field="place" />
              </th>
              <th className="px-6 py-3 text-right">{t('party.songs')}</th>
              <th 
                className="px-6 py-3 text-right cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('status')}
              >
                {t('party.status.title')}
                <SortIcon field="status" />
              </th>
              <th className="px-6 py-3 text-right">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredParties.map((party) => (
              <tr key={party.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{new Date(party.date).toLocaleDateString()}</td>
                <td className="px-6 py-4">{party.time}</td>
                <td className="px-6 py-4">{party.place}</td>
                <td className="px-6 py-4">
                  <ul className="list-disc list-inside">
                    {party.songs.map((song) => (
                      <li key={song.id}>{song.title}</li>
                    ))}
                  </ul>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    party.status === 'done' ? 'bg-green-100 text-green-800' :
                    party.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    party.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {party.status_display}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2 justify-end">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onEdit(party)}
                    >
                      {t('common.edit')}
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(party.id)}
                    >
                      {t('common.delete')}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
