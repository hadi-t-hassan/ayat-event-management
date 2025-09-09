import type { ActorProfile as Actor } from './auth';

export interface Song {
  title: string;
}

export interface Party {
  id: number;
  day: string;
  date: string;
  time: string;
  duration: string;
  place: string;
  event: string;
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
  status: 'pending' | 'in_progress' | 'done' | 'cancelled';
}

export interface PartyFilters {
  search: string;
  day: string;
  date: string;
  time: string;
  duration: string;
  place: string;
  event: string;
  numberOfActors: string;
  meetingTime: string;
  meetingDate: string;
  meetingPlace: string;
  transportVehicle: string;
  cameraMan: string;
  notes: string;
  dressDetails: string;
  songs: string;
  status: string;
  actor: string;
}
