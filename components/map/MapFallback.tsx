// Simple Map Fallback Component
// Shows when Cesium fails to load

'use client';

import React from 'react';
import { useMapStore } from '@/stores/mapStore';
import { trpc } from '@/lib/trpc/client';

export default function MapFallback() {
  const { currentRegion, setRegion } = useMapStore();
  const { data: pois } = trpc.poi.getAll.useQuery({ region: currentRegion });

  const regions = {
    lisbon: { name: 'Lisbon', lat: 38.7223, lon: -9.1393 },
    andalusia: { name: 'Andalusia', lat: 37.3891, lon: -5.9845 }
  };

  return (
    <div style={{ 
      width: '100%', 
      height: '100vh', 
      backgroundColor: '#1a1a1a',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '2rem',
      padding: '2rem'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌍</h1>
        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>3D World Engine</h2>
        <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>
          Map view temporarily unavailable
        </p>
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '2rem',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        {Object.entries(regions).map(([key, region]) => (
          <button
            key={key}
            onClick={() => setRegion(key as 'lisbon' | 'andalusia')}
            style={{
              padding: '12px 24px',
              backgroundColor: currentRegion === key ? '#4f46e5' : 'transparent',
              border: '2px solid #4f46e5',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'all 0.3s ease'
            }}
          >
            📍 {region.name}
          </button>
        ))}
      </div>

      <div style={{ 
        maxWidth: '600px', 
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: '2rem',
        borderRadius: '12px',
        backdropFilter: 'blur(10px)'
      }}>
        <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>
          Points of Interest in {regions[currentRegion as keyof typeof regions]?.name}
        </h3>
        
        {pois && pois.length > 0 ? (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {pois.map((poi: { id: string; name: string; description: string; latitude: number; longitude: number; category: string }) => (
              <div 
                key={poi.id}
                style={{
                  padding: '1rem',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#60a5fa' }}>
                  {poi.name}
                </h4>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', opacity: 0.8 }}>
                  {poi.description}
                </p>
                <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>
                  📍 {poi.latitude.toFixed(4)}, {poi.longitude.toFixed(4)} • 
                  🏷️ {poi.category}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.6 }}>
            <p>Loading points of interest...</p>
          </div>
        )}
      </div>

      <div style={{ 
        textAlign: 'center', 
        fontSize: '0.9rem', 
        opacity: 0.6,
        marginTop: '2rem'
      }}>
        <p>The 3D globe will load automatically when Cesium is ready.</p>
        <p>Data is loading from Supabase • Build: Production Ready ✅</p>
      </div>
    </div>
  );
}