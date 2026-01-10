import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

export function CTASection() {
  return (
    <section className="py-24 gradient-gold text-charcoal relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-40 h-40 rounded-full border-2 border-current" />
        <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full border-2 border-current" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-current" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <Sparkles className="w-14 h-14 mx-auto mb-6 opacity-80" />
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-medium mb-6">
            Ready to Create Your Perfect Event?
          </h2>
          <p className="text-charcoal/80 text-lg md:text-xl mb-10 max-w-xl mx-auto">
            Join thousands of happy couples and event planners who found their perfect venue through Festivisa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="rounded-full px-10 py-6 text-lg bg-charcoal text-white hover:bg-charcoal/90"
            >
              <Link to="/add-event">
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full px-10 py-6 text-lg border-2 border-charcoal/30 bg-transparent text-charcoal hover:bg-charcoal/10"
            >
              <Link to="/auth?role=organizer">
                Join as Organizer
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
