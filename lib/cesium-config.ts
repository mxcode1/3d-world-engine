import { Ion } from 'cesium';

/**
 * Initialize Cesium configuration for Next.js environment
 */
export function initializeCesium(): void {
  if (typeof window === 'undefined') return;

  // Set up Cesium Ion token
  const token = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN;
  if (token) {
    Ion.defaultAccessToken = token;
    console.log('Cesium Ion token configured successfully');
  } else {
    console.warn('Cesium Ion token not found. Some features may not work correctly.');
  }

  // Choose asset source based on environment
  const useLocalAssets = process.env.NODE_ENV === 'development' || 
                        process.env.NEXT_PUBLIC_USE_LOCAL_CESIUM_ASSETS === 'true';

  if (useLocalAssets) {
    // Use local assets (current setup)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).CESIUM_BASE_URL = '/cesium/';
    console.log('Using local Cesium assets');
  } else {
    // Use Cesium CDN (recommended for production)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).CESIUM_BASE_URL = 'https://cesium.com/downloads/cesiumjs/releases/1.134.0/Build/Cesium/';
    console.log('Using Cesium CDN assets');
  }

  // Set up additional Cesium configuration
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cesium = (window as any).Cesium;
    if (cesium && cesium.buildModuleUrl) {
      cesium.buildModuleUrl.setBaseUrl(
        useLocalAssets 
          ? '/cesium/' 
          : 'https://cesium.com/downloads/cesiumjs/releases/1.134.0/Build/Cesium/'
      );
    }
  } catch (error) {
    console.warn('Could not configure Cesium buildModuleUrl:', error);
  }

  console.log('Cesium configuration initialized');
}

/**
 * Check if required Cesium assets are accessible
 */
export async function validateCesiumAssets(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  const assetsToCheck = [
    '/cesium/Assets/Images/ion-credit.png',
    '/cesium/Assets/approximateTerrainHeights.json'
  ];

  try {
    const checks = await Promise.allSettled(
      assetsToCheck.map(asset => 
        fetch(asset, { method: 'HEAD' })
      )
    );

    const allAccessible = checks.every(check => 
      check.status === 'fulfilled' && check.value.ok
    );

    if (!allAccessible) {
      console.warn('Some Cesium assets are not accessible. The 3D globe may not render correctly.');
      return false;
    }

    console.log('Cesium assets validation successful');
    return true;
  } catch (error) {
    console.warn('Could not validate Cesium assets:', error);
    return false;
  }
}