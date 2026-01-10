import { Calendar, Building2, MessageCircle, Heart, Shield, Sparkles } from 'lucide-react';

const features = [
  {
    icon: Calendar,
    title: 'Post Your Event',
    description: 'Share your event details and requirements with premium organizers looking to make your celebration perfect.',
  },
  {
    icon: Building2,
    title: 'Premium Venues',
    description: 'Browse curated hotels and venues with stunning halls, elegant parking, and exceptional amenities.',
  },
  {
    icon: MessageCircle,
    title: 'Direct Communication',
    description: 'Connect directly with organizers through our secure chat platform after accepting their invite.',
  },
  {
    icon: Shield,
    title: 'Privacy Protected',
    description: 'Your personal information stays private until you choose to accept an organizer\'s invitation.',
  },
  {
    icon: Heart,
    title: 'Verified Reviews',
    description: 'Read authentic reviews from past clients to make informed decisions about your venue.',
  },
  {
    icon: Sparkles,
    title: 'All-Inclusive Services',
    description: 'From decorations to fireworks, our organizers offer complete event solutions.',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="section-subheading justify-center">
            <span className="text-sm font-medium uppercase tracking-widest">Why Choose Us</span>
          </div>
          <h2 className="section-heading">
            Crafting Perfect Celebrations
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mt-6 text-lg">
            We connect event hosts with premium organizers, ensuring every celebration is handled with care and excellence.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="card-premium group text-center"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-16 h-16 rounded-2xl gradient-gold flex items-center justify-center mb-6 mx-auto group-hover:shadow-glow transition-all duration-300">
                <feature.icon className="w-8 h-8 text-charcoal" />
              </div>
              <h3 className="font-display text-2xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
