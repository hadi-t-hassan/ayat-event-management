import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import Card from './ui/Card';
import Button from './ui/Button';

interface Actor {
  id: number;
  name: string;
  family: string;
}

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
  status_display: string;
  created_by_name: string;
}

interface PartyCardProps {
  party: Party;
  onEdit?: (party: Party) => void;
  onStatusChange?: (party: Party, newStatus: string) => void;
  showActions?: boolean;
}

export default function PartyCard({ party, onEdit, onStatusChange, showActions = true }: PartyCardProps) {
  const { t } = useTranslation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  const handleStatusChange = (newStatus: string) => {
    if (onStatusChange) {
      onStatusChange(party, newStatus);
    }
  };

  return (
    <Card className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {party.place}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {format(new Date(party.date), 'MMMM d, yyyy')} • {party.time}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(party.status)}`}>
            {party.status_display}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-4 space-y-4">
        {/* Meeting Details */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">{t('party.meetingDetails')}</h4>
          <div className="bg-gray-50 rounded p-3 text-sm">
            <p><span className="font-medium">{t('party.meetingDate')}:</span> {party.meeting_date}</p>
            <p><span className="font-medium">{t('party.meetingTime')}:</span> {party.meeting_time}</p>
            <p><span className="font-medium">{t('party.meetingPlace')}:</span> {party.meeting_place}</p>
          </div>
        </div>

        {/* Actors */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">{t('party.actors')}</h4>
          <div className="flex flex-wrap gap-2">
            {party.actors.map(actor => (
              <span
                key={actor.id}
                className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-sm"
              >
                {actor.name} {actor.family}
              </span>
            ))}
          </div>
        </div>

        {/* Songs */}
        {party.songs.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">{t('party.songs')}</h4>
            <ul className="list-disc list-inside text-sm text-gray-600 pl-2">
              {party.songs.map(song => (
                <li key={song.id}>{song.title}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Additional Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p><span className="font-medium">{t('party.transportVehicle')}:</span> {party.transport_vehicle}</p>
            <p><span className="font-medium">{t('party.cameraMan')}:</span> {party.camera_man}</p>
          </div>
          <div>
            <p><span className="font-medium">{t('party.duration')}:</span> {party.duration}</p>
            <p><span className="font-medium">{t('common.createdBy')}:</span> {party.created_by_name}</p>
          </div>
        </div>

        {/* Notes and Dress Details */}
        {(party.notes || party.dress_details) && (
          <div className="space-y-3">
            {party.notes && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">{t('party.notes')}</h4>
                <p className="text-sm text-gray-600">{party.notes}</p>
              </div>
            )}
            {party.dress_details && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">{t('party.dressDetails')}</h4>
                <p className="text-sm text-gray-600">{party.dress_details}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      {showActions && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {party.status !== 'done' && (
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => handleStatusChange('done')}
                >
                  {t('party.markAsDone')}
                </Button>
              )}
              {party.status === 'pending' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleStatusChange('in_progress')}
                >
                  {t('party.startProgress')}
                </Button>
              )}
            </div>
            {onEdit && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onEdit(party)}
              >
                {t('common.edit')}
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
