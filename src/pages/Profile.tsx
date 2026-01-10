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
import { Card } from '@/components/ui/card';
import { Combobox } from '@/components/ui/combobox';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Mail, Phone, MapPin, Save } from 'lucide-react';

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

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

interface Profile {
  full_name: string;
  email: string;
  phone: string | null;
  address: string | null;
}

export default function Profile() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: '',
      phone: '',
      address: '',
    },
  });

  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: 'Login Required',
        description: 'Please login to view your profile.',
        variant: 'destructive',
      });
      navigate('/auth');
    }
  }, [user, loading, navigate, toast]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    setIsFetching(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, email, phone, address')
      .eq('id', user.id)
      .single();

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load profile information.',
        variant: 'destructive',
      });
    } else if (data) {
      form.reset({
        full_name: data.full_name || '',
        phone: data.phone || '',
        address: data.address || '',
      });
      // Set selected city if it matches one of our cities
      const matchedCity = pakistanCities.find(c => c.label === data.address);
      if (matchedCity) {
        setSelectedCity(matchedCity.value);
      }
    }
    setIsFetching(false);
  };

  const onSubmit = async (data: ProfileForm) => {
    if (!user) return;

    setIsLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: data.full_name,
        phone: data.phone || null,
        address: data.address || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      toast({
        title: 'Update Failed',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Profile updated successfully!',
      });
    }
    setIsLoading(false);
  };

  if (isFetching) {
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
      <div className="container mx-auto px-4 py-12 sm:py-16 md:py-24">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-2">My Profile</h1>
            <p className="text-muted-foreground">
              View and update your profile information
            </p>
          </div>

          <Card className="card-wedding">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Email (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              {/* Role (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="role" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Account Type
                </Label>
                <Input
                  id="role"
                  type="text"
                  value={role ? role.charAt(0).toUpperCase() + role.slice(1) : ''}
                  disabled
                  className="bg-muted capitalize"
                />
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="full_name" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name *
                </Label>
                <Input
                  id="full_name"
                  {...form.register('full_name')}
                  placeholder="Enter your full name"
                />
                {form.formState.errors.full_name && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.full_name.message}
                  </p>
                )}
              </div>

              {/* Phone and City in one row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value="+92"
                      disabled
                      className="w-16 text-center bg-muted"
                    />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="3001234567"
                      className="flex-1"
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        form.setValue('phone', value ? `+92${value}` : '');
                      }}
                      value={form.watch('phone')?.replace('+92', '') || ''}
                    />
                  </div>
                </div>

                {/* City */}
                <div className="space-y-2">
                  <Label htmlFor="city" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    City
                  </Label>
                  <Combobox
                    options={pakistanCities}
                    value={selectedCity}
                    onChange={(value) => {
                      setSelectedCity(value);
                      const cityLabel = pakistanCities.find(c => c.value === value)?.label || '';
                      form.setValue('address', cityLabel);
                    }}
                    placeholder="Select city..."
                    searchPlaceholder="Search cities..."
                    emptyText="No city found."
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full btn-gold"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
