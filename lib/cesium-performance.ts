// Cesium Performance Optimization Settings
// Add this to your CesiumViewer component

export const CESIUM_PERFORMANCE_CONFIG = {
  // Terrain and imagery optimization
  terrain: {
    requestRenderMode: true,
    maximumRenderTimeChange: 500,
  },
  
  // Scene performance settings
  scene: {
    logarithmicDepthBuffer: true,
    fxaa: true,
    requestRenderMode: true,
    maximumRenderTimeChange: 500,
  },
  
  // Camera performance
  camera: {
    percentageChanged: 0.005,
  },
  
  // Batch POI rendering
  clustering: {
    enabled: true,
    pixelRange: 15,
    minimumClusterSize: 3,
    clusterBillboards: true,
    clusterLabels: true,
    clusterPoints: true,
  },
  
  // Level of Detail for markers
  lod: {
    near: 1000,    // Full detail
    medium: 5000,  // Medium detail  
    far: 20000,    // Low detail/hidden
  },
};

// Memory management
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const cleanupCesiumResources = (viewer: any) => {
  if (viewer && !viewer.isDestroyed()) {
    viewer.scene.primitives.removeAll();
    viewer.entities.removeAll();
    viewer.dataSources.removeAll();
  }
};