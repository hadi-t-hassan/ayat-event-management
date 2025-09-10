import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Card from './ui/Card';
import type { Party, PartyFilters } from '../types/party';

interface PartyListProps {
  onEdit?: (party: Party) => void;
  onAddNew?: () => void;
}

export default function PartyList({ onEdit, onAddNew }: PartyListProps) {
  const { t } = useTranslation();
  useAuth(); // Keep the hook for authentication context
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Extended filters
  const [filters, setFilters] = useState<PartyFilters>({
    search: '',
    date: '',
    time: '',
    day: '',
    duration: '',
    place: '',
    event: '',
    numberOfActors: '',
    actor: '',
    meetingTime: '',
    meetingDate: '',
    meetingPlace: '',
    transportVehicle: '',
    cameraMan: '',
    notes: '',
    dressDetails: '',
    songs: '',
    status: ''
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

  const filteredParties = parties.filter(party => {
    const matchesSearch = (
      party.place.toLowerCase().includes(filters.search.toLowerCase()) ||
      party.day.toLowerCase().includes(filters.search.toLowerCase()) ||
      party.camera_man.toLowerCase().includes(filters.search.toLowerCase()) ||
      party.transport_vehicle.toLowerCase().includes(filters.search.toLowerCase()) ||
      party.notes.toLowerCase().includes(filters.search.toLowerCase()) ||
      party.dress_details.toLowerCase().includes(filters.search.toLowerCase()) ||
      party.actors.some(actor => 
        `${actor.name} ${actor.family}`.toLowerCase().includes(filters.search.toLowerCase())
      ) ||
      party.songs.some(song => 
        song.title.toLowerCase().includes(filters.search.toLowerCase())
      )
    );

    const matchesDay = !filters.day || party.day.toLowerCase().includes(filters.day.toLowerCase());
    const matchesDate = !filters.date || party.date === filters.date;
    const matchesTime = !filters.time || party.time.includes(filters.time);
    const matchesDuration = !filters.duration || party.duration.includes(filters.duration);
    const matchesPlace = !filters.place || party.place.toLowerCase().includes(filters.place.toLowerCase());
    const matchesEvent = !filters.event || party.event.toLowerCase().includes(filters.event.toLowerCase());
    const matchesNumberOfActors = !filters.numberOfActors || party.number_of_actors.toString() === filters.numberOfActors;
    const matchesMeetingTime = !filters.meetingTime || party.meeting_time.includes(filters.meetingTime);
    const matchesMeetingDate = !filters.meetingDate || party.meeting_date === filters.meetingDate;
    const matchesMeetingPlace = !filters.meetingPlace || party.meeting_place.toLowerCase().includes(filters.meetingPlace.toLowerCase());
    const matchesTransportVehicle = !filters.transportVehicle || party.transport_vehicle.toLowerCase().includes(filters.transportVehicle.toLowerCase());
    const matchesCameraMan = !filters.cameraMan || party.camera_man.toLowerCase().includes(filters.cameraMan.toLowerCase());
    const matchesNotes = !filters.notes || party.notes.toLowerCase().includes(filters.notes.toLowerCase());
    const matchesDressDetails = !filters.dressDetails || party.dress_details.toLowerCase().includes(filters.dressDetails.toLowerCase());
    const matchesSongs = !filters.songs || party.songs.some(song => song.title.toLowerCase().includes(filters.songs.toLowerCase()));
    const matchesStatus = !filters.status || party.status === filters.status;
    const matchesActor = !filters.actor || party.actors.some(actor => 
      `${actor.name} ${actor.family}`.toLowerCase().includes(filters.actor.toLowerCase())
    );

    return (
      matchesSearch &&
      matchesDay &&
      matchesDate &&
      matchesTime &&
      matchesDuration &&
      matchesPlace &&
      matchesEvent &&
      matchesNumberOfActors &&
      matchesMeetingTime &&
      matchesMeetingDate &&
      matchesMeetingPlace &&
      matchesTransportVehicle &&
      matchesCameraMan &&
      matchesNotes &&
      matchesDressDetails &&
      matchesSongs &&
      matchesStatus &&
      matchesActor
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg text-gray-600">{t('common.loading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-red-50 border-red-200">
          <div className="text-red-700">{error}</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header section remains the same */}

      {/* Advanced Search and Filters */}
      <Card className="mb-6">
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">{t('party.list.filters')}</h3>
          
          {/* Global Search */}
          <div className="mb-4">
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder={t('party.list.searchPlaceholder')}
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>

          {/* Detailed Filters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Basic Info Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('party.day')}
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={filters.day}
                onChange={(e) => setFilters(prev => ({ ...prev, day: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('party.date')}
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={filters.date}
                onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('party.time')}
              </label>
              <input
                type="time"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={filters.time}
                onChange={(e) => setFilters(prev => ({ ...prev, time: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('party.duration')}
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={filters.duration}
                onChange={(e) => setFilters(prev => ({ ...prev, duration: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('party.place')}
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={filters.place}
                onChange={(e) => setFilters(prev => ({ ...prev, place: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('party.event')}
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={filters.event}
                onChange={(e) => setFilters(prev => ({ ...prev, event: e.target.value }))}
                placeholder={t('party.eventPlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('party.numberOfActors')}
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={filters.numberOfActors}
                onChange={(e) => setFilters(prev => ({ ...prev, numberOfActors: e.target.value }))}
              />
            </div>

            {/* Meeting Details Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('party.meetingTime')}
              </label>
              <input
                type="time"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={filters.meetingTime}
                onChange={(e) => setFilters(prev => ({ ...prev, meetingTime: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('party.meetingDate')}
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={filters.meetingDate}
                onChange={(e) => setFilters(prev => ({ ...prev, meetingDate: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('party.meetingPlace')}
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={filters.meetingPlace}
                onChange={(e) => setFilters(prev => ({ ...prev, meetingPlace: e.target.value }))}
              />
            </div>

            {/* Additional Details Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('party.transportVehicle')}
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={filters.transportVehicle}
                onChange={(e) => setFilters(prev => ({ ...prev, transportVehicle: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('party.cameraMan')}
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={filters.cameraMan}
                onChange={(e) => setFilters(prev => ({ ...prev, cameraMan: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('party.notes')}
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={filters.notes}
                onChange={(e) => setFilters(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('party.dressDetails')}
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={filters.dressDetails}
                onChange={(e) => setFilters(prev => ({ ...prev, dressDetails: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('party.songs')}
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={filters.songs}
                onChange={(e) => setFilters(prev => ({ ...prev, songs: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('party.actors')}
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={filters.actor}
                onChange={(e) => setFilters(prev => ({ ...prev, actor: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('party.status.title')}
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="">{t('party.status.all')}</option>
                <option value="pending">{t('party.status.pending')}</option>
                <option value="in_progress">{t('party.status.in_progress')}</option>
                <option value="done">{t('party.status.done')}</option>
                <option value="cancelled">{t('party.status.cancelled')}</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Add New Button */}
      {onAddNew && (
        <div className="mb-6">
          <button
            onClick={onAddNew}
            className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg"
          >
            {t('party.add')}
          </button>
        </div>
      )}

      {/* Parties Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('party.event')}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('party.date')}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('party.place')}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('party.status.title')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredParties.map((party) => (
              <tr 
                key={party.id} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onEdit?.(party)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{party.event}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{party.date}</div>
                  <div className="text-sm text-gray-500">{party.time}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{party.place}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    party.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    party.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    party.status === 'done' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {t(`party.status.${party.status}`)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredParties.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {filters.search ? t('party.list.noSearchResults') : t('party.noParties')}
          </div>
        )}
      </div>
    </div>
  );
}