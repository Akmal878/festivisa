-- Create role enum
CREATE TYPE public.app_role AS ENUM ('user', 'organizer');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE(user_id, role)
);

-- Create hotels table (organizer venues)
CREATE TABLE public.hotels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  image_url TEXT,
  parking_details TEXT,
  parking_images TEXT[],
  menu_details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create hotel halls table
CREATE TABLE public.hotel_halls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID REFERENCES public.hotels(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  description TEXT,
  images TEXT[],
  price_per_event DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create hotel reviews table
CREATE TABLE public.hotel_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID REFERENCES public.hotels(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create events table (user event requests)
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_name TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_date DATE NOT NULL,
  guest_count INTEGER NOT NULL,
  budget DECIMAL(12,2),
  location TEXT NOT NULL,
  requirements TEXT,
  hotel_decoration BOOLEAN DEFAULT FALSE,
  fireworks BOOLEAN DEFAULT FALSE,
  catering BOOLEAN DEFAULT FALSE,
  photography BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invites table
CREATE TABLE public.invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  hotel_id UUID REFERENCES public.hotels(id) ON DELETE CASCADE NOT NULL,
  organizer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create favorites table (organizer saved events)
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organizer_id, event_id)
);

-- Create chats table
CREATE TABLE public.chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_id UUID REFERENCES public.invites(id) ON DELETE CASCADE NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organizer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotel_halls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotel_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, address)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    NEW.email,
    NEW.raw_user_meta_data ->> 'phone',
    NEW.raw_user_meta_data ->> 'address'
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, (NEW.raw_user_meta_data ->> 'role')::app_role);
  
  RETURN NEW;
END;
$$;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Update triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_hotels_updated_at BEFORE UPDATE ON public.hotels FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_invites_updated_at BEFORE UPDATE ON public.invites FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- PROFILES POLICIES
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- USER ROLES POLICIES
CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- HOTELS POLICIES
CREATE POLICY "Anyone can view hotels" ON public.hotels FOR SELECT TO authenticated USING (true);
CREATE POLICY "Organizers can insert own hotels" ON public.hotels FOR INSERT TO authenticated WITH CHECK (auth.uid() = organizer_id AND public.has_role(auth.uid(), 'organizer'));
CREATE POLICY "Organizers can update own hotels" ON public.hotels FOR UPDATE TO authenticated USING (auth.uid() = organizer_id);
CREATE POLICY "Organizers can delete own hotels" ON public.hotels FOR DELETE TO authenticated USING (auth.uid() = organizer_id);

-- HOTEL HALLS POLICIES
CREATE POLICY "Anyone can view halls" ON public.hotel_halls FOR SELECT TO authenticated USING (true);
CREATE POLICY "Organizers can manage own halls" ON public.hotel_halls FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.hotels WHERE id = hotel_id AND organizer_id = auth.uid()));
CREATE POLICY "Organizers can update own halls" ON public.hotel_halls FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.hotels WHERE id = hotel_id AND organizer_id = auth.uid()));
CREATE POLICY "Organizers can delete own halls" ON public.hotel_halls FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.hotels WHERE id = hotel_id AND organizer_id = auth.uid()));

-- HOTEL REVIEWS POLICIES
CREATE POLICY "Anyone can view reviews" ON public.hotel_reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can add reviews" ON public.hotel_reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.hotel_reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- EVENTS POLICIES
CREATE POLICY "Users can view own events" ON public.events FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Organizers can view open events" ON public.events FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'organizer') AND status = 'open');
CREATE POLICY "Users can create events" ON public.events FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND public.has_role(auth.uid(), 'user'));
CREATE POLICY "Users can update own events" ON public.events FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- INVITES POLICIES
CREATE POLICY "Users can view invites to their events" ON public.invites FOR SELECT TO authenticated USING (auth.uid() = user_id OR auth.uid() = organizer_id);
CREATE POLICY "Organizers can send invites" ON public.invites FOR INSERT TO authenticated WITH CHECK (auth.uid() = organizer_id AND public.has_role(auth.uid(), 'organizer'));
CREATE POLICY "Participants can update invite status" ON public.invites FOR UPDATE TO authenticated USING (auth.uid() = user_id OR auth.uid() = organizer_id);

-- FAVORITES POLICIES
CREATE POLICY "Organizers can view own favorites" ON public.favorites FOR SELECT TO authenticated USING (auth.uid() = organizer_id);
CREATE POLICY "Organizers can add favorites" ON public.favorites FOR INSERT TO authenticated WITH CHECK (auth.uid() = organizer_id AND public.has_role(auth.uid(), 'organizer'));
CREATE POLICY "Organizers can remove favorites" ON public.favorites FOR DELETE TO authenticated USING (auth.uid() = organizer_id);

-- CHATS POLICIES
CREATE POLICY "Participants can view own chats" ON public.chats FOR SELECT TO authenticated USING (auth.uid() = user_id OR auth.uid() = organizer_id);
CREATE POLICY "System can create chats" ON public.chats FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR auth.uid() = organizer_id);

-- MESSAGES POLICIES
CREATE POLICY "Participants can view chat messages" ON public.messages FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.chats WHERE id = chat_id AND (user_id = auth.uid() OR organizer_id = auth.uid())));
CREATE POLICY "Participants can send messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.chats WHERE id = chat_id AND (user_id = auth.uid() OR organizer_id = auth.uid())));
CREATE POLICY "Participants can update messages" ON public.messages FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.chats WHERE id = chat_id AND (user_id = auth.uid() OR organizer_id = auth.uid())));

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.invites;

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true);

-- Storage policies
CREATE POLICY "Anyone can view images" ON storage.objects FOR SELECT USING (bucket_id = 'images');
CREATE POLICY "Authenticated users can upload images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'images');
CREATE POLICY "Users can update own images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'images');
CREATE POLICY "Users can delete own images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'images');