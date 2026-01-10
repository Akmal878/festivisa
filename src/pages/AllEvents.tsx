import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Calendar, Users, MapPin, DollarSign, Search, Heart, Send } from 'lucide-react';
import { format } from 'date-fns';

interface Event {
  id: string;
  user_id: string;
  event_name: string;
  event_type: string;
  event_date: string;
  guest_count: number;
  budget: number | null;
  location: string;
  requirements: string | null;
  hotel_decoration: boolean;
  fireworks: boolean;
  catering: boolean;
  photography: boolean;
  status: string;
  created_at: string;
}

interface Hotel {
  id: string;
  name: string;
}

export default function AllEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [sentInvites, setSentInvites] = useState<Set<string>>(new Set());
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
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

  useEffect(() => {
    if (searchQuery) {
      const filtered = events.filter(
        (event) =>
          event.event_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.event_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredEvents(filtered);
    } else {
      setFilteredEvents(events);
    }
  }, [searchQuery, events]);

  const fetchData = async () => {
    // Fetch open events
    const { data: eventsData, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (eventsError) {
      console.error('Error fetching events:', eventsError);
    } else {
      setEvents(eventsData || []);
      setFilteredEvents(eventsData || []);
    }

    // Fetch organizer's favorites
    const { data: favData } = await supabase
      .from('favorites')
      .select('event_id')
      .eq('organizer_id', user?.id);

    if (favData) {
      setFavorites(new Set(favData.map((f) => f.event_id)));
    }

    // Fetch organizer's sent invites
    const { data: invitesData } = await supabase
      .from('invites')
      .select('event_id')
      .eq('organizer_id', user?.id);

    if (invitesData) {
      setSentInvites(new Set(invitesData.map((i) => i.event_id)));
    }

    // Fetch organizer's hotels
    const { data: hotelsData } = await supabase
      .from('hotels')
      .select('id, name')
      .eq('organizer_id', user?.id);

    if (hotelsData) {
      setHotels(hotelsData);
    }

    setIsLoading(false);
  };

  const toggleFavorite = async (eventId: string) => {
    if (favorites.has(eventId)) {
      // Remove from favorites
      await supabase
        .from('favorites')
        .delete()
        .eq('organizer_id', user?.id)
        .eq('event_id', eventId);

      setFavorites((prev) => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });
      toast({ title: 'Removed from favorites' });
    } else {
      // Add to favorites
      await supabase.from('favorites').insert({
        organizer_id: user?.id,
        event_id: eventId,
      });

      setFavorites((prev) => new Set(prev).add(eventId));
      toast({ title: 'Added to favorites' });
    }
  };

  const sendInvite = async (eventId: string, userId: string) => {
    if (hotels.length === 0) {
      toast({
        title: 'No Hotel Listed',
        description: 'Please add your hotel first before sending invites.',
        variant: 'destructive',
      });
      navigate('/add-hotel');
      return;
    }

    // Use first hotel for now - could add selection later
    const hotel = hotels[0];

    const { error } = await supabase.from('invites').insert({
      event_id: eventId,
      hotel_id: hotel.id,
      organizer_id: user?.id,
      user_id: userId,
      message: `We'd love to host your event at ${hotel.name}!`,
    });

    if (error) {
      if (error.message.includes('duplicate')) {
        toast({
          title: 'Already Invited',
          description: 'You have already sent an invite for this event.',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to send invite.',
          variant: 'destructive',
        });
      }
    } else {
      setSentInvites((prev) => new Set(prev).add(eventId));
      toast({
        title: 'Invite Sent!',
        description: 'The event planner will be notified.',
      });
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-semibold text-foreground">
                All Events
              </h1>
              <p className="text-muted-foreground mt-2">
                Browse and send invites to event planners.
              </p>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-wedding pl-10"
              />
            </div>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="card-wedding text-center py-16">
              <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="font-display text-2xl font-semibold mb-2">No Events Found</h2>
              <p className="text-muted-foreground">
                {searchQuery ? 'Try adjusting your search.' : 'Check back later for new events.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredEvents.map((event) => (
                <div key={event.id} className="card-wedding">
                  <div className="flex items-start justify-between mb-4">
                    <Badge variant="secondary">{event.event_type}</Badge>
                    <button
                      onClick={() => toggleFavorite(event.id)}
                      className="p-2 rounded-full hover:bg-muted transition-colors"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          favorites.has(event.id)
                            ? 'fill-destructive text-destructive'
                            : 'text-muted-foreground'
                        }`}
                      />
                    </button>
                  </div>

                  <h3 className="font-display text-xl font-semibold text-foreground mb-4">
                    {event.event_name}
                  </h3>

                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(event.event_date), 'PPP')}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {event.guest_count} guests
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {event.location}
                    </div>
                    {event.budget && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        ${event.budget.toLocaleString()} budget
                      </div>
                    )}
                  </div>

                  {/* Services needed */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {event.hotel_decoration && (
                      <Badge variant="outline" className="text-xs">Decoration</Badge>
                    )}
                    {event.catering && (
                      <Badge variant="outline" className="text-xs">Catering</Badge>
                    )}
                    {event.photography && (
                      <Badge variant="outline" className="text-xs">Photography</Badge>
                    )}
                    {event.fireworks && (
                      <Badge variant="outline" className="text-xs">Fireworks</Badge>
                    )}
                  </div>

                  <div className="pt-4 border-t border-border">
                    {sentInvites.has(event.id) ? (
                      <Button disabled variant="outline" size="sm" className="w-full">
                        Invite Sent
                      </Button>
                    ) : (
                      <Button
                        onClick={() => sendInvite(event.id, event.user_id)}
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