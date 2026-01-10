import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Calendar, Users, MapPin, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

interface Event {
  id: string;
  event_name: string;
  event_type: string;
  event_date: string;
  guest_count: number;
  budget: number | null;
  location: string;
  status: string;
  created_at: string;
}

export default function MyEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
    if (user) {
      fetchEvents();
    }
  }, [user]);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load events.',
        variant: 'destructive',
      });
    } else {
      setEvents(data || []);
    }
    setIsLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-4xl font-semibold text-foreground">
                My Events
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage your event listings and view invitations.
              </p>
            </div>
            <Button asChild className="btn-wedding">
              <Link to="/add-event">
                <Plus className="w-4 h-4 mr-2" />
                Add Event
              </Link>
            </Button>
          </div>

          {events.length === 0 ? (
            <div className="card-wedding text-center py-16">
              <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="font-display text-2xl font-semibold mb-2">No Events Yet</h2>
              <p className="text-muted-foreground mb-6">
                Start planning your perfect event by posting your first listing.
              </p>
              <Button asChild className="btn-wedding">
                <Link to="/add-event">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Event
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <div key={event.id} className="card-wedding">
                  <div className="flex items-start justify-between mb-4">
                    <Badge className={getStatusColor(event.status)}>
                      {event.status.replace('_', ' ')}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{event.event_type}</span>
                  </div>

                  <h3 className="font-display text-xl font-semibold text-foreground mb-4">
                    {event.event_name}
                  </h3>

                  <div className="space-y-2 text-sm text-muted-foreground">
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
                        ${event.budget.toLocaleString()}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-border">
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link to={`/event/${event.id}`}>View Details</Link>
                    </Button>
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