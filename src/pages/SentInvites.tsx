import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Send, MessageCircle, Calendar, Users, MapPin, Phone, Mail } from 'lucide-react';
import { format } from 'date-fns';

interface SentInvite {
  id: string;
  status: string;
  message: string | null;
  created_at: string;
  event: {
    id: string;
    event_name: string;
    event_type: string;
    event_date: string;
    guest_count: number;
    location: string;
  };
  user_profile: {
    full_name: string;
    email: string;
    phone: string | null;
    address: string | null;
  } | null;
}

export default function SentInvites() {
  const [invites, setInvites] = useState<SentInvite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (!loading && role !== 'organizer') {
      navigate('/');
    }
  }, [user, role, loading, navigate]);

  useEffect(() => {
    if (user && role === 'organizer') {
      fetchInvites();
    }
  }, [user, role]);

  const fetchInvites = async () => {
    const { data, error } = await supabase
      .from('invites')
      .select(`
        id,
        status,
        message,
        created_at,
        user_id,
        event:events(id, event_name, event_type, event_date, guest_count, location)
      `)
      .eq('organizer_id', user?.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching invites:', error);
      setIsLoading(false);
      return;
    }

    // Fetch user profiles only for accepted invites
    const invitesWithProfiles = await Promise.all(
      (data || []).map(async (invite) => {
        if (invite.status === 'accepted') {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email, phone, address')
            .eq('id', invite.user_id)
            .single();

          return {
            ...invite,
            user_profile: profile,
          };
        }
        return {
          ...invite,
          user_profile: null,
        };
      })
    );

    setInvites(invitesWithProfiles as unknown as SentInvite[]);
    setIsLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
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
          <div className="mb-8">
            <h1 className="font-display text-4xl font-semibold text-foreground">
              Sent Invites
            </h1>
            <p className="text-muted-foreground mt-2">
              Track your invitations and connect with accepted clients.
            </p>
          </div>

          {invites.length === 0 ? (
            <div className="card-wedding text-center py-16">
              <Send className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="font-display text-2xl font-semibold mb-2">No Invites Sent</h2>
              <p className="text-muted-foreground mb-6">
                Browse events and send invitations to get started.
              </p>
              <Button asChild>
                <Link to="/all-events">Browse Events</Link>
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {invites.map((invite) => (
                <div key={invite.id} className="card-wedding">
                  <div className="flex items-start justify-between mb-4">
                    <Badge className={getStatusColor(invite.status)}>
                      {invite.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(invite.created_at), 'PP')}
                    </span>
                  </div>

                  <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                    {invite.event?.event_name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">{invite.event?.event_type}</p>

                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(invite.event?.event_date), 'PPP')}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {invite.event?.guest_count} guests
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {invite.event?.location}
                    </div>
                  </div>

                  {/* Show user info only if accepted */}
                  {invite.status === 'accepted' && invite.user_profile && (
                    <div className="bg-green-50 rounded-lg p-3 mb-4 space-y-2">
                      <p className="font-medium text-green-800">{invite.user_profile.full_name}</p>
                      <div className="flex items-center gap-2 text-sm text-green-700">
                        <Mail className="w-3 h-3" />
                        {invite.user_profile.email}
                      </div>
                      {invite.user_profile.phone && (
                        <div className="flex items-center gap-2 text-sm text-green-700">
                          <Phone className="w-3 h-3" />
                          {invite.user_profile.phone}
                        </div>
                      )}
                    </div>
                  )}

                  {invite.status === 'accepted' ? (
                    <Button asChild size="sm" className="w-full">
                      <Link to="/chats">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Open Chat
                      </Link>
                    </Button>
                  ) : invite.status === 'pending' ? (
                    <p className="text-center text-sm text-muted-foreground">
                      Waiting for response...
                    </p>
                  ) : (
                    <p className="text-center text-sm text-destructive">
                      Invitation declined
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}