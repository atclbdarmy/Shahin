
import { Laborer } from './types';

export const MOCK_LABORERS: Laborer[] = [
  {
    id: '1',
    name: 'Michael Chen',
    avatar: 'https://picsum.photos/seed/mchen/200',
    rating: 4.8,
    ratePerHour: 25,
    skills: ['Carpentry', 'General Labor', 'Painting'],
    distance: 0.8,
    location: { lat: 37.7749, lng: -122.4194 },
    availability: 'Available',
    bio: 'Experienced carpenter with over 5 years in residential construction. Hardworking and punctual.',
    reviews: 124
  },
  {
    id: '2',
    name: 'Sarah Rodriguez',
    avatar: 'https://picsum.photos/seed/srod/200',
    rating: 4.9,
    ratePerHour: 30,
    skills: ['Landscaping', 'Gardening', 'Hauling'],
    distance: 1.2,
    location: { lat: 37.7833, lng: -122.4167 },
    availability: 'Available',
    bio: 'Professional landscaper specialized in drought-resistant gardens and hardscaping.',
    reviews: 89
  },
  {
    id: '3',
    name: 'David Wilson',
    avatar: 'https://picsum.photos/seed/dwilson/200',
    rating: 4.5,
    ratePerHour: 20,
    skills: ['Moving', 'Packing', 'Cleaning'],
    distance: 0.5,
    location: { lat: 37.7689, lng: -122.4294 },
    availability: 'Busy',
    bio: 'Efficient mover and packer. I bring my own basic supplies if needed.',
    reviews: 45
  },
  {
    id: '4',
    name: 'Amina Okafor',
    avatar: 'https://picsum.photos/seed/aokaf/200',
    rating: 4.7,
    ratePerHour: 28,
    skills: ['Electrical', 'Fixture Install', 'Plumbing'],
    distance: 2.1,
    location: { lat: 37.7549, lng: -122.4094 },
    availability: 'Available',
    bio: 'Certified electrician for small home repairs and fixture installations.',
    reviews: 67
  },
  {
    id: '5',
    name: 'James Miller',
    avatar: 'https://picsum.photos/seed/jmiller/200',
    rating: 4.6,
    ratePerHour: 22,
    skills: ['Painting', 'Pressure Washing'],
    distance: 1.5,
    location: { lat: 37.7949, lng: -122.3994 },
    availability: 'Available',
    bio: 'Specialist in exterior painting and high-pressure cleaning for driveways.',
    reviews: 32
  }
];

export const SKILLS_LIST = [
  'Carpentry', 'Painting', 'Landscaping', 'Moving', 'Cleaning', 'Electrical', 'Plumbing', 'General Labor'
];
