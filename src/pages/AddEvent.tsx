import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Combobox } from '@/components/ui/combobox';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Calendar as CalendarIcon, Users, MapPin, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

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

const eventSchema = z.object({
  event_name: z.string().min(3, 'Event name must be at least 3 characters'),
  event_type: z.string().min(1, 'Please select an event type'),
  event_date: z.string().min(1, 'Please select a date'),
  guest_count: z.coerce.number().min(1, 'Guest count must be at least 1'),
  budget: z.coerce.number().optional(),
  location: z.string().min(2, 'Please enter a location'),
  requirements: z.string().optional(),
  catering: z.boolean().default(false),
  photography: z.boolean().default(false),
});

type EventForm = z.infer<typeof eventSchema>;

const eventTypes = [
  'Wedding',
  'Engagement',
  'Birthday Party',
  'Anniversary',
  'Corporate Event',
  'Conference',
  'Baby Shower',
  'Graduation Party',
  'Other',
];

export default function AddEvent() {
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<Date>();
  const [selectedCity, setSelectedCity] = useState<string>('');
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<EventForm>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      event_name: '',
      event_type: '',
      event_date: '',
      guest_count: 50,
      budget: undefined,
      location: '',
      requirements: '',
      catering: false,
      photography: false,
    },
  });

  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: 'Login Required',
        description: 'Please login to add an event.',
        variant: 'destructive',
      });
      navigate('/auth');
    } else if (!loading && role !== 'user') {
      toast({
        title: 'Access Denied',
        description: 'Only event planners can add events.',
        variant: 'destructive',
      });
      navigate('/');
    }
  }, [user, role, loading, navigate, toast]);

  const onSubmit = async (data: EventForm) => {
    if (!user) return;

    setIsLoading(true);
    const { error } = await supabase.from('events').insert({
      user_id: user.id,
      event_name: data.event_name,
      event_type: data.event_type,
      event_date: data.event_date,
      guest_count: data.guest_count,
      budget: data.budget || null,
      location: data.location,
      requirements: data.requirements || null,
      catering: data.catering,
      photography: data.photography,
    });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to create event. Please try again.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Event Created!',
        description: 'Your event has been posted. Organizers can now send invites.',
      });
      navigate('/my-events');
    }
    setIsLoading(false);
  };

  if (loading) {
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
      <div className="min-h-screen gradient-hero py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-display text-4xl font-semibold text-foreground mb-2">
              Add Your Event
            </h1>
            <p className="text-muted-foreground">
              Tell us about your dream event and let venues come to you.
            </p>
          </div>

          <div className="card-wedding">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Event Name */}
              <div className="space-y-2">
                <Label htmlFor="event_name">Event Name</Label>
                <Input
                  id="event_name"
                  placeholder="My Dream Wedding"
                  className="input-wedding"
                  {...form.register('event_name')}
                />
                {form.formState.errors.event_name && (
                  <p className="text-sm text-destructive">{form.formState.errors.event_name.message}</p>
                )}
              </div>

              {/* Event Type */}
              <div className="space-y-2">
                <Label>Event Type</Label>
                <Select
                  value={form.watch('event_type')}
                  onValueChange={(value) => form.setValue('event_type', value)}
                >
                  <SelectTrigger className="input-wedding">
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.event_type && (
                  <p className="text-sm text-destructive">{form.formState.errors.event_type.message}</p>
                )}
              </div>

              {/* Date and Guests */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    <CalendarIcon className="w-4 h-4 inline mr-2" />
                    Event Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "input-wedding w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(newDate) => {
                          setDate(newDate);
                          if (newDate) {
                            form.setValue('event_date', format(newDate, 'yyyy-MM-dd'));
                          }
                        }}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {form.formState.errors.event_date && (
                    <p className="text-sm text-destructive">{form.formState.errors.event_date.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guest_count">
                    <Users className="w-4 h-4 inline mr-2" />
                    Number of Guests
                  </Label>
                  <Input
                    id="guest_count"
                    type="number"
                    min={1}
                    className="input-wedding"
                    {...form.register('guest_count')}
                  />
                  {form.formState.errors.guest_count && (
                    <p className="text-sm text-destructive">{form.formState.errors.guest_count.message}</p>
                  )}
                </div>
              </div>

              {/* Location and Budget */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    <MapPin className="w-4 h-4 inline mr-2" />
                    City
                  </Label>
                  <Combobox
                    options={pakistanCities}
                    value={selectedCity}
                    onChange={(value) => {
                      setSelectedCity(value);
                      const cityLabel = pakistanCities.find(c => c.value === value)?.label || '';
                      form.setValue('location', cityLabel);
                    }}
                    placeholder="Select city..."
                    searchPlaceholder="Search cities..."
                    emptyText="No city found."
                    className="input-wedding"
                  />
                  {form.formState.errors.location && (
                    <p className="text-sm text-destructive">{form.formState.errors.location.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">
                    Budget (optional)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value="Rs."
                      disabled
                      className="input-wedding w-16 text-center text-lg"
                    />
                    <Input
                      id="budget"
                      type="number"
                      min={0}
                      placeholder="500000"
                      className="input-wedding flex-1"
                      {...form.register('budget')}
                    />
                  </div>
                </div>
              </div>

              {/* Services Needed */}
              <div className="space-y-3">
                <Label>Additional Services</Label>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { id: 'catering', label: 'Catering / Food Service' },
                    { id: 'photography', label: 'Photography & Videography' },
                  ].map((service) => (
                    <div key={service.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={service.id}
                        checked={form.watch(service.id as keyof EventForm) as boolean}
                        onCheckedChange={(checked) => 
                          form.setValue(service.id as keyof EventForm, checked as boolean)
                        }
                      />
                      <Label htmlFor={service.id} className="cursor-pointer">
                        {service.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Requirements */}
              <div className="space-y-2">
                <Label htmlFor="requirements">Additional Requirements (optional)</Label>
                <Textarea
                  id="requirements"
                  placeholder="Any special requirements or preferences..."
                  className="input-wedding min-h-[100px] resize-none"
                  {...form.register('requirements')}
                />
              </div>

              <Button type="submit" className="btn-wedding w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Post My Event
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}