import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Building2, Calendar, Heart, Send, MessageCircle, Plus, TrendingUp, Users, Edit, MapPin, Image as ImageIcon } from 'lucide-react';

interface Hotel {
  id: string;
  name: string;
  description: string | null;
  address: string;
  city: string;
  image_url: string | null;
  image_urls: string[] | null;
  created_at: string;
}

export default function OrganizerDashboard() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalVenues: 0,
    sentInvites: 0,
    favorites: 0,
    totalEvents: 0,
  });
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (!loading && role !== 'organizer') {
      navigate('/');
    }
  }, [user, role, loading, navigate]);

  useEffect(() => {
    if (user && role === 'organizer') {
      fetchStats();
    }
  }, [user, role]);

  const fetchStats = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);

    try {
      // Fetch venues (not just count)
      const { data: venuesData, count: venueCount } = await supabase
        .from('hotels')
        .select('*', { count: 'exact' })
        .eq('organizer_id', user.id)
        .order('created_at', { ascending: false });

      setHotels(venuesData || []);

      // Fetch sent invites
      const { count: inviteCount } = await supabase
        .from('invites')
        .select('*', { count: 'exact', head: true })
        .eq('organizer_id', user.id);

      // Fetch favorites
      const { count: favoriteCount } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('organizer_id', user.id);

      // Fetch total open events
      const { count: eventCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');

      setStats({
        totalVenues: venueCount || 0,
        sentInvites: inviteCount || 0,
        favorites: favoriteCount || 0,
        totalEvents: eventCount || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen gradient-hero py-12">
        <div className="container mx-auto px-4">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-foreground mb-2">
              Organizer Dashboard
            </h1>
            <p className="text-muted-foreground text-lg">
              Welcome back! Manage your venues and connect with event planners.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="card-wedding p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalVenues}</p>
                  <p className="text-sm text-muted-foreground">Your Venues</p>
                </div>
              </div>
            </Card>

            <Card className="card-wedding p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                  <Send className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.sentInvites}</p>
                  <p className="text-sm text-muted-foreground">Sent Invites</p>
                </div>
              </div>
            </Card>

            <Card className="card-wedding p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.favorites}</p>
                  <p className="text-sm text-muted-foreground">Favorites</p>
                </div>
              </div>
            </Card>

            <Card className="card-wedding p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalEvents}</p>
                  <p className="text-sm text-muted-foreground">Open Events</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-2xl font-semibold">Your Venues</h2>
              <Link to="/add-hotel">
                <Button className="btn-gold gap-2">
                  <Plus className="w-5 h-5" />
                  Add New Venue
                </Button>
              </Link>
            </div>

            {hotels.length === 0 ? (
              <Card className="card-wedding p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-10 h-10 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">No Venues Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start by adding your first venue to attract event planners
                </p>
                <Link to="/add-hotel">
                  <Button className="btn-gold gap-2">
                    <Plus className="w-5 h-5" />
                    Add Your First Venue
                  </Button>
                </Link>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hotels.map((hotel) => (
                  <Card key={hotel.id} className="card-wedding overflow-hidden group hover:shadow-lg transition-shadow">
                    <div className="relative h-48 bg-muted overflow-hidden">
                      {hotel.image_url || (hotel.image_urls && hotel.image_urls[0]) ? (
                        <img
                          src={hotel.image_url || hotel.image_urls![0]}
                          alt={hotel.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                          <ImageIcon className="w-16 h-16 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="font-display text-xl font-semibold mb-2 line-clamp-1">{hotel.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                        <MapPin className="w-4 h-4" />
                        <span className="line-clamp-1">{hotel.city}</span>
                      </div>
                      {hotel.description && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {hotel.description}
                        </p>
                      )}
                      <Link to={`/add-hotel?edit=${hotel.id}`}>
                        <Button variant="outline" className="w-full gap-2">
                          <Edit className="w-4 h-4" />
                          Edit Venue
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <div className="mb-8">
            <h2 className="font-display text-2xl font-semibold mb-4">Quick Access</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link to="/all-events">
                <Card className="card-wedding p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                      <Calendar className="w-7 h-7 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Browse Events</h3>
                      <p className="text-sm text-muted-foreground">{stats.totalEvents} open events</p>
                    </div>
                  </div>
                </Card>
              </Link>

              <Link to="/sent-invites">
                <Card className="card-wedding p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Send className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Sent Invites</h3>
                      <p className="text-sm text-muted-foreground">{stats.sentInvites} sent</p>
                    </div>
                  </div>
                </Card>
              </Link>

              <Link to="/chats">
                <Card className="card-wedding p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                      <MessageCircle className="w-7 h-7 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Messages</h3>
                      <p className="text-sm text-muted-foreground">Chat with clients</p>
                    </div>
                  </div>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
