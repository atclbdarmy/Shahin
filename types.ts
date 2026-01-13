
export interface Location {
  lat: number;
  lng: number;
}

export interface Laborer {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  ratePerHour: number;
  skills: string[];
  distance: number;
  location: Location;
  availability: 'Available' | 'Busy' | 'Offline';
  bio: string;
  reviews: number;
}

export interface SearchFilters {
  maxRate: number;
  minRating: number;
  skills: string[];
}
