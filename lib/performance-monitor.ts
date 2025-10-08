// Performance monitoring utilities
'use client';

import { useEffect } from 'react';

export function PerformanceMonitor() {
  useEffect(() => {
    // Track Core Web Vitals
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Measure largest contentful paint
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          console.log('Performance:', {
            name: entry.name,
            value: entry.startTime,
            rating: entry.startTime < 2500 ? 'good' : entry.startTime < 4000 ? 'needs-improvement' : 'poor'
          });
        });
      });

      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'cumulative-layout-shift'] });

      // Clean up
      return () => observer.disconnect();
    }
  }, []);

  return null;
}

// Bundle size tracker
export function trackBundleSize() {
  if (typeof window !== 'undefined') {
    const scripts = document.querySelectorAll('script[src]');
    // Bundle size tracking - simplified for production
    console.log(`Performance: Found ${scripts.length} loaded scripts`);
  }
}