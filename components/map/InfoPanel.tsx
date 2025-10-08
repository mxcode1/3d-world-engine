'use client';

import { useMapStore } from '@/stores/mapStore';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Star, 
  MapPin, 
  Clock, 
  DollarSign,
  ExternalLink,
  Heart,
  Share2,
} from 'lucide-react';
import { toast } from 'sonner';

const CATEGORY_LABELS: Record<string, string> = {
  coworking: '💼 Co-working',
  cafe: '☕ Cafe',
  accommodation: '🏠 Accommodation',
  restaurant: '🍽️ Restaurant',
  attraction: '🎭 Attraction',
  event: '🎉 Event',
  safe_zone: '🛡️ Safe Zone',
  nomad_hub: '🌍 Nomad Hub',
  other: '📍 Other',
};

export function InfoPanel() {
  const { selectedPOIId, closeInfoPanel } = useMapStore();

  const { data: poi, isLoading } = trpc.poi.getById.useQuery(
    { id: selectedPOIId! },
    { enabled: !!selectedPOIId }
  );

  const toggleFavoriteMutation = trpc.poi.toggleFavorite.useMutation({
    onSuccess: (data) => {
      toast.success(data.favorited ? 'Added to favorites!' : 'Removed from favorites');
    },
  });

  if (isLoading) {
    return (
      <div className="w-[400px] h-full bg-white shadow-2xl flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!poi) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const metadata = poi.metadata as any || {};

  return (
    <div className="w-[400px] h-full bg-white shadow-2xl flex flex-col">
      <div className="relative">
        <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <span className="text-6xl">{CATEGORY_LABELS[poi.category]?.split(' ')[0]}</span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 bg-white/90 hover:bg-white rounded-full shadow-lg"
          onClick={closeInfoPanel}
        >
          <X className="h-5 w-5" />
        </Button>

        <Badge 
          className="absolute top-4 left-4 text-sm py-1 px-3"
          variant="secondary"
        >
          {CATEGORY_LABELS[poi.category]}
        </Badge>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{poi.name}</h2>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(poi.rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-slate-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium text-slate-700">
              {poi.rating.toFixed(1)}
            </span>
            <span className="text-sm text-slate-500">
              ({poi.views_count} views)
            </span>
          </div>
        </div>

        <p className="text-slate-600 mb-6 leading-relaxed">{poi.description}</p>

        {poi.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {poi.tags.map((tag: string) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="space-y-3 mb-6">
          {metadata.hours && (
            <div className="flex items-center gap-3 text-sm">
              <Clock className="h-4 w-4 text-slate-400" />
              <span className="text-slate-700">{metadata.hours}</span>
            </div>
          )}

          {metadata.cost && (
            <div className="flex items-center gap-3 text-sm">
              <DollarSign className="h-4 w-4 text-slate-400" />
              <span className="text-slate-700">{metadata.cost}</span>
            </div>
          )}

          <div className="flex items-center gap-3 text-sm">
            <MapPin className="h-4 w-4 text-slate-400" />
            <span className="text-slate-700">
              {poi.latitude.toFixed(4)}, {poi.longitude.toFixed(4)}
            </span>
          </div>

          {metadata.website && (
            <a
              href={`https://${metadata.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-sm text-blue-600 hover:text-blue-700"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Visit website</span>
            </a>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              if (selectedPOIId) {
                toggleFavoriteMutation.mutate({ poiId: selectedPOIId });
              }
            }}
          >
            <Heart className="h-4 w-4 mr-2" />
            Favorite
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success('Link copied to clipboard!');
            }}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            Added by <span className="font-medium">{poi.user.display_name}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
