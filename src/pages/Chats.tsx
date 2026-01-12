import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, MessageCircle, Send, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

interface Chat {
  id: string;
  invite_id: string;
  user_id: string;
  organizer_id: string;
  other_user: { full_name: string; email: string } | null;
  last_message?: string;
}

interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export default function Chats() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate('/auth');
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) fetchChats();
  }, [user]);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.id);
      const channel = supabase
        .channel(`messages-${selectedChat.id}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${selectedChat.id}` }, (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [selectedChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchChats = async () => {
    const { data, error } = await supabase
      .from('chats')
      .select('id, invite_id, user_id, organizer_id')
      .or(`user_id.eq.${user?.id},organizer_id.eq.${user?.id}`);

    if (!error && data) {
      // Get all unique user IDs
      const userIds = data.map(chat => 
        chat.user_id === user?.id ? chat.organizer_id : chat.user_id
      );
      
      // Fetch all profiles in one query instead of N queries
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);
      
      // Map profiles to chats
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      const chatsWithUsers = data.map(chat => {
        const otherId = chat.user_id === user?.id ? chat.organizer_id : chat.user_id;
        return { ...chat, other_user: profileMap.get(otherId) || null };
      });
      
      setChats(chatsWithUsers);
    }
    setIsLoading(false);
  };

  const fetchMessages = async (chatId: string) => {
    const { data } = await supabase.from('messages').select('*').eq('chat_id', chatId).order('created_at', { ascending: true });
    if (data) setMessages(data);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !user) return;
    setIsSending(true);
    await supabase.from('messages').insert({ chat_id: selectedChat.id, sender_id: user.id, content: newMessage.trim() });
    setNewMessage('');
    setIsSending(false);
  };

  if (loading || isLoading) {
    return <Layout><div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></Layout>;
  }

  return (
    <Layout showFooter={false}>
      <div className="h-[calc(100vh-5rem)] flex">
        {/* Chat List */}
        <div className={`w-full md:w-80 border-r border-border bg-card ${selectedChat ? 'hidden md:block' : ''}`}>
          <div className="p-4 border-b border-border"><h2 className="font-display text-xl font-semibold">Messages</h2></div>
          {chats.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No conversations yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {chats.map((chat) => (
                <button key={chat.id} onClick={() => setSelectedChat(chat)} className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${selectedChat?.id === chat.id ? 'bg-muted' : ''}`}>
                  <p className="font-medium truncate">{chat.other_user?.full_name || 'User'}</p>
                  <p className="text-sm text-muted-foreground truncate">{chat.other_user?.email}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
          {selectedChat ? (
            <>
              <div className="p-4 border-b border-border flex items-center gap-3">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedChat(null)}><ArrowLeft className="w-5 h-5" /></Button>
                <div>
                  <p className="font-semibold">{selectedChat.other_user?.full_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedChat.other_user?.email}</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${msg.sender_id === user?.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      <p>{msg.content}</p>
                      <p className={`text-xs mt-1 ${msg.sender_id === user?.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{format(new Date(msg.created_at), 'p')}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="p-4 border-t border-border flex gap-2">
                <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-1" onKeyDown={(e) => e.key === 'Enter' && sendMessage()} />
                <Button onClick={sendMessage} disabled={isSending || !newMessage.trim()}><Send className="w-4 h-4" /></Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">Select a conversation</div>
          )}
        </div>
      </div>
    </Layout>
  );
}