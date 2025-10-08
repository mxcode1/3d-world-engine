// MapControls Component
// Zoom and navigation controls

'use client';

import { Button } from '@/components/ui/button';
import { Plus, Minus, Compass, Locate } from 'lucide-react';

export function MapControls() {
  return (
    <div className="flex flex-col gap-2 bg-white/95 backdrop-blur-md rounded-lg p-2 shadow-lg border border-slate-200">
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 hover:bg-slate-100"
        title="Zoom In"
        onClick={() => {
          // Will be implemented with Cesium ref
          console.log('Zoom in');
        }}
      >
        <Plus className="h-5 w-5" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 hover:bg-slate-100"
        title="Zoom Out"
        onClick={() => {
          console.log('Zoom out');
        }}
      >
        <Minus className="h-5 w-5" />
      </Button>

      <div className="border-t border-slate-200 my-1" />

      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 hover:bg-slate-100"
        title="Reset North"
        onClick={() => {
          console.log('Reset north');
        }}
      >
        <Compass className="h-5 w-5" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 hover:bg-slate-100"
        title="My Location"
        onClick={() => {
          console.log('Get location');
        }}
      >
        <Locate className="h-5 w-5" />
      </Button>
    </div>
  );
}