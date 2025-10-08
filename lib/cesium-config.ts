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
  const isDevelopment = process.env.NODE_ENV === 'development';
  const forceLocalAssets = process.env.NEXT_PUBLIC_USE_LOCAL_CESIUM_ASSETS === 'true';
  const useLocalAssets = isDevelopment || forceLocalAssets;

  console.log('Environment check:', { 
    NODE_ENV: process.env.NODE_ENV, 
    NEXT_PUBLIC_USE_LOCAL_CESIUM_ASSETS: process.env.NEXT_PUBLIC_USE_LOCAL_CESIUM_ASSETS,
    useLocalAssets 
  });

  if (useLocalAssets) {
    // Use local assets
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).CESIUM_BASE_URL = '/cesium/';
    console.log('✓ Using local Cesium assets from /cesium/');
  } else {
    // Use local assets in production too for now (more reliable)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).CESIUM_BASE_URL = '/cesium/';
    console.log('✓ Using local Cesium assets in production (fallback)');
  }

  // Set up additional Cesium configuration
  try {
    // Wait for Cesium to be available
    let attempts = 0;
    const maxAttempts = 10;
    
    const configureCesiumModule = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cesium = (window as any).Cesium;
      if (cesium && cesium.buildModuleUrl) {
        cesium.buildModuleUrl.setBaseUrl('/cesium/');
        console.log('✓ Cesium buildModuleUrl configured successfully');
        return true;
      }
      return false;
    };

    const attemptConfiguration = () => {
      if (configureCesiumModule()) return;
      
      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(attemptConfiguration, 100);
      } else {
        console.warn('⚠️ Could not configure Cesium buildModuleUrl after', maxAttempts, 'attempts');
      }
    };

    attemptConfiguration();
  } catch (error) {
    console.warn('❌ Error configuring Cesium buildModuleUrl:', error);
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