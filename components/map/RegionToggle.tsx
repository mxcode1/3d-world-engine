// RegionToggle Component
// Switch between Lisbon and Andalusia

'use client';

import { useMapStore, type Region } from '@/stores/mapStore';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

const REGIONS: { id: Region; label: string; emoji: string }[] = [
  { id: 'lisbon', label: 'Lisbon', emoji: '🇵🇹' },
  { id: 'andalusia', label: 'Andalusia', emoji: '🇪🇸' },
];

export function RegionToggle() {
  const { currentRegion, setRegion } = useMapStore();

  return (
    <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md rounded-full px-2 py-2 shadow-lg border border-slate-200">
      <MapPin className="h-5 w-5 text-blue-600 ml-2" />
      
      {REGIONS.map((region) => (
        <Button
          key={region.id}
          onClick={() => setRegion(region.id)}
          variant={currentRegion === region.id ? 'default' : 'ghost'}
          className={`rounded-full px-6 py-2 font-medium transition-all ${
            currentRegion === region.id
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <span className="mr-2">{region.emoji}</span>
          {region.label}
        </Button>
      ))}
    </div>
  );
}