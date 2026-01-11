import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Combobox } from '@/components/ui/combobox';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Building2, Upload, Plus, X, Image, MapPin, Car } from 'lucide-react';

// Pakistan cities
const pakistanCities = [
  { value: 'karachi', label: 'Karachi' },
  { value: 'lahore', label: 'Lahore' },
  { value: 'islamabad', label: 'Islamabad' },
  { value: 'rawalpindi', label: 'Rawalpindi' },
  { value: 'faisalabad', label: 'Faisalabad' },
  { value: 'multan', label: 'Multan' },
  { value: 'peshawar', label: 'Peshawar' },
  { value: 'quetta', label: 'Quetta' },
  { value: 'sialkot', label: 'Sialkot' },
  { value: 'gujranwala', label: 'Gujranwala' },
  { value: 'hyderabad', label: 'Hyderabad' },
  { value: 'bahawalpur', label: 'Bahawalpur' },
  { value: 'sargodha', label: 'Sargodha' },
  { value: 'sukkur', label: 'Sukkur' },
  { value: 'larkana', label: 'Larkana' },
  { value: 'sheikhupura', label: 'Sheikhupura' },
  { value: 'jhang', label: 'Jhang' },
  { value: 'rahim-yar-khan', label: 'Rahim Yar Khan' },
  { value: 'gujrat', label: 'Gujrat' },
  { value: 'mardan', label: 'Mardan' },
  { value: 'kasur', label: 'Kasur' },
  { value: 'mingora', label: 'Mingora' },
  { value: 'dera-ghazi-khan', label: 'Dera Ghazi Khan' },
  { value: 'sahiwal', label: 'Sahiwal' },
  { value: 'nawabshah', label: 'Nawabshah' },
  { value: 'okara', label: 'Okara' },
  { value: 'gilgit', label: 'Gilgit' },
  { value: 'chiniot', label: 'Chiniot' },
  { value: 'sadiqabad', label: 'Sadiqabad' },
  { value: 'abbottabad', label: 'Abbottabad' },
  { value: 'murree', label: 'Murree' },
  { value: 'muzaffarabad', label: 'Muzaffarabad' },
];

const hotelSchema = z.object({
  name: z.string().min(3, 'Hotel name must be at least 3 characters'),
  description: z.string().optional(),
  address: z.string().min(5, 'Please enter a valid address'),
  city: z.string().min(2, 'Please enter a city'),
});

type HotelForm = z.infer<typeof hotelSchema>;

interface Hall {
  name: string;
  capacity: number;
  description: string;
  price_per_event: number;
}

interface MenuBundle {
  name: string;
  chicken_dish: string;
  rice_dish: string;
  additional_main_dishes: string[];
  include_drinks: boolean;
  include_raita: boolean;
  include_salad: boolean;
  include_cream_salad: boolean;
  include_sweet_dish: boolean;
  sweet_dish_type: string;
  include_tea: boolean;
  include_table_service: boolean;
  custom_optional_items: string[];
  final_price: number;
}

export default function AddHotel() {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(!!editId);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [videoPreviews, setVideoPreviews] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [mapLocation, setMapLocation] = useState<string>('');
  const [parkingCapacity, setParkingCapacity] = useState<string>('');
  const [halls, setHalls] = useState<Hall[]>([{ name: '', capacity: 100, description: '', price_per_event: 0 }]);
  const [menuBundles, setMenuBundles] = useState<MenuBundle[]>([{
    name: '',
    chicken_dish: '',
    rice_dish: '',
    additional_main_dishes: [],
    include_drinks: false,
    include_raita: false,
    include_salad: false,
    include_cream_salad: false,
    include_sweet_dish: false,
    sweet_dish_type: '',
    include_tea: false,
    include_table_service: false,
    custom_optional_items: [],
    final_price: 0
  }]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<HotelForm>({
    resolver: zodResolver(hotelSchema),
    defaultValues: {
      name: '',
      description: '',
      address: '',
      city: '',
    },
  });

  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: 'Login Required',
        description: 'Please login to add a hotel.',
        variant: 'destructive',
      });
      navigate('/auth');
    } else if (!loading && role !== 'organizer') {
      toast({
        title: 'Access Denied',
        description: 'Only organizers can add hotels.',
        variant: 'destructive',
      });
      navigate('/');
    } else if (editId && user && role === 'organizer') {
      fetchVenueData(editId);
    }
  }, [user, role, loading, navigate, toast, editId]);

  const fetchVenueData = async (id: string) => {
    setIsFetching(true);
    const { data, error } = await supabase
      .from('hotels')
      .select('*')
      .eq('id', id)
      .eq('organizer_id', user?.id)
      .single();

    if (error || !data) {
      toast({
        title: 'Error',
        description: 'Failed to load venue data.',
        variant: 'destructive',
      });
      navigate('/organizer-dashboard');
      return;
    }

    // Set form data
    form.reset({
      name: data.name,
      description: data.description || '',
      address: data.address,
      city: data.city,
    });

    setSelectedCity(pakistanCities.find(c => c.label === data.city)?.value || '');
    setMapLocation(data.map_location || '');
    setParkingCapacity(data.parking_capacity?.toString() || '');

    // Set existing images
    if (data.image_urls && data.image_urls.length > 0) {
      setImagePreviews(data.image_urls);
    } else if (data.image_url) {
      setImagePreviews([data.image_url]);
    }

    // Set existing videos
    if (data.video_urls && data.video_urls.length > 0) {
      setVideoPreviews(data.video_urls);
    }

    setIsFetching(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remainingSlots = 20 - imageFiles.length;
    
    if (files.length > remainingSlots) {
      toast({
        title: 'Too many images',
        description: `You can only upload ${remainingSlots} more image(s). Maximum is 20 images.`,
        variant: 'destructive',
      });
      return;
    }

    const newFiles = [...imageFiles, ...files];
    setImageFiles(newFiles);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remainingSlots = 3 - videoFiles.length;
    
    if (files.length > remainingSlots) {
      toast({
        title: 'Too many videos',
        description: `You can only upload ${remainingSlots} more video(s). Maximum is 3 videos.`,
        variant: 'destructive',
      });
      return;
    }

    // Validate video duration (30 seconds max)
    const validateVideos = async () => {
      for (const file of files) {
        const video = document.createElement('video');
        const url = URL.createObjectURL(file);
        
        await new Promise<void>((resolve, reject) => {
          video.onloadedmetadata = () => {
            if (video.duration > 30) {
              toast({
                title: 'Video too long',
                description: `${file.name} is longer than 30 seconds. Please upload videos under 30 seconds.`,
                variant: 'destructive',
              });
              reject();
            } else {
              resolve();
            }
            URL.revokeObjectURL(url);
          };
          video.src = url;
        }).catch(() => {
          return;
        });
      }

      const newFiles = [...videoFiles, ...files];
      setVideoFiles(newFiles);

      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setVideoPreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    };

    validateVideos();
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    setVideoFiles(prev => prev.filter((_, i) => i !== index));
    setVideoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const addHall = () => {
    setHalls([...halls, { name: '', capacity: 100, description: '', price_per_event: 0 }]);
  };

  const removeHall = (index: number) => {
    if (halls.length > 1) {
      setHalls(halls.filter((_, i) => i !== index));
    }
  };

  const updateHall = (index: number, field: keyof Hall, value: string | number) => {
    const newHalls = [...halls];
    newHalls[index] = { ...newHalls[index], [field]: value };
    setHalls(newHalls);
  };

  const addMenuBundle = () => {
    setMenuBundles([...menuBundles, {
      name: '',
      chicken_dish: '',
      rice_dish: '',
      additional_main_dishes: [],
      include_drinks: false,
      include_raita: false,
      include_salad: false,
      include_cream_salad: false,
      include_sweet_dish: false,
      sweet_dish_type: '',
      include_tea: false,
      include_table_service: false,
      custom_optional_items: [],
      final_price: 0
    }]);
  };

  const removeMenuBundle = (index: number) => {
    if (menuBundles.length > 1) {
      setMenuBundles(menuBundles.filter((_, i) => i !== index));
    }
  };

  const updateMenuBundle = (index: number, field: keyof MenuBundle, value: string | number | boolean | string[]) => {
    const newBundles = [...menuBundles];
    newBundles[index] = { ...newBundles[index], [field]: value };
    setMenuBundles(newBundles);
  };

  const addMainDish = (bundleIndex: number) => {
    const newBundles = [...menuBundles];
    newBundles[bundleIndex].additional_main_dishes.push('');
    setMenuBundles(newBundles);
  };

  const updateMainDish = (bundleIndex: number, dishIndex: number, value: string) => {
    const newBundles = [...menuBundles];
    newBundles[bundleIndex].additional_main_dishes[dishIndex] = value;
    setMenuBundles(newBundles);
  };

  const removeMainDish = (bundleIndex: number, dishIndex: number) => {
    const newBundles = [...menuBundles];
    newBundles[bundleIndex].additional_main_dishes.splice(dishIndex, 1);
    setMenuBundles(newBundles);
  };

  const addCustomOptionalItem = (bundleIndex: number) => {
    const newBundles = [...menuBundles];
    newBundles[bundleIndex].custom_optional_items.push('');
    setMenuBundles(newBundles);
  };

  const updateCustomOptionalItem = (bundleIndex: number, itemIndex: number, value: string) => {
    const newBundles = [...menuBundles];
    newBundles[bundleIndex].custom_optional_items[itemIndex] = value;
    setMenuBundles(newBundles);
  };

  const removeCustomOptionalItem = (bundleIndex: number, itemIndex: number) => {
    const newBundles = [...menuBundles];
    newBundles[bundleIndex].custom_optional_items.splice(itemIndex, 1);
    setMenuBundles(newBundles);
  };

  const onSubmit = async (data: HotelForm) => {
    if (!user) return;

    setIsLoading(true);
    const imageUrls: string[] = [];
    const videoUrls: string[] = [];

    // Upload images
    for (const imageFile of imageFiles) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${user.id}/images/${Date.now()}_${Math.random()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, imageFile);

      if (uploadError) {
        toast({
          title: 'Error',
          description: 'Failed to upload an image.',
          variant: 'destructive',
        });
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);
      
      imageUrls.push(publicUrl);
    }

    // Upload videos
    for (const videoFile of videoFiles) {
      const fileExt = videoFile.name.split('.').pop();
      const fileName = `${user.id}/videos/${Date.now()}_${Math.random()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, videoFile);

      if (uploadError) {
        toast({
          title: 'Error',
          description: 'Failed to upload a video.',
          variant: 'destructive',
        });
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);
      
      videoUrls.push(publicUrl);
    }

    // Create or update hotel with all media
    const hotelPayload = {
      organizer_id: user.id,
      name: data.name,
      description: data.description || null,
      address: data.address,
      city: data.city,
      image_url: imageUrls[0] || imagePreviews[0] || null,
      image_urls: [...imagePreviews, ...imageUrls].length > 0 ? [...imagePreviews, ...imageUrls] : null,
      video_urls: [...videoPreviews, ...videoUrls].length > 0 ? [...videoPreviews, ...videoUrls] : null,
      map_location: mapLocation || null,
      parking_capacity: parkingCapacity ? parseInt(parkingCapacity) : null,
    };

    let hotelData;
    let hotelError;

    if (editId) {
      // Update existing venue
      const result = await supabase
        .from('hotels')
        .update(hotelPayload)
        .eq('id', editId)
        .eq('organizer_id', user.id)
        .select()
        .single();
      
      hotelData = result.data;
      hotelError = result.error;
    } else {
      // Create new venue
      const result = await supabase
        .from('hotels')
        .insert(hotelPayload)
        .select()
        .single();
      
      hotelData = result.data;
      hotelError = result.error;
    }

    if (hotelError) {
      console.error('Hotel creation error:', hotelError);
      console.error('Error details:', JSON.stringify(hotelError, null, 2));
      toast({
        title: 'Error',
        description: hotelError.message || hotelError.details || 'Failed to save venue. Please check your inputs.',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    // Create halls
    const validHalls = halls.filter(h => h.name.trim() !== '');
    if (validHalls.length > 0) {
      const { error: hallsError } = await supabase.from('hotel_halls').insert(
        validHalls.map(hall => ({
          hotel_id: hotelData.id,
          name: hall.name,
          capacity: hall.capacity,
          description: hall.description || null,
          price_per_event: hall.price_per_event || null,
        }))
      );

      if (hallsError) {
        console.error('Error creating halls:', hallsError);
      }
    }

    // Create menu bundles
    const validMenuBundles = menuBundles.filter(b => b.name.trim() !== '' && b.chicken_dish.trim() !== '');
    if (validMenuBundles.length > 0) {
      const { error: bundlesError } = await supabase.from('menu_bundles').insert(
        validMenuBundles.map(bundle => ({
          hotel_id: hotelData.id,
          name: bundle.name,
          chicken_dish: bundle.chicken_dish,
          rice_dish: bundle.rice_dish,
          additional_main_dishes: bundle.additional_main_dishes.filter(d => d.trim() !== ''),
          include_drinks: bundle.include_drinks,
          include_raita: bundle.include_raita,
          include_salad: bundle.include_salad,
          include_cream_salad: bundle.include_cream_salad,
          include_sweet_dish: bundle.include_sweet_dish,
          sweet_dish_type: bundle.sweet_dish_type || null,
          include_tea: bundle.include_tea,
          include_table_service: bundle.include_table_service,
          custom_optional_items: bundle.custom_optional_items.filter(i => i.trim() !== ''),
          final_price: bundle.final_price,
        }))
      );

      if (bundlesError) {
        console.error('Error creating menu bundles:', bundlesError);
      }
    }

    toast({
      title: editId ? 'Venue Updated!' : 'Hotel Listed!',
      description: editId ? 'Your venue has been updated successfully.' : 'Your venue has been added successfully.',
    });
    navigate('/organizer-dashboard');
    setIsLoading(false);
  };

  if (loading || isFetching) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen gradient-hero py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 mb-3 sm:mb-4">
              <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mb-2">
              {editId ? 'Edit Your Venue' : 'Add Your Hotel'}
            </h1>
            <p className="text-muted-foreground">
              {editId ? 'Update your venue information' : 'List your venue and connect with event planners.'}
            </p>
          </div>

          <div className="card-wedding">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Images Upload */}
              <div className="space-y-2">
                <Label>Hotel Images (Up to 20)</Label>
                <div
                  onClick={() => imageFiles.length < 20 && fileInputRef.current?.click()}
                  className="border-2 border-dashed border-muted rounded-xl p-4 sm:p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                >
                  {imagePreviews.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeImage(index);
                            }}
                            className="absolute top-1 right-1 p-1 bg-destructive rounded-full text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {imagePreviews.length < 20 && (
                        <div className="w-full h-24 border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground">
                          <Plus className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <Image className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload hotel images (Max: 20)
                      </p>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground">
                  {imagePreviews.length}/20 images uploaded
                </p>
              </div>

              {/* Videos Upload */}
              <div className="space-y-2">
                <Label>Hotel Videos (Up to 3, max 30 seconds each)</Label>
                <div
                  onClick={() => videoFiles.length < 3 && videoInputRef.current?.click()}
                  className="border-2 border-dashed border-muted rounded-xl p-4 sm:p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                >
                  {videoPreviews.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                      {videoPreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <video
                            src={preview}
                            className="w-full h-32 object-cover rounded-lg"
                            controls
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeVideo(index);
                            }}
                            className="absolute top-1 right-1 p-1 bg-destructive rounded-full text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {videoPreviews.length < 3 && (
                        <div className="w-full h-32 border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground">
                          <Plus className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload videos (Max: 3, 30 seconds each)
                      </p>
                    </>
                  )}
                </div>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={handleVideoChange}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground">
                  {videoPreviews.length}/3 videos uploaded
                </p>
              </div>

              {/* Hotel Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Hotel Name</Label>
                <Input
                  id="name"
                  placeholder="Grand Palace Hotel"
                  className="input-wedding"
                  {...form.register('name')}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your hotel and what makes it special..."
                  className="input-wedding min-h-[100px] resize-none"
                  {...form.register('description')}
                />
              </div>

              {/* Address and City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    placeholder="123 Main Street"
                    className="input-wedding"
                    {...form.register('address')}
                  />
                  {form.formState.errors.address && (
                    <p className="text-sm text-destructive">{form.formState.errors.address.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    City
                  </Label>
                  <Combobox
                    options={pakistanCities}
                    value={selectedCity}
                    onChange={(value) => {
                      setSelectedCity(value);
                      const cityLabel = pakistanCities.find(c => c.value === value)?.label || '';
                      form.setValue('city', cityLabel);
                    }}
                    placeholder="Select city..."
                    searchPlaceholder="Search cities..."
                    emptyText="No city found."
                    className="input-wedding"
                  />
                  {form.formState.errors.city && (
                    <p className="text-sm text-destructive">{form.formState.errors.city.message}</p>
                  )}
                </div>
              </div>

              {/* Google Maps Location */}
              <div className="space-y-2">
                <Label htmlFor="map_location">Google Maps Location (Optional)</Label>
                <Input
                  id="map_location"
                  placeholder="Paste Google Maps link or coordinates"
                  className="input-wedding"
                  value={mapLocation}
                  onChange={(e) => setMapLocation(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Share your Google Maps location link for easy navigation
                </p>
              </div>

              {/* Parking Capacity */}
              <div className="space-y-2">
                <Label htmlFor="parking_capacity">
                  <Car className="w-4 h-4 inline mr-2" />
                  Parking Capacity (Number of Cars)
                </Label>
                <Input
                  id="parking_capacity"
                  type="number"
                  placeholder="e.g., 50"
                  className="input-wedding"
                  value={parkingCapacity}
                  onChange={(e) => setParkingCapacity(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  How many cars can be parked at your venue?
                </p>
              </div>

              {/* Halls Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Event Halls</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addHall}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Hall
                  </Button>
                </div>

                {halls.map((hall, index) => (
                  <div key={index} className="bg-muted/30 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Hall {index + 1}</span>
                      {halls.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeHall(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <Input
                        placeholder="Hall name"
                        value={hall.name}
                        onChange={(e) => updateHall(index, 'name', e.target.value)}
                        className="input-wedding"
                      />
                      <Input
                        type="number"
                        placeholder="Capacity"
                        value={hall.capacity}
                        onChange={(e) => updateHall(index, 'capacity', parseInt(e.target.value) || 0)}
                        className="input-wedding"
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <Input
                        placeholder="Description"
                        value={hall.description}
                        onChange={(e) => updateHall(index, 'description', e.target.value)}
                        className="input-wedding"
                      />
                      <div className="flex gap-2">
                        <Input
                          value="Rs."
                          disabled
                          className="input-wedding w-16 text-center"
                        />
                        <Input
                          type="number"
                          placeholder="500000"
                          value={hall.price_per_event}
                          onChange={(e) => updateHall(index, 'price_per_event', parseInt(e.target.value) || 0)}
                          className="input-wedding flex-1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Menu Bundles Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Menu Bundles</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addMenuBundle}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Bundle
                  </Button>
                </div>

                {menuBundles.map((bundle, index) => (
                  <div key={index} className="bg-muted/30 rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Bundle {index + 1}</span>
                      {menuBundles.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMenuBundle(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    
                    {/* Bundle Name */}
                    <Input
                      placeholder="Bundle name (e.g., Standard Package)"
                      value={bundle.name}
                      onChange={(e) => updateMenuBundle(index, 'name', e.target.value)}
                      className="input-wedding"
                    />
                    
                    {/* Main Dishes - Display only with delete option */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm text-muted-foreground">Main Dishes</Label>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={() => addMainDish(index)}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Dish
                        </Button>
                      </div>
                      
                      {/* Main Dish One and Two */}
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                          <div>
                            <Label className="text-xs text-muted-foreground">Main Dish One</Label>
                            <p className="text-sm font-medium">{bundle.chicken_dish || 'Not set'}</p>
                          </div>
                          {bundle.chicken_dish && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => updateMenuBundle(index, 'chicken_dish', '')}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                          <div>
                            <Label className="text-xs text-muted-foreground">Main Dish Two</Label>
                            <p className="text-sm font-medium">{bundle.rice_dish || 'Not set'}</p>
                          </div>
                          {bundle.rice_dish && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => updateMenuBundle(index, 'rice_dish', '')}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {/* Dropdowns for selecting dishes */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          {!bundle.chicken_dish && (
                            <div className="space-y-2">
                              <Select
                                onValueChange={(value) => updateMenuBundle(index, 'chicken_dish', value)}
                              >
                                <SelectTrigger className="input-wedding">
                                  <SelectValue placeholder="Select main dish one" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Chicken Karahi">Chicken Karahi</SelectItem>
                                  <SelectItem value="Chicken Korma">Chicken Korma</SelectItem>
                                  <SelectItem value="Chicken Tikka">Chicken Tikka</SelectItem>
                                  <SelectItem value="BBQ Chicken">BBQ Chicken</SelectItem>
                                  <SelectItem value="Fried Chicken">Fried Chicken</SelectItem>
                                  <SelectItem value="Mutton Karahi">Mutton Karahi</SelectItem>
                                  <SelectItem value="Beef Curry">Beef Curry</SelectItem>
                                  <SelectItem value="custom">Custom</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                          {bundle.chicken_dish === 'custom' && (
                            <Input
                              placeholder="Enter custom dish name"
                              className="input-wedding"
                              onBlur={(e) => {
                                if (e.target.value.trim()) {
                                  updateMenuBundle(index, 'chicken_dish', e.target.value);
                                }
                              }}
                            />
                          )}
                        </div>
                        <div>
                          {!bundle.rice_dish && (
                            <div className="space-y-2">
                              <Select
                                onValueChange={(value) => updateMenuBundle(index, 'rice_dish', value)}
                              >
                                <SelectTrigger className="input-wedding">
                                  <SelectValue placeholder="Select main dish two" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Chicken Biryani">Chicken Biryani</SelectItem>
                                  <SelectItem value="Mutton Biryani">Mutton Biryani</SelectItem>
                                  <SelectItem value="Chicken Pulao">Chicken Pulao</SelectItem>
                                  <SelectItem value="Plain Pulao">Plain Pulao</SelectItem>
                                  <SelectItem value="Zafrani Pulao">Zafrani Pulao</SelectItem>
                                  <SelectItem value="custom">Custom</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                          {bundle.rice_dish === 'custom' && (
                            <Input
                              placeholder="Enter custom dish name"
                              className="input-wedding"
                              onBlur={(e) => {
                                if (e.target.value.trim()) {
                                  updateMenuBundle(index, 'rice_dish', e.target.value);
                                }
                              }}
                            />
                          )}
                        </div>
                      </div>

                      {/* Additional Main Dishes */}
                      {bundle.additional_main_dishes.map((dish, dishIndex) => (
                        <div key={dishIndex} className="flex items-center gap-3">
                          <div className="flex-1 flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                            <div className="flex-1 space-y-2">
                              <Label className="text-xs text-muted-foreground">Main Dish {dishIndex + 3}</Label>
                              {dish && dish !== 'custom' ? (
                                <p className="text-sm font-medium">{dish}</p>
                              ) : (
                                <>
                                  <Select
                                    value={dish === 'custom' ? 'custom' : dish}
                                    onValueChange={(value) => updateMainDish(index, dishIndex, value)}
                                  >
                                    <SelectTrigger className="mt-1 h-8 text-sm">
                                      <SelectValue placeholder="Select dish" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Chicken Karahi">Chicken Karahi</SelectItem>
                                      <SelectItem value="Mutton Karahi">Mutton Karahi</SelectItem>
                                      <SelectItem value="Chicken Korma">Chicken Korma</SelectItem>
                                      <SelectItem value="Beef Curry">Beef Curry</SelectItem>
                                      <SelectItem value="Fish Fry">Fish Fry</SelectItem>
                                      <SelectItem value="Dal Makhani">Dal Makhani</SelectItem>
                                      <SelectItem value="custom">Custom</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  {dish === 'custom' && (
                                    <Input
                                      placeholder="Enter custom dish name"
                                      className="input-wedding text-sm"
                                      onBlur={(e) => {
                                        if (e.target.value.trim()) {
                                          updateMainDish(index, dishIndex, e.target.value);
                                        }
                                      }}
                                    />
                                  )}
                                </>
                              )}
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => removeMainDish(index, dishIndex)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Optional Items with Toggles */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm text-muted-foreground">Optional Items</Label>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={() => addCustomOptionalItem(index)}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Item
                        </Button>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-3">
                        {/* Raita */}
                        <div className="flex items-center justify-between p-3 rounded-lg border">
                          <Label htmlFor={`raita-${index}`} className="cursor-pointer">Raita</Label>
                          <Switch
                            id={`raita-${index}`}
                            checked={bundle.include_raita}
                            onCheckedChange={(checked) => updateMenuBundle(index, 'include_raita', checked)}
                          />
                        </div>

                        {/* Salad */}
                        <div className="flex items-center justify-between p-3 rounded-lg border">
                          <Label htmlFor={`salad-${index}`} className="cursor-pointer">Salad</Label>
                          <Switch
                            id={`salad-${index}`}
                            checked={bundle.include_salad}
                            onCheckedChange={(checked) => updateMenuBundle(index, 'include_salad', checked)}
                          />
                        </div>

                        {/* Cream Salad */}
                        <div className="flex items-center justify-between p-3 rounded-lg border">
                          <Label htmlFor={`cream-salad-${index}`} className="cursor-pointer">Cream Salad</Label>
                          <Switch
                            id={`cream-salad-${index}`}
                            checked={bundle.include_cream_salad}
                            onCheckedChange={(checked) => updateMenuBundle(index, 'include_cream_salad', checked)}
                          />
                        </div>

                        {/* Drinks */}
                        <div className="flex items-center justify-between p-3 rounded-lg border">
                          <Label htmlFor={`drinks-${index}`} className="cursor-pointer">Drinks</Label>
                          <Switch
                            id={`drinks-${index}`}
                            checked={bundle.include_drinks}
                            onCheckedChange={(checked) => updateMenuBundle(index, 'include_drinks', checked)}
                          />
                        </div>

                        {/* Tea */}
                        <div className="flex items-center justify-between p-3 rounded-lg border">
                          <Label htmlFor={`tea-${index}`} className="cursor-pointer">Tea</Label>
                          <Switch
                            id={`tea-${index}`}
                            checked={bundle.include_tea}
                            onCheckedChange={(checked) => updateMenuBundle(index, 'include_tea', checked)}
                          />
                        </div>

                        {/* Sweet Dish with dropdown */}
                        <div className="p-3 rounded-lg border space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor={`sweet-dish-${index}`} className="cursor-pointer">Sweet Dish</Label>
                            <Switch
                              id={`sweet-dish-${index}`}
                              checked={bundle.include_sweet_dish}
                              onCheckedChange={(checked) => updateMenuBundle(index, 'include_sweet_dish', checked)}
                            />
                          </div>
                          {bundle.include_sweet_dish && !bundle.sweet_dish_type && (
                            <Select
                              onValueChange={(value) => updateMenuBundle(index, 'sweet_dish_type', value)}
                            >
                              <SelectTrigger className="input-wedding">
                                <SelectValue placeholder="Select sweet dish" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="firni">Firni</SelectItem>
                                <SelectItem value="gajrella">Gajrella</SelectItem>
                                <SelectItem value="kheer">Kheer</SelectItem>
                                <SelectItem value="gulab-jamun">Gulab Jamun</SelectItem>
                                <SelectItem value="custom">Custom</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                          {bundle.include_sweet_dish && bundle.sweet_dish_type === 'custom' && (
                            <Input
                              placeholder="Enter custom sweet dish"
                              className="input-wedding"
                              onBlur={(e) => {
                                if (e.target.value.trim()) {
                                  updateMenuBundle(index, 'sweet_dish_type', e.target.value);
                                }
                              }}
                            />
                          )}
                          {bundle.include_sweet_dish && bundle.sweet_dish_type && bundle.sweet_dish_type !== 'custom' && (
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">{bundle.sweet_dish_type}</p>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => updateMenuBundle(index, 'sweet_dish_type', '')}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Table Service - At the end */}
                        <div className="flex items-center justify-between p-3 rounded-lg border">
                          <Label htmlFor={`table-service-${index}`} className="cursor-pointer">Table Service</Label>
                          <Switch
                            id={`table-service-${index}`}
                            checked={bundle.include_table_service}
                            onCheckedChange={(checked) => updateMenuBundle(index, 'include_table_service', checked)}
                          />
                        </div>
                      </div>

                      {/* Custom Optional Items */}
                      {bundle.custom_optional_items.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center gap-3">
                          <Input
                            placeholder="Enter custom optional item"
                            value={item}
                            onChange={(e) => updateCustomOptionalItem(index, itemIndex, e.target.value)}
                            className="input-wedding flex-1"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0"
                            onClick={() => removeCustomOptionalItem(index, itemIndex)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* Final Bundle Price */}
                    <div className="space-y-2">
                      <Label>Final Bundle Price (Per Person)</Label>
                      <div className="flex gap-2">
                        <Input
                          value="Rs."
                          disabled
                          className="input-wedding w-16 text-center"
                        />
                        <Input
                          type="number"
                          placeholder="1500"
                          value={bundle.final_price}
                          onChange={(e) => updateMenuBundle(index, 'final_price', parseInt(e.target.value) || 0)}
                          className="input-wedding flex-1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button type="submit" className="btn-wedding w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                List My Hotel
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}