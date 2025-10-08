// CreatePOIModal Component
// Modal for adding new Points of Interest

'use client';

import { useMapStore } from '@/stores/mapStore';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useState } from 'react';
import { toast } from 'sonner';

const CATEGORIES = [
  { value: 'coworking', label: 'Co-working Space' },
  { value: 'cafe', label: 'Café' },
  { value: 'accommodation', label: 'Accommodation' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'attraction', label: 'Attraction' },
  { value: 'event', label: 'Event' },
  { value: 'safe_zone', label: 'Safe Zone' },
  { value: 'nomad_hub', label: 'Nomad Hub' },
  { value: 'other', label: 'Other' },
];

export function CreatePOIModal() {
  const { isCreateModalOpen, createModalCoords, closeCreateModal, currentRegion } = useMapStore();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    tags: '',
  });

  const createPOIMutation = trpc.poi.create.useMutation({
    onSuccess: () => {
      toast.success('Location added successfully!');
      closeCreateModal();
      setFormData({ name: '', description: '', category: '', tags: '' });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add location');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!createModalCoords) return;
    
    createPOIMutation.mutate({
      name: formData.name,
      description: formData.description,
      latitude: createModalCoords.lat,
      longitude: createModalCoords.lon,
      category: formData.category as 'coworking' | 'cafe' | 'accommodation' | 'restaurant' | 'attraction' | 'event' | 'safe_zone' | 'nomad_hub' | 'other',
      region: currentRegion,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
    });
  };

  return (
    <Dialog open={isCreateModalOpen} onOpenChange={closeCreateModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Location</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Betahaus Lisbon"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of this location..."
              required
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="category">Category *</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="wifi, quiet, affordable, central"
            />
          </div>

          {createModalCoords && (
            <div className="text-sm text-slate-500">
              <p>Location: {createModalCoords.lat.toFixed(4)}, {createModalCoords.lon.toFixed(4)}</p>
              <p>Region: {currentRegion}</p>
            </div>
          )}

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={closeCreateModal}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createPOIMutation.isPending}
            >
              {createPOIMutation.isPending ? 'Adding...' : 'Add Location'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}