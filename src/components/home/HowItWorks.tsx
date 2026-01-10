import { FileEdit, Search, Send, MessageCircle } from 'lucide-react';

const steps = [
  {
    icon: FileEdit,
    number: '1',
    title: 'Post Your Event',
    description: 'Fill in your event details, budget, and requirements.',
  },
  {
    icon: Search,
    number: '2',
    title: 'Browse & Discover',
    description: 'Organizers explore your event and find the perfect match.',
  },
  {
    icon: Send,
    number: '3',
    title: 'Receive Invites',
    description: 'Get invitations from interested organizers with their venues.',
  },
  {
    icon: MessageCircle,
    number: '4',
    title: 'Connect & Chat',
    description: 'Accept invites to start direct conversation with organizers.',
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 bg-charcoal text-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="section-subheading justify-center">
            <span className="text-sm font-medium uppercase tracking-widest">Simple Process</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-medium">
            How It Works
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto mt-6 text-lg">
            From posting your event to celebrating the big day, we make the journey seamless.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.title} className="relative group">
              {/* Connection line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-full h-px bg-gradient-to-r from-primary/50 to-transparent" />
              )}
              
              <div className="text-center relative">
                <div className="relative inline-flex mb-6">
                  <div className="w-24 h-24 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center group-hover:border-primary/50 transition-colors duration-300">
                    <step.icon className="w-10 h-10 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-10 h-10 rounded-full gradient-gold text-charcoal text-lg font-bold flex items-center justify-center shadow-glow">
                    {step.number}
                  </span>
                </div>
                <h3 className="font-display text-2xl font-semibold mb-3">
                  {step.title}
                </h3>
                <p className="text-white/60 max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
