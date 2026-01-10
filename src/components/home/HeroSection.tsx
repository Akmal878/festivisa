import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth';

const heroSlides = [
  {
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1920&h=1080&fit=crop',
    title: 'Create Unforgettable Moments',
    subtitle: 'Premium venues for your perfect celebration',
  },
  {
    image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1920&h=1080&fit=crop',
    title: 'Your Dream Venue Awaits',
    subtitle: 'Connect with the finest event organizers',
  },
  {
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&h=1080&fit=crop',
    title: 'Celebrate in Style',
    subtitle: 'Discover handpicked venues across Pakistan',
  },
];

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { user, role } = useAuth();

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Slides */}
      {heroSlides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-1000 ${
            index === currentSlide 
              ? 'opacity-100 translate-x-0' 
              : index < currentSlide 
                ? 'opacity-0 -translate-x-full' 
                : 'opacity-0 translate-x-full'
          }`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
      ))}

      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="container mx-auto px-4 text-center text-white">
          {/* Premium badge */}
          <div className="inline-flex items-center gap-2 mb-6 animate-fade-in-up">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium uppercase tracking-widest text-primary">
              Premium Event Planning
            </span>
            <Sparkles className="w-5 h-5 text-primary" />
          </div>

          {/* Title */}
          <h1 
            key={currentSlide}
            className="font-display text-5xl md:text-6xl lg:text-7xl font-medium mb-6 animate-slide-up"
          >
            {heroSlides[currentSlide].title}
          </h1>

          {/* Subtitle */}
          <p 
            key={`sub-${currentSlide}`}
            className="text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto animate-slide-up stagger-1"
          >
            {heroSlides[currentSlide].subtitle}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up stagger-2">
            <Button asChild className="btn-gold text-lg px-10 py-6">
              <Link to={role === 'organizer' ? '/all-events' : '/add-event'}>
                {role === 'organizer' ? 'Browse Events' : 'Post Your Event'}
              </Link>
            </Button>
            {!user && (
              <Button 
                asChild 
                variant="outline" 
                className="rounded-full border-2 border-white/50 bg-transparent text-white hover:bg-white/10 hover:border-white px-10 py-6 text-lg"
              >
                <Link to="/auth">
                  Sign In
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentSlide
                ? 'w-8 h-3 bg-primary'
                : 'w-3 h-3 bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
