import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';
import Card from './ui/Card';
import ConfirmDialog from './ui/ConfirmDialog';

interface Actor {
  id: number;
  name: string;
  family: string;
}

interface Song {
  title: string;
}

interface PartyFormData {
  day: string;
  date: string;
  time: string;
  duration: string;
  place: string;
  event: string;
  number_of_actors: string;
  actor_ids: number[];
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

interface PartyFormProps {
  editParty?: any;
  onSubmitSuccess?: () => void;
}

export default function PartyForm({ editParty, onSubmitSuccess }: PartyFormProps) {
  const { t } = useTranslation();
  const { accessToken } = useAuth();
  const [actors, setActors] = useState<Actor[]>([]);
  const [formData, setFormData] = useState<PartyFormData>({
    day: '',
    date: '',
    time: '',
    duration: '',
    place: '',
    event: '',
    number_of_actors: '',
    actor_ids: [],
    meeting_time: '',
    meeting_date: '',
    meeting_place: '',
    transport_vehicle: '',
    notes: '',
    camera_man: '',
    dress_details: '',
    songs: [{ title: '' }],
    status: editParty ? editParty.status : 'pending'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    if (editParty) {
      // Format duration from HH:MM:SS to HH:MM for display
      const formattedDuration = editParty.duration ? 
        editParty.duration.split(':').slice(0, 2).join(':') : '';
      
      setFormData({
        ...editParty,
        duration: formattedDuration,
        actor_ids: editParty.actors.map((actor: Actor) => actor.id),
        songs: editParty.songs.length > 0 ? editParty.songs : [{ title: '' }]
      });
    }
  }, [editParty]);

  useEffect(() => {
    const fetchActors = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/auth/actors/', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        setActors(response.data);
      } catch (err) {
        setError(t('common.error'));
      }
    };
    fetchActors();
  }, [accessToken, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editParty) {
      setShowConfirmDialog(true);
    } else {
      await submitForm();
    }
  };

  const submitForm = async () => {
    try {
      setShowConfirmDialog(false);
      const url = editParty
        ? `http://localhost:8000/api/auth/parties/${editParty.id}/`
        : 'http://localhost:8000/api/auth/parties/';
      
      const method = editParty ? 'put' : 'post';
      
      // Filter out empty song titles
      const filteredSongs = formData.songs.filter(song => song.title.trim() !== '');
      
      // Format duration for Django's DurationField (expects HH:MM:SS format)
      const formatDuration = (duration: string) => {
        // Remove any non-digit and non-colon characters
        const cleanDuration = duration.replace(/[^\d:]/g, '');
        
        if (!cleanDuration) return '00:00:00';
        
        const parts = cleanDuration.split(':');
        
        if (parts.length === 1) {
          // Single number (hours)
          const hours = parseInt(parts[0]) || 0;
          return `${hours.toString().padStart(2, '0')}:00:00`;
        } else if (parts.length === 2) {
          // HH:MM format
          const hours = parseInt(parts[0]) || 0;
          const minutes = parseInt(parts[1]) || 0;
          return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
        } else if (parts.length === 3) {
          // HH:MM:SS format
          const hours = parseInt(parts[0]) || 0;
          const minutes = parseInt(parts[1]) || 0;
          const seconds = parseInt(parts[2]) || 0;
          return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        return '00:00:00';
      };
      
      const formattedDuration = formatDuration(formData.duration);
      
      console.log('Submitting party data:', { 
        ...formData, 
        duration: formattedDuration, 
        songs: filteredSongs 
      });
      
      try {
        const response = await axios[method](url, 
          { ...formData, duration: formattedDuration, songs: filteredSongs },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        console.log('Server response:', response.data);
      } catch (error: any) {
        console.error('Server error response:', error.response?.data);
        throw error;
      }
      
      setSuccess(true);
      if (onSubmitSuccess) onSubmitSuccess();
      
      if (!editParty) {
        setFormData({
          day: '',
          date: '',
          time: '',
          duration: '',
          place: '',
          event: '',
          number_of_actors: '',
          actor_ids: [],
          meeting_time: '',
          meeting_date: '',
          meeting_place: '',
          transport_vehicle: '',
          notes: '',
          camera_man: '',
          dress_details: '',
          songs: [{ title: '' }],
          status: 'pending'
        });
      }
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const addSong = () => {
    setFormData(prev => ({
      ...prev,
      songs: [...prev.songs, { title: '' }]
    }));
  };

  const removeSong = (index: number) => {
    setFormData(prev => ({
      ...prev,
      songs: prev.songs.filter((_, i) => i !== index)
    }));
  };

  const updateSong = (index: number, title: string) => {
    setFormData(prev => ({
      ...prev,
      songs: prev.songs.map((song, i) => 
        i === index ? { ...song, title } : song
      )
    }));
  };

  const inputClasses = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200";
  const labelClasses = "block text-gray-700 font-medium mb-2";

  return (
    <Card className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {editParty ? t('party.edit') : t('party.add')}
      </h2>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6" role="alert">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6" role="alert">
          <p className="text-green-700">{t('common.success')}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">{t('party.basicInfo')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>{t('party.day')}</label>
              <input
                type="text"
                required
                className={inputClasses}
                value={formData.day}
                onChange={(e) => setFormData({ ...formData, day: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClasses}>{t('party.date')}</label>
              <input
                type="date"
                required
                className={inputClasses}
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClasses}>{t('party.time')}</label>
              <input
                type="time"
                required
                className={inputClasses}
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClasses}>{t('party.duration')}</label>
              <input
                type="text"
                required
                className={`${inputClasses} ${
                  formData.duration && !/^(\d+|\d{1,2}:\d{1,2}|\d{1,2}:\d{1,2}:\d{1,2})$/.test(formData.duration)
                    ? 'border-red-500 focus:ring-red-500'
                    : ''
                }`}
                value={formData.duration}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d:]/g, '');
                  setFormData({ ...formData, duration: value });
                }}
                placeholder="2:30 (hours:minutes)"
                title="Enter duration as: hours (2) or hours:minutes (2:30) or hours:minutes:seconds (2:30:00)"
                pattern="^(\d+|\d{1,2}:\d{1,2}|\d{1,2}:\d{1,2}:\d{1,2})$"
              />
              {formData.duration && !/^(\d+|\d{1,2}:\d{1,2}|\d{1,2}:\d{1,2}:\d{1,2})$/.test(formData.duration) && (
                <div className="mt-1 text-sm text-red-600">
                  {t('party.durationFormat', 'Enter as: 2 (hours) or 2:30 (hours:minutes) or 2:30:00 (hours:minutes:seconds)')}
                </div>
              )}
            </div>
            <div>
              <label className={labelClasses}>{t('party.place')}</label>
              <input
                type="text"
                required
                className={inputClasses}
                value={formData.place}
                onChange={(e) => setFormData({ ...formData, place: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClasses}>{t('party.event')}</label>
              <input
                type="text"
                required
                className={inputClasses}
                value={formData.event}
                onChange={(e) => setFormData({ ...formData, event: e.target.value })}
                placeholder={t('party.eventPlaceholder', 'e.g., Wedding, Birthday Party, etc.')}
              />
            </div>
          </div>
        </div>

        {/* Actors Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">{t('party.actorsInfo')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>{t('party.numberOfActors')}</label>
              <input
                type="number"
                required
                className={inputClasses}
                value={formData.number_of_actors}
                onChange={(e) => setFormData({ ...formData, number_of_actors: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClasses}>{t('party.actors')}</label>
              <select
                multiple
                className={`${inputClasses} h-32`}
                value={formData.actor_ids.map(String)}
                onChange={(e) => {
                  const selectedOptions = Array.from(e.target.selectedOptions, option => Number(option.value));
                  setFormData({ ...formData, actor_ids: selectedOptions });
                }}
              >
                {actors.map(actor => (
                  <option key={actor.id} value={actor.id}>
                    {actor.name} {actor.family}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Meeting Details */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">{t('party.meetingDetails')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClasses}>{t('party.meetingTime')}</label>
              <input
                type="time"
                required
                className={inputClasses}
                value={formData.meeting_time}
                onChange={(e) => setFormData({ ...formData, meeting_time: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClasses}>{t('party.meetingDate')}</label>
              <input
                type="date"
                required
                className={inputClasses}
                value={formData.meeting_date}
                onChange={(e) => setFormData({ ...formData, meeting_date: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClasses}>{t('party.meetingPlace')}</label>
              <input
                type="text"
                required
                className={inputClasses}
                value={formData.meeting_place}
                onChange={(e) => setFormData({ ...formData, meeting_place: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">{t('party.additionalDetails')}</h3>
          <div className="space-y-4">
            <div>
              <label className={labelClasses}>{t('party.transportVehicle')}</label>
              <input
                type="text"
                required
                className={inputClasses}
                value={formData.transport_vehicle}
                onChange={(e) => setFormData({ ...formData, transport_vehicle: e.target.value })}
              />
            </div>

            <div>
              <label className={labelClasses}>{t('party.cameraMan')}</label>
              <input
                type="text"
                required
                className={inputClasses}
                value={formData.camera_man}
                onChange={(e) => setFormData({ ...formData, camera_man: e.target.value })}
              />
            </div>

            <div>
              <label className={labelClasses}>{t('party.notes')}</label>
              <textarea
                className={`${inputClasses} h-24`}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <div>
              <label className={labelClasses}>{t('party.dressDetails')}</label>
              <textarea
                className={`${inputClasses} h-24`}
                value={formData.dress_details}
                onChange={(e) => setFormData({ ...formData, dress_details: e.target.value })}
                required
              />
            </div>
          </div>
        </div>

        {/* Songs Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">{t('party.songs')}</h3>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={addSong}
              className="flex items-center space-x-1"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>{t('party.addSong')}</span>
            </Button>
          </div>
          
          <div className="space-y-3">
            {formData.songs.map((song, index) => (
              <div key={index} className="flex items-center space-x-2 group">
                <span className="text-sm text-gray-500 font-medium w-8">{index + 1}.</span>
                <input
                  type="text"
                  className={`${inputClasses} flex-1`}
                  value={song.title}
                  onChange={(e) => updateSong(index, e.target.value)}
                  placeholder={`${t('party.songPlaceholder')} ${index + 1}`}
                  required
                />
                {formData.songs.length > 1 && (
                  <button
                    type="button"
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                    onClick={() => removeSong(index)}
                    title={t('common.remove')}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
                {index === formData.songs.length - 1 && (
                  <button
                    type="button"
                    className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all"
                    onClick={addSong}
                    title={t('party.addSong')}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Status Section - Only show in edit mode */}
        {editParty && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">{t('party.status.title')}</h3>
            <select
              className={inputClasses}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              required
            >
              <option value="pending">{t('party.status.pending')}</option>
              <option value="in_progress">{t('party.status.in_progress')}</option>
              <option value="done">{t('party.status.done')}</option>
              <option value="cancelled">{t('party.status.cancelled')}</option>
            </select>
          </div>
        )}

        <div className="flex justify-end pt-6">
          <Button type="submit" variant="primary" size="lg">
            {editParty ? t('common.save') : t('common.submit')}
          </Button>
        </div>
      </form>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={submitForm}
        title={t('party.confirmAdd', 'Confirm Party Creation')}
        message={t('party.confirmAddMessage', 'Are you sure you want to create this party? Please review all details before confirming.')}
        confirmText={t('party.create', 'Create Party')}
        cancelText={t('common.cancel')}
        variant="info"
      />
    </Card>
  );
}