import React from 'react';
import { ComplaintCategory } from '../types';
import {
  Construction,
  Trash2,
  Lightbulb,
  Droplets,
  Waves,
  Bath,
  TrafficCone,
  Trees,
  HelpCircle,
} from 'lucide-react';

export const getCategoryIcon = (category: ComplaintCategory, className: string = 'w-4 h-4') => {
  switch (category) {
    case 'Roads & Potholes':
      return <Construction className={className} />;
    case 'Garbage & Waste':
      return <Trash2 className={className} />;
    case 'Street Lights':
      return <Lightbulb className={className} />;
    case 'Water Supply':
      return <Droplets className={className} />;
    case 'Drainage':
      return <Waves className={className} />;
    case 'Public Toilets':
      return <Bath className={className} />;
    case 'Traffic & Signs':
      return <TrafficCone className={className} />;
    case 'Parks & Public Spaces':
      return <Trees className={className} />;
    default:
      return <HelpCircle className={className} />;
  }
};

export const getCategoryColor = (category: ComplaintCategory) => {
  switch (category) {
    case 'Roads & Potholes':
      return 'text-amber-700 bg-amber-50 border-amber-200';
    case 'Garbage & Waste':
      return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    case 'Street Lights':
      return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    case 'Water Supply':
      return 'text-cyan-700 bg-cyan-50 border-cyan-200';
    case 'Drainage':
      return 'text-blue-700 bg-blue-50 border-blue-200';
    case 'Public Toilets':
      return 'text-teal-700 bg-teal-50 border-teal-200';
    case 'Traffic & Signs':
      return 'text-orange-700 bg-orange-50 border-orange-200';
    case 'Parks & Public Spaces':
      return 'text-green-700 bg-green-50 border-green-200';
    default:
      return 'text-slate-700 bg-slate-100 border-slate-200';
  }
};
