import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogIn, LogOut, User, Building2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, role, signOut, loading } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-charcoal/90 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            <span className="font-display text-2xl font-semibold text-white">Festivisa</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {!loading && user && role === 'user' && (
              <>
                <Link to="/add-event" className="text-sm font-medium text-white/70 hover:text-primary transition-colors">
                  Add Event
                </Link>
                <Link to="/my-events" className="text-sm font-medium text-white/70 hover:text-primary transition-colors">
                  My Events
                </Link>
                <Link to="/recommendations" className="text-sm font-medium text-white/70 hover:text-primary transition-colors">
                  Recommendations
                </Link>
                <Link to="/my-invites" className="text-sm font-medium text-white/70 hover:text-primary transition-colors">
                  Invites
                </Link>
              </>
            )}
            {!loading && user && role === 'organizer' && (
              <>
                <Link to="/organizer-dashboard" className="text-sm font-medium text-white/70 hover:text-primary transition-colors">
                  Dashboard
                </Link>
                <Link to="/add-hotel" className="text-sm font-medium text-white/70 hover:text-primary transition-colors">
                  Add Venue
                </Link>
                <Link to="/all-events" className="text-sm font-medium text-white/70 hover:text-primary transition-colors">
                  Browse Events
                </Link>
                <Link to="/favorites" className="text-sm font-medium text-white/70 hover:text-primary transition-colors">
                  Favorites
                </Link>
                <Link to="/sent-invites" className="text-sm font-medium text-white/70 hover:text-primary transition-colors">
                  Sent Invites
                </Link>
              </>
            )}
            {!loading && user && (
              <Link to="/chats" className="text-sm font-medium text-white/70 hover:text-primary transition-colors">
                Messages
              </Link>
            )}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-4">
            {!loading && user ? (
              <div className="flex items-center gap-4">
                {!loading && role === 'user' && (
                  <Link to="/profile" className="flex items-center gap-2 text-sm text-white/70 hover:text-primary transition-colors">
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSignOut}
                  className="text-white/70 hover:text-white hover:bg-white/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <>
                <Button asChild variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button asChild className="btn-gold">
                  <Link to="/add-event">Post Your Event</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-white/10 animate-fade-in">
            <nav className="flex flex-col gap-4">
              {!loading && user && role === 'user' && (
                <>
                  <Link to="/add-event" className="text-sm font-medium text-white/70 hover:text-primary" onClick={() => setIsOpen(false)}>
                    Add Event
                  </Link>
                  <Link to="/my-events" className="text-sm font-medium text-white/70 hover:text-primary" onClick={() => setIsOpen(false)}>
                    My Events
                  </Link>
                  <Link to="/recommendations" className="text-sm font-medium text-white/70 hover:text-primary" onClick={() => setIsOpen(false)}>
                    Recommendations
                  </Link>
                  <Link to="/my-invites" className="text-sm font-medium text-white/70 hover:text-primary" onClick={() => setIsOpen(false)}>
                    Invites
                  </Link>
                </>
              )}
              {!loading && user && role === 'organizer' && (
                <>
                  <Link to="/organizer-dashboard" className="text-sm font-medium text-white/70 hover:text-primary" onClick={() => setIsOpen(false)}>
                    Dashboard
                  </Link>
                  <Link to="/add-hotel" className="text-sm font-medium text-white/70 hover:text-primary" onClick={() => setIsOpen(false)}>
                    Add Venue
                  </Link>
                  <Link to="/all-events" className="text-sm font-medium text-white/70 hover:text-primary" onClick={() => setIsOpen(false)}>
                    Browse Events
                  </Link>
                  <Link to="/favorites" className="text-sm font-medium text-white/70 hover:text-primary" onClick={() => setIsOpen(false)}>
                    Favorites
                  </Link>
                  <Link to="/sent-invites" className="text-sm font-medium text-white/70 hover:text-primary" onClick={() => setIsOpen(false)}>
                    Sent Invites
                  </Link>
                </>
              )}
              {!loading && user && (
                <>
                  <Link to="/chats" className="text-sm font-medium text-white/70 hover:text-primary" onClick={() => setIsOpen(false)}>
                    Messages
                  </Link>
                  {!loading && role === 'user' && (
                    <Link to="/profile" className="text-sm font-medium text-white/70 hover:text-primary" onClick={() => setIsOpen(false)}>
                      My Profile
                    </Link>
                  )}
                </>
              )}
              {!loading && user ? (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => { handleSignOut(); setIsOpen(false); }}
                  className="text-white/70 hover:text-white w-fit"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button asChild variant="ghost" className="text-white/70 hover:text-white w-fit">
                    <Link to="/auth" onClick={() => setIsOpen(false)}>Sign In</Link>
                  </Button>
                  <Button asChild className="btn-gold w-fit">
                    <Link to="/add-event" onClick={() => setIsOpen(false)}>Post Your Event</Link>
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
