// Main Map Page
// Entry point for the 3D map application

'use client';

import dynamic from 'next/dynamic';
import { useMapStore } from '@/stores/mapStore';
import { RegionToggle } from '@/components/map/RegionToggle';
import { MapControls } from '@/components/map/MapControls';
import { InfoPanel } from '@/components/map/InfoPanel';
import { CreatePOIModal } from '@/components/map/CreatePOIModal';
import { Toaster } from 'sonner';

// Dynamically import components (client-side only)
const CesiumViewer = dynamic(
  () => import('@/components/map/CesiumViewer').then((mod) => mod.CesiumViewer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading 3D Map...</p>
          <p className="text-slate-400 text-sm mt-2">Initializing Cesium Engine</p>
        </div>
      </div>
    ),
  }
);

export default function MapPage() {
  const { isInfoPanelOpen, isCreateModalOpen } = useMapStore();

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Map Canvas */}
      <CesiumViewer />

      {/* UI Overlays */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <RegionToggle />
      </div>

      <div className="absolute bottom-6 right-6 z-10">
        <MapControls />
      </div>

      {/* Info Panel (Slide from left) */}
      {isInfoPanelOpen && (
        <div className="absolute left-0 top-0 bottom-0 z-20">
          <InfoPanel />
        </div>
      )}

      {/* Create POI Modal */}
      {isCreateModalOpen && <CreatePOIModal />}

      {/* Toast Notifications */}
      <Toaster position="top-right" richColors />
    </div>
  );
}
