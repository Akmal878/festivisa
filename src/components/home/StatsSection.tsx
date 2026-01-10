import { Users, Building2, Heart, MapPin } from 'lucide-react';

const stats = [
  {
    icon: Users,
    value: '10,000+',
    label: 'Happy Couples',
  },
  {
    icon: Building2,
    value: '500+',
    label: 'Premium Venues',
  },
  {
    icon: Heart,
    value: '15,000+',
    label: 'Events Hosted',
  },
  {
    icon: MapPin,
    value: '50+',
    label: 'Cities Covered',
  },
];

export function StatsSection() {
  return (
    <section className="py-20 gradient-gold">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="text-center group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-charcoal/10 mb-4 group-hover:bg-charcoal/20 transition-colors">
                <stat.icon className="w-8 h-8 text-charcoal" />
              </div>
              <div className="font-display text-4xl md:text-5xl font-bold text-charcoal mb-2">
                {stat.value}
              </div>
              <div className="text-charcoal/70 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
