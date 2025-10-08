// Map Store - Zustand State Management
// Manages map view, selected POI, filters, and UI state

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Region = 'lisbon' | 'andalusia';

interface MapState {
  // Current View
  currentRegion: Region;
  zoom: number;
  
  // UI State
  selectedPOIId: string | null;
  isInfoPanelOpen: boolean;
  isCreateModalOpen: boolean;
  createModalCoords: { lat: number; lon: number } | null;
  
  // Filters
  activeCategories: string[];
  searchQuery: string;
  minRating: number;
  
  // Actions
  setRegion: (region: Region) => void;
  setZoom: (zoom: number) => void;
  selectPOI: (poiId: string | null) => void;
  openInfoPanel: () => void;
  closeInfoPanel: () => void;
  openCreateModal: (coords: { lat: number; lon: number }) => void;
  closeCreateModal: () => void;
  toggleCategory: (category: string) => void;
  setCategories: (categories: string[]) => void;
  setSearchQuery: (query: string) => void;
  setMinRating: (rating: number) => void;
  resetFilters: () => void;
}

export const useMapStore = create<MapState>()(
  persist(
    (set, get) => ({
      // Initial State
      currentRegion: 'lisbon',
      zoom: 12,
      selectedPOIId: null,
      isInfoPanelOpen: false,
      isCreateModalOpen: false,
      createModalCoords: null,
      activeCategories: [],
      searchQuery: '',
      minRating: 0,
      
      // Actions
      setRegion: (region) => {
        set({ 
          currentRegion: region,
          selectedPOIId: null,
          isInfoPanelOpen: false,
        });
      },
      
      setZoom: (zoom) => {
        set({ zoom });
      },
      
      selectPOI: (poiId) => {
        set({ 
          selectedPOIId: poiId,
          isInfoPanelOpen: !!poiId,
        });
      },
      
      openInfoPanel: () => {
        set({ isInfoPanelOpen: true });
      },
      
      closeInfoPanel: () => {
        set({ 
          isInfoPanelOpen: false,
          selectedPOIId: null,
        });
      },
      
      openCreateModal: (coords) => {
        set({ 
          isCreateModalOpen: true,
          createModalCoords: coords,
        });
      },
      
      closeCreateModal: () => {
        set({ 
          isCreateModalOpen: false,
          createModalCoords: null,
        });
      },
      
      toggleCategory: (category) => {
        const { activeCategories } = get();
        const isActive = activeCategories.includes(category);
        
        set({
          activeCategories: isActive
            ? activeCategories.filter(c => c !== category)
            : [...activeCategories, category],
        });
      },
      
      setCategories: (categories) => {
        set({ activeCategories: categories });
      },
      
      setSearchQuery: (query) => {
        set({ searchQuery: query });
      },
      
      setMinRating: (rating) => {
        set({ minRating: rating });
      },
      
      resetFilters: () => {
        set({
          activeCategories: [],
          searchQuery: '',
          minRating: 0,
        });
      },
    }),
    {
      name: 'ogt-map-storage',
      partialize: (state) => ({
        currentRegion: state.currentRegion,
        activeCategories: state.activeCategories,
      }),
    }
  )
);