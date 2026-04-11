import type { Profession } from '../types';

export interface ProfessionMeta {
  id: Profession;
  name: string;
  icon: string;
  color: string;      // tailwind gradient from/to
  border: string;
  hoverBg: string;
  tag: string;
  blurb: string;
}

export const PROFESSIONS: ProfessionMeta[] = [
  {
    id: 'designer',
    name: 'Designer',
    icon: '🎨',
    color: 'from-rose-50 to-rose-100',
    border: 'border-rose-200',
    hoverBg: 'hover:bg-rose-50',
    tag: 'Creative',
    blurb: 'Books that sharpen taste and craft.',
  },
  {
    id: 'developer',
    name: 'Developer',
    icon: '💻',
    color: 'from-sky-50 to-sky-100',
    border: 'border-sky-200',
    hoverBg: 'hover:bg-sky-50',
    tag: 'Technical',
    blurb: 'Engineering, systems, and the craft of code.',
  },
  {
    id: 'entrepreneur',
    name: 'Entrepreneur',
    icon: '🚀',
    color: 'from-amber-50 to-amber-100',
    border: 'border-amber-200',
    hoverBg: 'hover:bg-amber-50',
    tag: 'Business',
    blurb: 'Zero-to-one thinking and founder stories.',
  },
  {
    id: 'lawyer',
    name: 'Lawyer',
    icon: '⚖️',
    color: 'from-slate-50 to-slate-100',
    border: 'border-slate-200',
    hoverBg: 'hover:bg-slate-50',
    tag: 'Legal',
    blurb: 'Argument, power, and precedent.',
  },
  {
    id: 'doctor',
    name: 'Doctor',
    icon: '🩺',
    color: 'from-emerald-50 to-emerald-100',
    border: 'border-emerald-200',
    hoverBg: 'hover:bg-emerald-50',
    tag: 'Medical',
    blurb: 'Medicine, mortality, and the human body.',
  },
  {
    id: 'educator',
    name: 'Educator',
    icon: '📖',
    color: 'from-violet-50 to-violet-100',
    border: 'border-violet-200',
    hoverBg: 'hover:bg-violet-50',
    tag: 'Learning',
    blurb: 'How minds change and learning happens.',
  },
  {
    id: 'scientist',
    name: 'Scientist',
    icon: '🔬',
    color: 'from-teal-50 to-teal-100',
    border: 'border-teal-200',
    hoverBg: 'hover:bg-teal-50',
    tag: 'Research',
    blurb: 'Discovery, experiment, and the fabric of reality.',
  },
];

export const PROFESSION_BY_ID: Record<Profession, ProfessionMeta> = PROFESSIONS.reduce(
  (acc, p) => ({ ...acc, [p.id]: p }),
  {} as Record<Profession, ProfessionMeta>,
);
