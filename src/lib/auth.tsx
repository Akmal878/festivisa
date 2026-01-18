import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AppRole = 'user' | 'organizer';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata: {
    full_name: string;
    phone?: string;
    address?: string;
    role: AppRole;
  }) => Promise<{ data: any; error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session first
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchUserRole(session.user.id);
      }
      setLoading(false);
    });

    // Set up auth state listener for subsequent changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setLoading(true); // Set loading during auth change
        setSession(session);
        setUser(session?.user ?? null);
        
        // Fetch role if user exists, otherwise clear it
        if (session?.user) {
          await fetchUserRole(session.user.id);
        } else {
          setRole(null);
        }
        
        setLoading(false); // Clear loading after processing
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    console.log('Fetching role for user:', userId);
    try {
      // Add timeout to prevent infinite hang
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Role fetch timeout')), 5000)
      );
      
      const queryPromise = supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      console.log('Role fetch result:', { data, error });
      if (!error && data) {
        setRole(data.role as AppRole);
        console.log('Role set to:', data.role);
      } else {
        console.error('Failed to fetch role or no role found:', error);
        // If no role found, default to 'user'
        if (!data && !error) {
          console.warn('No role found, defaulting to user');
          setRole('user');
        } else {
          // On error, try to infer from metadata or default to user
          setRole('user');
        }
      }
    } catch (err) {
      console.error('Exception fetching role:', err);
      setRole('user'); // Fallback to user role
    }
  };

  const signUp = async (
    email: string,
    password: string,
    metadata: {
      full_name: string;
      phone?: string;
      address?: string;
      role: AppRole;
    }
  ) => {
    // Use VITE_SITE_URL for production, fallback to window.location.origin for development
    const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
    const redirectUrl = `${siteUrl}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: metadata,
      },
    });

    // Return both data and error so we can check if email confirmation is needed
    return { data, error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error: error as Error | null };
  };

  const signOut = async () => {
    try {
      // Clear state first
      setUser(null);
      setSession(null);
      setRole(null);
      
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to sign out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, role, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}