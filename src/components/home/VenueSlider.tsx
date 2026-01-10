import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Star, MapPin } from 'lucide-react';

const venues = [
  {
    id: 1,
    name: 'Grand Palace Hotel',
    location: 'Karachi, Pakistan',
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&h=500&fit=crop',
    rating: 4.9,
    price: '₨2,50,000',
  },
  {
    id: 2,
    name: 'Royal Garden Resort',
    location: 'Lahore, Pakistan',
    image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&h=500&fit=crop',
    rating: 4.8,
    price: '₨1,80,000',
  },
  {
    id: 3,
    name: 'Lakeside Paradise',
    location: 'Islamabad, Pakistan',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=500&fit=crop',
    rating: 4.9,
    price: '₨3,20,000',
  },
  {
    id: 4,
    name: 'Sunset Beach Resort',
    location: 'Karachi, Pakistan',
    image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&h=500&fit=crop',
    rating: 4.7,
    price: '₨2,00,000',
  },
  {
    id: 5,
    name: 'Mountain View Estate',
    location: 'Murree, Pakistan',
    image: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800&h=500&fit=crop',
    rating: 4.8,
    price: '₨1,50,000',
  },
];

export function VenueSlider() {
  return (
    <section className="py-24 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="section-subheading justify-center">
            <span className="text-sm font-medium uppercase tracking-widest">Featured Venues</span>
          </div>
          <h2 className="section-heading">Discover Premium Venues</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mt-6 text-lg">
            Explore our handpicked selection of stunning wedding and event venues across Pakistan.
          </p>
        </div>

        <Carousel
          opts={{
            align: 'start',
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {venues.map((venue) => (
              <CarouselItem key={venue.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <div className="group relative overflow-hidden rounded-3xl shadow-medium hover:shadow-strong transition-all duration-500">
                  {/* Image */}
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={venue.image}
                      alt={venue.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/30 to-transparent" />
                  
                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-4 h-4 fill-primary text-primary" />
                      <span className="text-sm font-medium">{venue.rating}</span>
                    </div>
                    <h3 className="font-display text-2xl font-semibold mb-1">{venue.name}</h3>
                    <div className="flex items-center gap-1 text-white/80 text-sm mb-3">
                      <MapPin className="w-4 h-4" />
                      {venue.location}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-primary">
                        From {venue.price}
                      </span>
                    </div>
                  </div>
                  
                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-4 bg-card shadow-medium hover:bg-primary hover:text-primary-foreground border-0" />
          <CarouselNext className="hidden md:flex -right-4 bg-card shadow-medium hover:bg-primary hover:text-primary-foreground border-0" />
        </Carousel>
      </div>
    </section>
  );
}
