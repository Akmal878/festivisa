import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Building2, Calendar, Heart, Send, MessageCircle, Plus, TrendingUp, Users } from 'lucide-react';

export default function OrganizerDashboard() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalVenues: 0,
    sentInvites: 0,
    favorites: 0,
    totalEvents: 0,
  });
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
    setIsLoading(true);

    // Fetch total venues
    const { count: venueCount } = await supabase
      .from('hotels')
      .select('*', { count: 'exact', head: true })
      .eq('organizer_id', user?.id);

    // Fetch sent invites
    const { count: inviteCount } = await supabase
      .from('invites')
      .select('*', { count: 'exact', head: true })
      .eq('organizer_id', user?.id);

    // Fetch favorites
    const { count: favoriteCount } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('organizer_id', user?.id);

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

    setIsLoading(false);
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
            <h2 className="font-display text-2xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link to="/add-hotel">
                <Card className="card-wedding p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Plus className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Add New Venue</h3>
                      <p className="text-sm text-muted-foreground">List your venue</p>
                    </div>
                  </div>
                </Card>
              </Link>

              <Link to="/all-events">
                <Card className="card-wedding p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                      <Calendar className="w-7 h-7 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Browse Events</h3>
                      <p className="text-sm text-muted-foreground">Find opportunities</p>
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

          {/* Navigation Cards */}
          <div className="mb-8">
            <h2 className="font-display text-2xl font-semibold mb-4">Manage Your Business</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Link to="/sent-invites">
                <Card className="card-wedding p-8 hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-primary/20">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl gradient-gold flex items-center justify-center flex-shrink-0">
                      <Send className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-semibold mb-2">Sent Invites</h3>
                      <p className="text-muted-foreground">
                        Track your sent invitations and manage responses from event planners.
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>

              <Link to="/favorites">
                <Card className="card-wedding p-8 hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-primary/20">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-destructive/80 to-destructive flex items-center justify-center flex-shrink-0">
                      <Heart className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-semibold mb-2">Favorite Events</h3>
                      <p className="text-muted-foreground">
                        View and manage events you've saved for future opportunities.
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            </div>
          </div>

          {/* Help Section */}
          <Card className="card-wedding p-8 bg-gradient-to-br from-primary/5 to-transparent border-2 border-primary/20">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="font-display text-2xl font-semibold mb-2">Need Help Getting Started?</h3>
                <p className="text-muted-foreground">
                  Learn how to maximize your presence and connect with more event planners.
                </p>
              </div>
              <Button size="lg" className="btn-gold">
                View Guide
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
