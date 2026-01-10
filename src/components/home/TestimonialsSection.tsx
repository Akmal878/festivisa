import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Quote, Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Priya & Arjun',
    event: 'Wedding Reception',
    image: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=200&h=200&fit=crop',
    text: 'Festivisa made our wedding planning so smooth! We found the perfect venue within a week and the direct chat feature made communication effortless.',
    rating: 5,
  },
  {
    id: 2,
    name: 'Sneha & Rahul',
    event: 'Engagement Ceremony',
    image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=200&h=200&fit=crop',
    text: 'Amazing platform! The privacy feature gave us peace of mind. We could browse venues without being bombarded with calls. Highly recommended!',
    rating: 5,
  },
  {
    id: 3,
    name: 'Ananya & Vikram',
    event: 'Destination Wedding',
    image: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=200&h=200&fit=crop',
    text: 'Found our dream venue in Udaipur through Festivisa. The organizer was professional and the whole experience was magical. Thank you!',
    rating: 5,
  },
  {
    id: 4,
    name: 'Meera & Karan',
    event: 'Wedding & Sangeet',
    image: 'https://images.unsplash.com/photo-1604017011826-d3b4c23f8914?w=200&h=200&fit=crop',
    text: 'We were overwhelmed with wedding planning until we discovered Festivisa. The platform is intuitive and we connected with amazing venues!',
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="section-subheading justify-center">
            <span className="text-sm font-medium uppercase tracking-widest">Testimonials</span>
          </div>
          <h2 className="section-heading">Happy Couples, Perfect Events</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mt-6 text-lg">
            Read what our satisfied couples have to say about their experience with Festivisa.
          </p>
        </div>

        <Carousel
          opts={{
            align: 'center',
            loop: true,
          }}
          className="w-full max-w-5xl mx-auto"
        >
          <CarouselContent>
            {testimonials.map((testimonial) => (
              <CarouselItem key={testimonial.id} className="md:basis-1/2">
                <div className="card-premium h-full relative overflow-hidden">
                  {/* Quote icon */}
                  <Quote className="absolute top-6 right-6 w-12 h-12 text-primary/20" />
                  
                  {/* Rating */}
                  <div className="flex gap-1 mb-6">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                    ))}
                  </div>
                  
                  {/* Testimonial text */}
                  <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                    "{testimonial.text}"
                  </p>
                  
                  {/* Author */}
                  <div className="flex items-center gap-4 mt-auto">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full object-cover ring-4 ring-primary/20"
                    />
                    <div>
                      <h4 className="font-display text-xl font-semibold text-foreground">
                        {testimonial.name}
                      </h4>
                      <p className="text-muted-foreground">{testimonial.event}</p>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-12 bg-card shadow-medium hover:bg-primary hover:text-primary-foreground border-0" />
          <CarouselNext className="hidden md:flex -right-12 bg-card shadow-medium hover:bg-primary hover:text-primary-foreground border-0" />
        </Carousel>
      </div>
    </section>
  );
}
