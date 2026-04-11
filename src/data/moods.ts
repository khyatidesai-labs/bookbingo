import type { Mood } from '../types';

export interface MoodMeta {
  id: Mood;
  title: string;
  description: string;
  image: string;
  gradient: string;
  textColor: string;
}

export const MOODS: MoodMeta[] = [
  {
    id: 'feel-good',
    title: 'Feel Good',
    description: 'Uplifting stories that leave you smiling',
    image:
      'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg?auto=compress&cs=tinysrgb&w=600',
    gradient: 'from-yellow-400/60 to-orange-300/40',
    textColor: 'text-amber-900',
  },
  {
    id: 'dark-deep',
    title: 'Dark & Deep',
    description: 'Brooding narratives with complex characters',
    image:
      'https://images.pexels.com/photos/3646180/pexels-photo-3646180.jpeg?auto=compress&cs=tinysrgb&w=600',
    gradient: 'from-slate-800/80 to-slate-700/60',
    textColor: 'text-white',
  },
  {
    id: 'motivational',
    title: 'Motivational',
    description: 'Fuel your ambitions and break limits',
    image:
      'https://images.pexels.com/photos/3646172/pexels-photo-3646172.jpeg?auto=compress&cs=tinysrgb&w=600',
    gradient: 'from-accent-600/70 to-accent-400/50',
    textColor: 'text-white',
  },
  {
    id: 'romantic',
    title: 'Romantic',
    description: 'Love stories that stay with you forever',
    image:
      'https://images.pexels.com/photos/694740/pexels-photo-694740.jpeg?auto=compress&cs=tinysrgb&w=600',
    gradient: 'from-rose-500/60 to-pink-400/40',
    textColor: 'text-rose-900',
  },
  {
    id: 'mind-bending',
    title: 'Mind-Bending',
    description: 'Challenge everything you thought you knew',
    image:
      'https://images.pexels.com/photos/256559/pexels-photo-256559.jpeg?auto=compress&cs=tinysrgb&w=600',
    gradient: 'from-teal-600/70 to-cyan-500/50',
    textColor: 'text-white',
  },
];

export const MOOD_BY_ID: Record<Mood, MoodMeta> = MOODS.reduce(
  (acc, m) => ({ ...acc, [m.id]: m }),
  {} as Record<Mood, MoodMeta>,
);
