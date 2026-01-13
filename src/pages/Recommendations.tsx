import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MapPin, Users, DollarSign, Building2, Star, TrendingUp, Heart } from 'lucide-react';
import { format } from 'date-fns';

interface Event {
  id: string;
  event_name: string;
  event_type: string;
  event_date: string;
  guest_count: number;
  budget: number | null;
  location: string;
}

interface Hotel {
  id: string;
  name: string;
  city: string;
  address: string;
  image_url: string | null;
  description: string | null;
}

interface HotelHall {
  id: string;
  hotel_id: string;
  name: string;
  capacity: number;
  price_per_event: number | null;
}

interface Recommendation {
  hotel: Hotel;
  hall: HotelHall | null;
  matchScore: number;
  reasons: string[];
  event: Event;
}

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (!loading && role !== 'user') {
      navigate('/');
    }
  }, [user, role, loading, navigate]);

  useEffect(() => {
    if (user && role === 'user') {
      fetchRecommendations();
      fetchFavorites();
    }
  }, [user, role]);

  const fetchFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('event_id')
        .eq('organizer_id', user?.id);

      if (error) throw error;

      const eventIds = new Set(data?.map(f => f.event_id) || []);
      setFavorites(eventIds);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const toggleFavorite = async (hotelId: string) => {
    try {
      // Find event associated with this hotel recommendation
      const event = recommendations.find(r => r.hotel.id === hotelId)?.event;
      if (!event) return;

      const isFavorited = favorites.has(event.id);

      if (isFavorited) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('organizer_id', user?.id)
          .eq('event_id', event.id);

        if (error) throw error;

        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(event.id);
          return newSet;
        });

        toast({
          title: 'Removed from favorites',
          description: 'Event removed from your favorites.',
        });
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({
            organizer_id: user?.id,
            event_id: event.id,
          });

        if (error) throw error;

        setFavorites(prev => new Set(prev).add(event.id));

        toast({
          title: 'Added to favorites',
          description: 'Event saved to your favorites.',
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: 'Error',
        description: 'Failed to update favorites.',
        variant: 'destructive',
      });
    }
  };

  const fetchRecommendations = async () => {
    setIsLoading(true);

    try {
      // Get user's session token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        toast({
          title: 'Authentication Error',
          description: 'Please log in to view recommendations.',
          variant: 'destructive',
        });
        navigate('/auth');
        return;
      }

      // Call Python recommendation service
      const response = await fetch('/api/recommendations', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const data = await response.json();

      setRecommendations(data.recommendations || []);
      
      if (data.recommendations && data.recommendations.length > 0) {
        toast({
          title: 'Recommendations Ready',
          description: `Found ${data.recommendations.length} venue matches for your events.`,
        });
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load recommendations. Make sure the Python service is running.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex itevententer justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No Events Found</h2>
            <p className="text-muted-foreground mb-6">
              Create an event to get personalized venue recommendations
            </p>
            <Button asChild>
              <Link to="/add-event">Create Your First Event</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">AI Venue Recommendations</h1>
          </div>
          <p className="text-muted-foreground">
            Personalized venue suggestions based on your event requirements
          </p>
        </div>

        {recommendations.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Recommendations Available</h3>
                <p className="text-muted-foreground">
                  We couldn't find venues matching your event criteria at the moment.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {recommendations.map((rec, index) => (
              <Card key={`${rec.hotel.id}-${rec.event.id}-${index}`} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="grid md:grid-cols-3">
                  {/* Hotel Image */}
                  <div className="relative h-64 md:h-auto">
                    <img
                      src={rec.hotel.image_url || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800'}
                      alt={rec.hotel.name}
                      className="w-full h-full object-cover"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-4 right-4 bg-white/90 hover:bg-white"
                      onClick={() => toggleFavorite(rec.hotel.id)}
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          favorites.has(rec.hotel.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'
                        }`}
                      />
                    </Button>
                  </div>

                  {/* Content */}
                  <div className="md:col-span-2 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold">{rec.hotel.name}</h3>
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-primary text-primary" />
                            {rec.matchScore}% Match
                          </Badge>
                        </div>
                        <p className="text-muted-foreground flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {rec.hotel.city} • {rec.hotel.address}
                        </p>
                      </div>
                    </div>

                    {/* Event Context */}
                    <div className="bg-muted/50 rounded-lg p-3 mb-4">
                      <p className="text-sm font-medium mb-1">Recommended for your event:</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">{rec.event.event_name}</span>
                        <span>•</span>
                        <span>{format(new Date(rec.event.event_date), 'MMM dd, yyyy')}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {rec.event.guest_count} guests
                        </span>
                        {rec.event.budget && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              ₨{rec.event.budget.toLocaleString()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Match Reasons */}
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">Why this venue:</p>
                      <div className="flex flex-wrap gap-2">
                        {rec.reasons.map((reason, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {reason}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Hall Info */}
                    {rec.hall && (
                      <div className="bg-primary/5 rounded-lg p-3 mb-4">
                        <p className="text-sm font-medium mb-1">Recommended Hall: {rec.hall.name}</p>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            Capacity: {rec.hall.capacity}
                          </span>
                          {rec.hall.price_per_event && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              ₨{rec.hall.price_per_event.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    {rec.hotel.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {rec.hotel.description}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Button asChild>
                        <Link to={`/hotel/${rec.hotel.id}`}>View Details</Link>
                      </Button>
                      <Button variant="outline">Contact Venue</Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
