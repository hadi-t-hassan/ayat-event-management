import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';
import Modal from './ui/Modal';
import DataTable from './ui/DataTable';
import ConfirmDialog from './ui/ConfirmDialog';
import PartyForm from './PartyForm';

interface Actor {
  id: number;
  name: string;
  family: string;
}

interface Song {
  title: string;
}

interface Party {
  id: number;
  day: string;
  date: string;
  time: string;
  duration: string;
  place: string;
  number_of_actors: number;
  actors: Actor[];
  meeting_time: string;
  meeting_date: string;
  meeting_place: string;
  transport_vehicle: string;
  notes: string;
  camera_man: string;
  dress_details: string;
  songs: Song[];
  status: string;
}

export default function PartyManagement() {
  const { t } = useTranslation();
  useAuth(); // Keep the hook for authentication context
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingParty, setEditingParty] = useState<Party | null>(null);
  const [deletingParty, setDeletingParty] = useState<Party | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    date: '',
    place: '',
    actor: ''
  });

  useEffect(() => {
    fetchParties();
  }, []);

  const fetchParties = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/parties/');
      setParties(response.data.results || response.data);
    } catch (err: any) {
      setError(t('common.error'));
      console.error('Error fetching parties:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (party: Party) => {
    setDeletingParty(party);
  };

  const confirmDelete = async () => {
    if (!deletingParty) return;
    
    try {
      await api.delete(`/auth/parties/${deletingParty.id}/`);
      setParties(parties.filter(p => p.id !== deletingParty.id));
      setDeletingParty(null);
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleEdit = (party: Party) => {
    setEditingParty(party);
    setShowAddDialog(true);
  };

  const handleStatusChange = async (party: Party, newStatus: string) => {
    try {
      await api.patch(`/auth/parties/${party.id}/`, { status: newStatus });
      
      setParties(parties.map(p => 
        p.id === party.id ? { ...p, status: newStatus } : p
      ));
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleFormSuccess = () => {
    setShowAddDialog(false);
    setEditingParty(null);
    fetchParties();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      done: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
        {t(`party.status.${status}`)}
      </span>
    );
  };

  const columns = [
    {
      key: 'date',
      header: t('party.date'),
      render: (party: Party) => formatDate(party.date),
      sortable: true
    },
    {
      key: 'time',
      header: t('party.time'),
      render: (party: Party) => formatTime(party.time),
      sortable: true
    },
    {
      key: 'day',
      header: t('party.day'),
      sortable: true
    },
    {
      key: 'place',
      header: t('party.place'),
      sortable: true
    },
    {
      key: 'actors',
      header: t('party.actors'),
      render: (party: Party) => (
        <div className="flex flex-wrap gap-1">
          {party.actors.slice(0, 3).map(actor => (
            <span key={actor.id} className="text-xs bg-gray-100 px-2 py-1 rounded">
              {actor.name} {actor.family}
            </span>
          ))}
          {party.actors.length > 3 && (
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
              +{party.actors.length - 3} more
            </span>
          )}
        </div>
      )
    },
    {
      key: 'songs',
      header: t('party.songs'),
      render: (party: Party) => (
        <div className="text-sm">
          {party.songs.length} {party.songs.length === 1 ? 'song' : 'songs'}
        </div>
      )
    },
    {
      key: 'status',
      header: t('party.status.title'),
      render: (party: Party) => getStatusBadge(party.status),
      sortable: true
    }
  ];

  // Filter parties based on filters
  const filteredParties = parties.filter(party => {
    const matchesStatus = !filters.status || party.status === filters.status;
    const matchesDate = !filters.date || party.date === filters.date;
    const matchesPlace = !filters.place || party.place.toLowerCase().includes(filters.place.toLowerCase());
    const matchesActor = !filters.actor || party.actors.some(actor => 
      `${actor.name} ${actor.family}`.toLowerCase().includes(filters.actor.toLowerCase())
    );
    
    return matchesStatus && matchesDate && matchesPlace && matchesActor;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg text-gray-600">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('party.title')}</h1>
            <p className="mt-2 text-gray-600">
              {t('party.description', 'Manage and organize all party events')}
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            onClick={() => {
              setEditingParty(null);
              setShowAddDialog(true);
            }}
            className="flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>{t('party.add')}</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4" role="alert">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-lg font-semibold mb-4">{t('party.list.filters')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('party.status.title')}
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">{t('party.status.all')}</option>
              <option value="pending">{t('party.status.pending')}</option>
              <option value="in_progress">{t('party.status.in_progress')}</option>
              <option value="done">{t('party.status.done')}</option>
              <option value="cancelled">{t('party.status.cancelled')}</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('party.date')}
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('party.place')}
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('party.list.filterByPlace')}
              value={filters.place}
              onChange={(e) => setFilters({ ...filters, place: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('party.actors')}
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('party.list.filterByActor')}
              value={filters.actor}
              onChange={(e) => setFilters({ ...filters, actor: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredParties}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
        searchKeys={['place', 'day', 'camera_man', 'notes']}
        itemsPerPage={10}
      />

      {/* Add/Edit Party Modal */}
      <Modal
        isOpen={showAddDialog}
        onClose={() => {
          setShowAddDialog(false);
          setEditingParty(null);
        }}
        title={editingParty ? t('party.edit') : t('party.add')}
        size="2xl"
      >
        <div className="p-6">
          <PartyForm
            editParty={editingParty}
            onSubmitSuccess={handleFormSuccess}
          />
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingParty}
        onClose={() => setDeletingParty(null)}
        onConfirm={confirmDelete}
        title={t('party.confirmDelete')}
        message={t('party.confirmDeleteMessage', `Are you sure you want to delete the party on ${deletingParty ? formatDate(deletingParty.date) : ''}?`)}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="danger"
      />
    </div>
  );
}
