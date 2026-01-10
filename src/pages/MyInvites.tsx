import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Building2, Check, X, MessageCircle, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { HotelDetailModal } from '@/components/invites/HotelDetailModal';

interface Invite {
  id: string;
  status: string;
  message: string | null;
  created_at: string;
  hotel: {
    id: string;
    name: string;
    image_url: string | null;
    city: string;
  };
  event: {
    id: string;
    event_name: string;
    event_date: string;
  };
}

export default function MyInvites() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);
  const [hotelModalOpen, setHotelModalOpen] = useState(false);
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
      fetchInvites();
      subscribeToInvites();
    }
  }, [user]);

  const fetchInvites = async () => {
    const { data, error } = await supabase
      .from('invites')
      .select(`
        id,
        status,
        message,
        created_at,
        hotel:hotels(id, name, image_url, city),
        event:events(id, event_name, event_date)
      `)
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching invites:', error);
    } else {
      setInvites(data as unknown as Invite[]);
    }
    setIsLoading(false);
  };

  const subscribeToInvites = () => {
    const channel = supabase
      .channel('invites-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invites',
          filter: `user_id=eq.${user?.id}`,
        },
        () => {
          fetchInvites();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleInviteAction = async (inviteId: string, action: 'accepted' | 'rejected') => {
    const invite = invites.find(i => i.id === inviteId);
    if (!invite) return;

    const { error: updateError } = await supabase
      .from('invites')
      .update({ status: action })
      .eq('id', inviteId);

    if (updateError) {
      toast({
        title: 'Error',
        description: 'Failed to update invite status.',
        variant: 'destructive',
      });
      return;
    }

    // If accepted, create a chat
    if (action === 'accepted') {
      const { data: inviteData } = await supabase
        .from('invites')
        .select('organizer_id')
        .eq('id', inviteId)
        .single();

      if (inviteData) {
        const { error: chatError } = await supabase.from('chats').insert({
          invite_id: inviteId,
          user_id: user?.id,
          organizer_id: inviteData.organizer_id,
        });

        if (chatError && !chatError.message.includes('duplicate')) {
          console.error('Error creating chat:', chatError);
        }
      }
    }

    toast({
      title: action === 'accepted' ? 'Invite Accepted!' : 'Invite Declined',
      description: action === 'accepted' 
        ? 'You can now chat with the venue organizer.'
        : 'The invitation has been declined.',
    });

    fetchInvites();
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
              My Invites
            </h1>
            <p className="text-muted-foreground mt-2">
              Review invitations from venue organizers.
            </p>
          </div>

          {invites.length === 0 ? (
            <div className="card-wedding text-center py-16">
              <Mail className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="font-display text-2xl font-semibold mb-2">No Invites Yet</h2>
              <p className="text-muted-foreground mb-6">
                When organizers show interest in your events, their invites will appear here.
              </p>
              <Button asChild variant="outline">
                <Link to="/my-events">View My Events</Link>
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

                  {/* Hotel info - clickable */}
                  <button
                    onClick={() => {
                      setSelectedHotelId(invite.hotel?.id);
                      setHotelModalOpen(true);
                    }}
                    className="flex items-center gap-3 mb-4 w-full text-left hover:bg-muted/50 rounded-lg p-2 -ml-2 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden relative">
                      {invite.hotel?.image_url ? (
                        <img
                          src={invite.hotel.image_url}
                          alt={invite.hotel.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-colors flex items-center justify-center">
                        <Eye className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {invite.hotel?.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{invite.hotel?.city}</p>
                    </div>
                    <Eye className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>

                  {/* Event info */}
                  <div className="bg-muted/50 rounded-lg p-3 mb-4">
                    <p className="text-sm font-medium">For: {invite.event?.event_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(invite.event?.event_date), 'PPP')}
                    </p>
                  </div>

                  {invite.message && (
                    <p className="text-sm text-muted-foreground mb-4 italic">
                      "{invite.message}"
                    </p>
                  )}

                  {invite.status === 'pending' ? (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleInviteAction(invite.id, 'accepted')}
                        className="flex-1"
                        size="sm"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Accept
                      </Button>
                      <Button
                        onClick={() => handleInviteAction(invite.id, 'rejected')}
                        variant="outline"
                        className="flex-1"
                        size="sm"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Decline
                      </Button>
                    </div>
                  ) : invite.status === 'accepted' ? (
                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm" className="flex-1">
                        <Link to={`/hotel/${invite.hotel?.id}`}>View Venue</Link>
                      </Button>
                      <Button asChild size="sm" className="flex-1">
                        <Link to="/chats">
                          <MessageCircle className="w-4 h-4 mr-1" />
                          Chat
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link to={`/hotel/${invite.hotel?.id}`}>View Venue</Link>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Hotel Detail Modal */}
      <HotelDetailModal
        hotelId={selectedHotelId}
        open={hotelModalOpen}
        onOpenChange={setHotelModalOpen}
      />
    </Layout>
  );
}