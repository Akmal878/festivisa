import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Heart, Calendar, Users, MapPin, DollarSign, Send, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface FavoriteEvent {
  id: string;
  event: {
    id: string;
    user_id: string;
    event_name: string;
    event_type: string;
    event_date: string;
    guest_count: number;
    budget: number | null;
    location: string;
    status: string;
  };
}

export default function Favorites() {
  const [favorites, setFavorites] = useState<FavoriteEvent[]>([]);
  const [sentInvites, setSentInvites] = useState<Set<string>>(new Set());
  const [hotels, setHotels] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (!loading && role !== 'organizer') {
      navigate('/');
    }
  }, [user, role, loading, navigate]);

  useEffect(() => {
    if (user && role === 'organizer') {
      fetchData();
    }
  }, [user, role]);

  const fetchData = async () => {
    // Fetch favorites with event details
    const { data: favData, error } = await supabase
      .from('favorites')
      .select(`
        id,
        event:events(id, user_id, event_name, event_type, event_date, guest_count, budget, location, status)
      `)
      .eq('organizer_id', user?.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching favorites:', error);
    } else {
      setFavorites(favData as unknown as FavoriteEvent[]);
    }

    // Fetch sent invites
    const { data: invitesData } = await supabase
      .from('invites')
      .select('event_id')
      .eq('organizer_id', user?.id);

    if (invitesData) {
      setSentInvites(new Set(invitesData.map((i) => i.event_id)));
    }

    // Fetch hotels
    const { data: hotelsData } = await supabase
      .from('hotels')
      .select('id, name')
      .eq('organizer_id', user?.id);

    if (hotelsData) {
      setHotels(hotelsData);
    }

    setIsLoading(false);
  };

  const removeFavorite = async (favoriteId: string) => {
    await supabase.from('favorites').delete().eq('id', favoriteId);
    setFavorites((prev) => prev.filter((f) => f.id !== favoriteId));
    toast({ title: 'Removed from favorites' });
  };

  const sendInvite = async (eventId: string, userId: string) => {
    if (hotels.length === 0) {
      toast({
        title: 'No Hotel Listed',
        description: 'Please add your hotel first.',
        variant: 'destructive',
      });
      navigate('/add-hotel');
      return;
    }

    const hotel = hotels[0];

    const { error } = await supabase.from('invites').insert({
      event_id: eventId,
      hotel_id: hotel.id,
      organizer_id: user?.id,
      user_id: userId,
      message: `We'd love to host your event at ${hotel.name}!`,
    });

    if (error) {
      toast({
        title: 'Error',
        description: error.message.includes('duplicate') ? 'Already invited' : 'Failed to send invite.',
        variant: 'destructive',
      });
    } else {
      setSentInvites((prev) => new Set(prev).add(eventId));
      toast({ title: 'Invite Sent!' });
    }
  };

  if (loading || isLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen gradient-hero py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="font-display text-4xl font-semibold text-foreground">
              My Favorites
            </h1>
            <p className="text-muted-foreground mt-2">
              Events you've saved for later.
            </p>
          </div>

          {favorites.length === 0 ? (
            <div className="card-wedding text-center py-16">
              <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="font-display text-2xl font-semibold mb-2">No Favorites Yet</h2>
              <p className="text-muted-foreground mb-6">
                Browse events and save the ones you're interested in.
              </p>
              <Button asChild>
                <Link to="/all-events">Browse Events</Link>
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((fav) => (
                <div key={fav.id} className="card-wedding">
                  <div className="flex items-start justify-between mb-4">
                    <Badge variant="secondary">{fav.event?.event_type}</Badge>
                    <button
                      onClick={() => removeFavorite(fav.id)}
                      className="p-2 rounded-full hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>

                  <h3 className="font-display text-xl font-semibold text-foreground mb-4">
                    {fav.event?.event_name}
                  </h3>

                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(fav.event?.event_date), 'PPP')}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {fav.event?.guest_count} guests
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {fav.event?.location}
                    </div>
                    {fav.event?.budget && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        ${fav.event.budget.toLocaleString()}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-border">
                    {sentInvites.has(fav.event?.id) ? (
                      <Button disabled variant="outline" size="sm" className="w-full">
                        Invite Sent
                      </Button>
                    ) : (
                      <Button
                        onClick={() => sendInvite(fav.event?.id, fav.event?.user_id)}
                        size="sm"
                        className="w-full"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Send Invite
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}