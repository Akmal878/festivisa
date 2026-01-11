import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Combobox } from '@/components/ui/combobox';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Building2, ArrowLeft } from 'lucide-react';

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

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  address: z.string().optional(),
  role: z.enum(['user', 'organizer']),
});

type LoginForm = z.infer<typeof loginSchema>;
type SignupForm = z.infer<typeof signupSchema>;

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const signupForm = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: { 
      full_name: '', 
      email: '', 
      password: '', 
      phone: '', 
      address: '', 
      role: 'user' 
    },
  });

  useEffect(() => {
    if (user && role) {
      if (role === 'organizer') {
        navigate('/organizer-dashboard');
      } else {
        navigate('/');
      }
    }
  }, [user, role, navigate]);

  const handleLogin = async (data: LoginForm) => {
    setIsLoading(true);
    const { error } = await signIn(data.email, data.password);
    
    if (error) {
      toast({
        title: 'Login Failed',
        description: error.message === 'Invalid login credentials' 
          ? 'Invalid email or password. Please try again.'
          : error.message,
        variant: 'destructive',
      });
      setIsLoading(false);
    } else {
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      });
      // Will redirect based on role in useEffect
    }
  };

  const handleSignup = async (data: SignupForm) => {
    setIsLoading(true);
    const { error } = await signUp(data.email, data.password, {
      full_name: data.full_name,
      phone: data.phone,
      address: data.address,
      role: data.role,
    });

    if (error) {
      let errorMessage = error.message;
      if (error.message.includes('already registered')) {
        errorMessage = 'This email is already registered. Please login instead.';
      }
      toast({
        title: 'Sign Up Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      setIsLoading(false);
    } else {
      toast({
        title: 'Account Created!',
        description: 'Welcome to Festivisa! Your account has been created.',
      });
      // Will redirect based on role in useEffect
    }
  };

  return (
    <Layout showFooter={false}>
      <div className="min-h-[calc(100vh-5rem)] gradient-hero flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </div>

          <div className="card-wedding">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <svg viewBox="0 0 60 40" className="w-8 h-5 text-primary">
                  <circle cx="20" cy="20" r="12" fill="none" stroke="currentColor" strokeWidth="2" />
                  <circle cx="40" cy="20" r="12" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
              <h1 className="font-display text-3xl font-semibold text-foreground">
                Welcome to Festivisa
              </h1>
              <p className="text-muted-foreground mt-2">
                Your perfect event starts here
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      className="input-wedding"
                      {...loginForm.register('email')}
                    />
                    {loginForm.formState.errors.email && (
                      <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      className="input-wedding"
                      {...loginForm.register('password')}
                    />
                    {loginForm.formState.errors.password && (
                      <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <Button type="submit" className="btn-wedding w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Login
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
                  <div className="space-y-2">
                    <Label>I am a...</Label>
                    <RadioGroup
                      value={signupForm.watch('role')}
                      onValueChange={(value) => signupForm.setValue('role', value as 'user' | 'organizer')}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div className="relative">
                        <RadioGroupItem value="user" id="role-user" className="peer sr-only" />
                        <Label
                          htmlFor="role-user"
                          className="flex flex-col items-center justify-center rounded-xl border-2 border-muted bg-background p-4 hover:bg-muted/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                        >
                          <User className="w-6 h-6 mb-2" />
                          <span className="font-medium">Event Planner</span>
                          <span className="text-xs text-muted-foreground">Post your events</span>
                        </Label>
                      </div>
                      <div className="relative">
                        <RadioGroupItem value="organizer" id="role-organizer" className="peer sr-only" />
                        <Label
                          htmlFor="role-organizer"
                          className="flex flex-col items-center justify-center rounded-xl border-2 border-muted bg-background p-4 hover:bg-muted/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                        >
                          <Building2 className="w-6 h-6 mb-2" />
                          <span className="font-medium">Venue Owner</span>
                          <span className="text-xs text-muted-foreground">List your venue</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      placeholder="John Doe"
                      className="input-wedding"
                      {...signupForm.register('full_name')}
                    />
                    {signupForm.formState.errors.full_name && (
                      <p className="text-sm text-destructive">{signupForm.formState.errors.full_name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      className="input-wedding"
                      {...signupForm.register('email')}
                    />
                    {signupForm.formState.errors.email && (
                      <p className="text-sm text-destructive">{signupForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      className="input-wedding"
                      {...signupForm.register('password')}
                    />
                    {signupForm.formState.errors.password && (
                      <p className="text-sm text-destructive">{signupForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-phone">Phone (optional)</Label>
                      <div className="flex gap-2">
                        <Input
                          value="+92"
                          disabled
                          className="input-wedding w-16 text-center"
                        />
                        <Input
                          id="signup-phone"
                          type="tel"
                          placeholder="3001234567"
                          className="input-wedding flex-1"
                          {...signupForm.register('phone')}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            signupForm.setValue('phone', value ? `+92${value}` : '');
                          }}
                          value={signupForm.watch('phone')?.replace('+92', '') || ''}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-city">City (optional)</Label>
                      <Combobox
                        options={pakistanCities}
                        value={selectedCity}
                        onChange={(value) => {
                          setSelectedCity(value);
                          const cityLabel = pakistanCities.find(c => c.value === value)?.label || '';
                          signupForm.setValue('address', cityLabel);
                        }}
                        placeholder="Select city..."
                        searchPlaceholder="Search cities..."
                        emptyText="No city found."
                        className="input-wedding"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="btn-wedding w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Create Account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
}