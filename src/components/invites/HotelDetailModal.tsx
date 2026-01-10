import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Users, Car, UtensilsCrossed, Star, Loader2, ImageIcon, Phone, Mail, User } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

interface Hall {
  id: string;
  name: string;
  capacity: number;
  price_per_event: number | null;
  description: string | null;
  images: string[] | null;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profile: {
    full_name: string;
    avatar_url: string | null;
  };
}

interface HotelDetails {
  id: string;
  name: string;
  description: string | null;
  address: string;
  city: string;
  image_url: string | null;
  image_urls: string[] | null;
  video_urls: string[] | null;
  parking_details: string | null;
  parking_images: string[] | null;
  menu_details: string | null;
  organizer_id: string;
  hotel_halls: Hall[];
  hotel_reviews: Review[];
  menu_bundles?: MenuBundle[];
  organizer_profile?: {
    full_name: string;
    email: string;
    phone: string | null;
    address: string | null;
    avatar_url: string | null;
  };
}

interface MenuBundle {
  id: string;
  name: string;
  chicken_dish: string;
  rice_dish: string;
  additional_main_dishes: string[] | null;
  include_drinks: boolean | null;
  include_raita: boolean | null;
  include_salad: boolean | null;
  include_cream_salad: boolean | null;
  include_sweet_dish: boolean | null;
  sweet_dish_type: string | null;
  include_tea: boolean | null;
  include_table_service: boolean | null;
  custom_optional_items: string[] | null;
  final_price: number;
}

interface HotelDetailModalProps {
  hotelId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HotelDetailModal({ hotelId, open, onOpenChange }: HotelDetailModalProps) {
  const [hotel, setHotel] = useState<HotelDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (hotelId && open) {
      console.log('Fetching hotel details for ID:', hotelId);
      fetchHotelDetails();
    } else if (!hotelId && open) {
      console.error('No hotel ID provided');
      setErrorMessage('No hotel ID provided');
    }
  }, [hotelId, open]);

  const fetchHotelDetails = async () => {
    if (!hotelId) {
      setErrorMessage('No hotel ID provided');
      return;
    }
    
    setIsLoading(true);
    setErrorMessage(null);
    console.log('Fetching hotel with ID:', hotelId);
    
    const { data, error } = await supabase
      .from('hotels')
      .select(`
        *,
        hotel_halls(*),
        hotel_reviews(
          id,
          rating,
          comment,
          created_at,
          user_id
        )
      `)
      .eq('id', hotelId)
      .single();

    if (error) {
      console.error('Error fetching hotel details:', error);
      setErrorMessage(error.message || 'Failed to load hotel details');
      setHotel(null);
      setIsLoading(false);
      return;
    }

    if (!data) {
      console.error('No hotel data found for ID:', hotelId);
      setErrorMessage('Hotel not found');
      setHotel(null);
      setIsLoading(false);
      return;
    }

    console.log('Hotel data loaded:', data);

    // Try to fetch menu bundles separately (may not exist in all databases)
    try {
      const { data: bundlesData } = await supabase
        .from('menu_bundles')
        .select('*')
        .eq('hotel_id', hotelId);
      
      if (bundlesData) {
        data.menu_bundles = bundlesData;
      }
    } catch (bundleError) {
      console.log('Menu bundles not available:', bundleError);
      // Continue without menu bundles
    }

    // Fetch profiles for reviews
    if (data.hotel_reviews && data.hotel_reviews.length > 0) {
      const userIds = data.hotel_reviews.map((r: any) => r.user_id);
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      if (profilesData) {
        data.hotel_reviews = data.hotel_reviews.map((review: any) => ({
          ...review,
          profile: profilesData.find((p: any) => p.id === review.user_id) || null
        }));
      }
    }

    // Fetch organizer profile separately
    if (data.organizer_id) {
      const { data: organizerData, error: orgError } = await supabase
        .from('profiles')
        .select('full_name, email, phone, address, avatar_url')
        .eq('id', data.organizer_id)
        .single();

      if (!orgError && organizerData) {
        data.organizer_profile = organizerData;
      }
    }

    setHotel(data as unknown as HotelDetails);
    setIsLoading(false);
  };

  const averageRating = hotel?.hotel_reviews?.length
    ? (hotel.hotel_reviews.reduce((acc, r) => acc + r.rating, 0) / hotel.hotel_reviews.length).toFixed(1)
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : hotel ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">{hotel.name}</DialogTitle>
            </DialogHeader>

            {/* Image Gallery with Carousel */}
            {((hotel.image_urls && hotel.image_urls.length > 0) || hotel.image_url) && (
              <div className="space-y-3">
                <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-primary" />
                  Venue Photos
                </h3>
                <Carousel className="w-full">
                  <CarouselContent>
                    {hotel.image_urls && hotel.image_urls.length > 0 ? (
                      hotel.image_urls.map((img, idx) => (
                        <CarouselItem key={idx}>
                          <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
                            <img
                              src={img}
                              alt={`${hotel.name} - Photo ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {averageRating && idx === 0 && (
                              <Badge className="absolute top-4 right-4 bg-background/90 text-foreground shadow-lg">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                                {averageRating} ({hotel.hotel_reviews.length})
                              </Badge>
                            )}
                          </div>
                        </CarouselItem>
                      ))
                    ) : hotel.image_url ? (
                      <CarouselItem>
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
                          <img
                            src={hotel.image_url}
                            alt={hotel.name}
                            className="w-full h-full object-cover"
                          />
                          {averageRating && (
                            <Badge className="absolute top-4 right-4 bg-background/90 text-foreground shadow-lg">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                              {averageRating} ({hotel.hotel_reviews.length})
                            </Badge>
                          )}
                        </div>
                      </CarouselItem>
                    ) : null}
                  </CarouselContent>
                  {(hotel.image_urls && hotel.image_urls.length > 1) && (
                    <>
                      <CarouselPrevious className="left-2" />
                      <CarouselNext className="right-2" />
                    </>
                  )}
                </Carousel>
              </div>
            )}

            {/* Videos Section */}
            {hotel.video_urls && hotel.video_urls.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-primary" />
                  Venue Videos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hotel.video_urls.map((video, idx) => (
                    <div key={idx} className="rounded-xl overflow-hidden bg-black border border-border">
                      <video
                        src={video}
                        controls
                        className="w-full aspect-video object-contain"
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location & Description */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{hotel.address}, {hotel.city}</span>
              </div>
              {hotel.description && (
                <p className="text-muted-foreground">{hotel.description}</p>
              )}
            </div>

            {/* Organizer Profile */}
            {hotel.organizer_profile && (
              <div className="border-2 border-primary/20 rounded-xl p-6 bg-gradient-to-br from-primary/5 to-transparent">
                <h3 className="font-display text-lg font-semibold flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-primary" />
                  Venue Organizer
                </h3>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-primary/30">
                    {hotel.organizer_profile.avatar_url ? (
                      <img
                        src={hotel.organizer_profile.avatar_url}
                        alt={hotel.organizer_profile.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <h4 className="font-semibold text-lg text-foreground">
                      {hotel.organizer_profile.full_name}
                    </h4>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-4 h-4 text-primary" />
                        <a 
                          href={`mailto:${hotel.organizer_profile.email}`} 
                          className="hover:text-primary transition-colors"
                        >
                          {hotel.organizer_profile.email}
                        </a>
                      </div>
                      {hotel.organizer_profile.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="w-4 h-4 text-primary" />
                          <a 
                            href={`tel:${hotel.organizer_profile.phone}`}
                            className="hover:text-primary transition-colors"
                          >
                            {hotel.organizer_profile.phone}
                          </a>
                        </div>
                      )}
                      {hotel.organizer_profile.address && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span>{hotel.organizer_profile.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Halls */}
            {hotel.hotel_halls?.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Available Halls
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {hotel.hotel_halls.map((hall) => (
                    <div key={hall.id} className="border border-border rounded-xl p-4 bg-muted/30">
                      {hall.images && hall.images.length > 0 && (
                        <Carousel className="w-full mb-3">
                          <CarouselContent>
                            {hall.images.map((img, idx) => (
                              <CarouselItem key={idx}>
                                <img
                                  src={img}
                                  alt={`${hall.name} - ${idx + 1}`}
                                  className="w-full aspect-video object-cover rounded-lg"
                                />
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                          {hall.images.length > 1 && (
                            <>
                              <CarouselPrevious className="left-2" />
                              <CarouselNext className="right-2" />
                            </>
                          )}
                        </Carousel>
                      )}
                      <h4 className="font-semibold text-foreground">{hall.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Capacity: {hall.capacity} guests
                      </p>
                      {hall.price_per_event && (
                        <p className="text-sm font-medium text-primary mt-1">
                          ₨{hall.price_per_event.toLocaleString()} per event
                        </p>
                      )}
                      {hall.description && (
                        <p className="text-sm text-muted-foreground mt-2">{hall.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Parking */}
            {hotel.parking_details && (
              <div className="space-y-3">
                <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                  <Car className="w-5 h-5 text-primary" />
                  Parking Facilities
                </h3>
                <p className="text-muted-foreground">{hotel.parking_details}</p>
                {hotel.parking_images && hotel.parking_images.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {hotel.parking_images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Parking ${idx + 1}`}
                        className="w-32 h-24 object-cover rounded-lg flex-shrink-0"
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Menu Bundles */}
            {hotel.menu_bundles && hotel.menu_bundles.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                  <UtensilsCrossed className="w-5 h-5 text-primary" />
                  Menu Packages
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {hotel.menu_bundles.map((bundle) => (
                    <div key={bundle.id} className="card-wedding border-2 border-primary/20 rounded-xl p-5 bg-gradient-to-br from-primary/5 to-transparent shadow-md hover:shadow-lg transition-shadow">
                      <h4 className="font-semibold text-xl text-foreground mb-4 border-b border-primary/10 pb-2">{bundle.name}</h4>
                      
                      {/* Main Dishes */}
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-primary mb-2">MAIN DISHES</p>
                        <div className="space-y-1.5">
                          <p className="text-sm flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span>{bundle.chicken_dish}</span>
                          </p>
                          <p className="text-sm flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span>{bundle.rice_dish}</span>
                          </p>
                          {bundle.additional_main_dishes && bundle.additional_main_dishes.length > 0 && 
                            bundle.additional_main_dishes.map((dish, idx) => (
                              <p key={idx} className="text-sm flex items-start gap-2">
                                <span className="text-primary mt-0.5">•</span>
                                <span>{dish}</span>
                              </p>
                            ))
                          }
                        </div>
                      </div>

                      {/* Optional Items */}
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-primary mb-2">INCLUDED ITEMS</p>
                        <div className="flex flex-wrap gap-2">
                          {bundle.include_raita && (
                            <Badge variant="secondary" className="text-xs">Raita</Badge>
                          )}
                          {bundle.include_salad && (
                            <Badge variant="secondary" className="text-xs">Salad</Badge>
                          )}
                          {bundle.include_cream_salad && (
                            <Badge variant="secondary" className="text-xs">Cream Salad</Badge>
                          )}
                          {bundle.include_drinks && (
                            <Badge variant="secondary" className="text-xs">Drinks</Badge>
                          )}
                          {bundle.include_tea && (
                            <Badge variant="secondary" className="text-xs">Tea</Badge>
                          )}
                          {bundle.include_sweet_dish && bundle.sweet_dish_type && (
                            <Badge variant="secondary" className="text-xs">{bundle.sweet_dish_type}</Badge>
                          )}
                          {bundle.include_table_service && (
                            <Badge variant="secondary" className="text-xs">Table Service</Badge>
                          )}
                          {bundle.custom_optional_items && bundle.custom_optional_items.length > 0 &&
                            bundle.custom_optional_items.map((item, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">{item}</Badge>
                            ))
                          }
                        </div>
                      </div>

                      {/* Price */}
                      <div className="pt-4 border-t-2 border-primary/20">
                        <p className="text-lg font-bold text-primary">
                          Rs. {bundle.final_price.toLocaleString()} per person
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Menu (old text-based) */}
            {hotel.menu_details && !hotel.menu_bundles?.length && (
              <div className="space-y-3">
                <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                  <UtensilsCrossed className="w-5 h-5 text-primary" />
                  Menu & Catering
                </h3>
                <p className="text-muted-foreground whitespace-pre-line">{hotel.menu_details}</p>
              </div>
            )}

            {/* Reviews */}
            {hotel.hotel_reviews?.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />
                  Reviews
                </h3>
                <div className="space-y-3">
                  {hotel.hotel_reviews.slice(0, 3).map((review) => (
                    <div key={review.id} className="border border-border rounded-xl p-4 bg-muted/30">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                          {review.profile?.avatar_url ? (
                            <img
                              src={review.profile.avatar_url}
                              alt={review.profile.full_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-primary font-semibold">
                              {review.profile?.full_name?.charAt(0) || 'U'}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{review.profile?.full_name}</p>
                          <div className="flex gap-0.5">
                            {Array.from({ length: review.rating }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            {errorMessage || 'Hotel details not found.'}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
