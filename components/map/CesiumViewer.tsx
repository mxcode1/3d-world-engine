// CesiumViewer Component
// 3D Globe with POI markers using CesiumJS

'use client';

import React, { useRef, useEffect } from 'react';
import { 
  Viewer, 
  Entity, 
  CameraFlyTo,
} from 'resium';
import { 
  Cartesian3,
  Color,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
} from 'cesium';
import { useMapStore } from '@/stores/mapStore';
import { trpc } from '@/lib/trpc/client';
import { initializeCesium, validateCesiumAssets } from '@/lib/cesium-config';

// Initialize Cesium configuration on module load
if (typeof window !== 'undefined') {
  initializeCesium();
}

// Region camera positions
const REGIONS = {
  lisbon: {
    destination: Cartesian3.fromDegrees(-9.1393, 38.7223, 50000),
    duration: 2.0,
  },
  andalusia: {
    destination: Cartesian3.fromDegrees(-5.9845, 37.3891, 150000),
    duration: 2.5,
  },
};

// POI category colors
const CATEGORY_COLORS: Record<string, Color> = {
  coworking: Color.fromCssColorString('#3b82f6'), // Blue
  cafe: Color.fromCssColorString('#f59e0b'),      // Amber
  accommodation: Color.fromCssColorString('#8b5cf6'), // Purple
  restaurant: Color.fromCssColorString('#ef4444'), // Red
  attraction: Color.fromCssColorString('#10b981'), // Green
  event: Color.fromCssColorString('#ec4899'),      // Pink
  safe_zone: Color.fromCssColorString('#14b8a6'), // Teal
  nomad_hub: Color.fromCssColorString('#6366f1'), // Indigo
  other: Color.fromCssColorString('#6b7280'),     // Gray
};

export function CesiumViewer() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const viewerRef = useRef<any>(null);
  const { 
    currentRegion, 
    selectPOI, 
    openCreateModal,
    activeCategories,
  } = useMapStore();

  // Fetch POIs for current region
  const { data: pois } = trpc.poi.getAll.useQuery({
    region: currentRegion,
  });

  // Setup right-click handler for creating POIs
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const viewerElement = (viewerRef.current as any);
    if (!viewerElement?.cesiumElement) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const viewer = viewerElement.cesiumElement as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = new ScreenSpaceEventHandler(viewer.canvas as any);

    // Right-click to create POI
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handler.setInputAction((click: any) => {
      const cartesian = viewer.camera.pickEllipsoid(click.position, viewer.scene.globe.ellipsoid);
      if (cartesian) {
        const cartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
        const longitude = cartographic.longitude * (180 / Math.PI);
        const latitude = cartographic.latitude * (180 / Math.PI);
        
        openCreateModal({ lat: latitude, lon: longitude });
      }
    }, ScreenSpaceEventType.RIGHT_CLICK);

    return () => {
      handler.destroy();
    };
  }, [openCreateModal]);

  // Filter POIs by active categories
  const filteredPOIs = pois?.filter((poi: { category: string }) => {
    return activeCategories.length === 0 || activeCategories.includes(poi.category);
  });

  // Add error handling state
  const [isLoading, setIsLoading] = React.useState(true);
  const [assetsValidated, setAssetsValidated] = React.useState(false);

  // Handle Cesium initialization and asset validation
  useEffect(() => {
    let mounted = true;

    const initializeAndValidate = async () => {
      // Validate assets first
      const assetsOk = await validateCesiumAssets();
      if (mounted) {
        setAssetsValidated(assetsOk);
      }

      // Give Cesium time to load
      setTimeout(() => {
        if (mounted) {
          setIsLoading(false);
        }
      }, 2000);
    };

    initializeAndValidate();

    return () => {
      mounted = false;
    };
  }, []);



  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          zIndex: 1000,
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <h2>🌍 3D World Engine</h2>
          <p>Loading Cesium globe...</p>
          {!assetsValidated && (
            <p style={{ color: '#fbbf24', fontSize: '14px' }}>
              ⚠️ Some assets may not be available
            </p>
          )}
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #333',
            borderTop: '4px solid #fff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
      )}
      <Viewer
        ref={viewerRef}
        full
        timeline={false}
        animation={false}
        baseLayerPicker={false}
        geocoder={false}
        homeButton={false}
        sceneModePicker={false}
        navigationHelpButton={false}
        infoBox={false}
        selectionIndicator={false}
        style={{ width: '100%', height: '100%' }}
      >
      {/* Camera animation for region switching */}
      <CameraFlyTo {...REGIONS[currentRegion]} />

      {/* POI markers */}
      {filteredPOIs?.map((poi: { 
        id: string; 
        name: string; 
        description: string; 
        longitude: number; 
        latitude: number; 
        category: string; 
      }) => (
        <Entity
          key={poi.id}
          name={poi.name}
          description={poi.description}
          position={Cartesian3.fromDegrees(poi.longitude, poi.latitude)}
          point={{
            pixelSize: 12,
            color: CATEGORY_COLORS[poi.category] || CATEGORY_COLORS.other,
            outlineColor: Color.WHITE,
            outlineWidth: 2,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          }}
          onClick={() => {
            selectPOI(poi.id);
          }}
        />
      ))}
      </Viewer>
    </div>
  );
}