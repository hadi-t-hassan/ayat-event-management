import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Card from './ui/Card';
import Button from './ui/Button';

interface Party {
  id: number;
  day: string;
  date: string;
  time: string;
  duration: string;
  place: string;
  event: string;
  status: string;
  actors: Array<{
    id: number;
    name: string;
    family: string;
  }>;
  meeting_time: string;
  meeting_date: string;
  meeting_place: string;
  dress_details: string;
  notes: string;
  camera_man: string;
  transport_vehicle: string;
  songs: Array<{ title: string }>;
}

export default function Schedule() {
  const { t } = useTranslation();
  const { user, accessToken } = useAuth();
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'time' | 'place'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState({ from: '', to: '' });
  const [expandedParty, setExpandedParty] = useState<number | null>(null);

  const isAdmin = !user?.actor_profile;

  useEffect(() => {
    fetchParties();
  }, [filter]);

  const fetchParties = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('status', filter);
      }
      
      const response = await axios.get(`http://localhost:8000/api/auth/parties/?${params}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      setParties(response.data.results || response.data);
    } catch (err: any) {
      setError(t('common.error'));
      console.error('Error fetching parties:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Sort and filter parties
  const processedParties = parties
    .filter(party => {
      // Status filter
      if (filter !== 'all' && party.status !== filter) return false;
      
      // Date range filter
      if (dateFilter.from && new Date(party.date) < new Date(dateFilter.from)) return false;
      if (dateFilter.to && new Date(party.date) > new Date(dateFilter.to)) return false;
      
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          party.place.toLowerCase().includes(search) ||
          party.day.toLowerCase().includes(search) ||
          party.actors.some(actor => 
            `${actor.name} ${actor.family}`.toLowerCase().includes(search)
          ) ||
          party.notes?.toLowerCase().includes(search) ||
          party.camera_man?.toLowerCase().includes(search)
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'time':
          comparison = a.time.localeCompare(b.time);
          break;
        case 'place':
          comparison = a.place.localeCompare(b.place);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'done':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return t('party.status.pending');
      case 'in_progress':
        return t('party.status.in_progress');
      case 'done':
        return t('party.status.done');
      case 'cancelled':
        return t('party.status.cancelled');
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg text-gray-600">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('schedule.title', 'Schedule')}
          </h1>
          <p className="text-gray-600">
            {isAdmin 
              ? t('schedule.adminDescription', 'View and manage all party schedules')
              : t('schedule.actorDescription', 'View your upcoming and completed parties')
            }
          </p>
        </div>
        {(isAdmin || user?.actor_profile?.can_manage_parties) && (
          <Button
            variant="primary"
            onClick={() => window.location.href = '/parties/new'}
          >
            {t('party.add')}
          </Button>
        )}
      </div>

      {/* Filters and Sorting */}
      <Card className="mb-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('schedule.searchPlaceholder', 'Search by place, actor, day...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg
              className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('schedule.dateFrom', 'From Date')}
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={dateFilter.from}
                onChange={(e) => setDateFilter({ ...dateFilter, from: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('schedule.dateTo', 'To Date')}
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={dateFilter.to}
                onChange={(e) => setDateFilter({ ...dateFilter, to: e.target.value })}
              />
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('schedule.sortBy', 'Sort By')}
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'time' | 'place')}
              >
                <option value="date">{t('party.date')}</option>
                <option value="time">{t('party.time')}</option>
                <option value="place">{t('party.place')}</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('schedule.sortOrder', 'Order')}
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              >
                <option value="asc">{t('schedule.ascending', 'Ascending')}</option>
                <option value="desc">{t('schedule.descending', 'Descending')}</option>
              </select>
            </div>
          </div>

          {/* Status Filters */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filter === 'all' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              {t('party.status.all')}
            </Button>
            <Button
              variant={filter === 'pending' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilter('pending')}
            >
              {t('party.status.pending')}
            </Button>
            <Button
              variant={filter === 'in_progress' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilter('in_progress')}
            >
              {t('party.status.in_progress')}
            </Button>
            <Button
              variant={filter === 'done' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilter('done')}
            >
              {t('party.status.done')}
            </Button>
            <Button
              variant={filter === 'cancelled' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilter('cancelled')}
            >
              {t('party.status.cancelled')}
            </Button>
          </div>
        </div>
      </Card>

      {error && (
        <Card className="mb-6 bg-red-50 border-red-200">
          <div className="text-red-700">{error}</div>
        </Card>
      )}

      {/* Parties List */}
      {processedParties.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {t('schedule.noParties', 'No parties found')}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'all' 
                ? t('schedule.noPartiesDescription', 'No parties have been scheduled yet.')
                : t('schedule.noPartiesFiltered', `No parties found with status: ${getStatusText(filter)}`)
              }
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6">
          {processedParties.map((party) => (
            <Card 
              key={party.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setExpandedParty(expandedParty === party.id ? null : party.id)}
            >
              <div className="flex flex-col">
                {/* Basic Info - Always Visible */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {party.event}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(party.status)}`}>
                      {getStatusText(party.status)}
                    </span>
                  </div>
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedParty(expandedParty === party.id ? null : party.id);
                    }}
                  >
                    <svg
                      className={`w-5 h-5 transform transition-transform ${expandedParty === party.id ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">{t('party.place')}:</span> {party.place}
                  </div>
                  <div>
                    <span className="font-medium">{t('party.date')}:</span> {formatDate(party.date)}
                  </div>
                  <div>
                    <span className="font-medium">{t('party.time')}:</span> {formatTime(party.time)}
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedParty === party.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">{t('schedule.partyDetails', 'Party Details')}</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p><span className="font-medium">{t('party.day')}:</span> {party.day}</p>
                          <p><span className="font-medium">{t('party.duration')}:</span> {party.duration}</p>
                          {party.dress_details && (
                            <p><span className="font-medium">{t('party.dressDetails')}:</span> {party.dress_details}</p>
                          )}
                          {party.camera_man && (
                            <p><span className="font-medium">{t('party.cameraMan')}:</span> {party.camera_man}</p>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">{t('schedule.meetingDetails', 'Meeting Details')}</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p><span className="font-medium">{t('party.meetingDate')}:</span> {formatDate(party.meeting_date)}</p>
                          <p><span className="font-medium">{t('party.meetingTime')}:</span> {formatTime(party.meeting_time)}</p>
                          <p><span className="font-medium">{t('party.meetingPlace')}:</span> {party.meeting_place}</p>
                          {party.transport_vehicle && (
                            <p><span className="font-medium">{t('party.transportVehicle')}:</span> {party.transport_vehicle}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {party.actors && party.actors.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-900 mb-2">{t('schedule.actors', 'Actors')}</h4>
                        <div className="flex flex-wrap gap-2">
                          {party.actors.map((actor) => (
                            <span
                              key={actor.id}
                              className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                            >
                              {actor.name} {actor.family}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {party.songs && party.songs.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">{t('party.songs')}</h4>
                          <div className="space-y-1">
                            {party.songs.map((song, index) => (
                              <div key={index} className="text-sm text-gray-600">
                                {index + 1}. {song.title}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {party.notes && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">{t('party.notes')}</h4>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                            {party.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
