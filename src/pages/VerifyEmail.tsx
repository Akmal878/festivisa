import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function VerifyEmail() {
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

          <div className="card-wedding text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Mail className="w-10 h-10 text-primary" />
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <h1 className="font-display text-2xl font-semibold text-foreground">
                  Verify Your Email
                </h1>
              </div>
              <p className="text-muted-foreground mt-4 leading-relaxed">
                We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
              </p>
            </div>

            <div className="space-y-4 p-4 bg-muted/30 rounded-lg mb-6">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-primary">1</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">Check your email</p>
                  <p className="text-xs text-muted-foreground">Look for an email from Festivisa</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-primary">2</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">Click the verification link</p>
                  <p className="text-xs text-muted-foreground">This will activate your account</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-primary">3</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">Start using Festivisa</p>
                  <p className="text-xs text-muted-foreground">You'll be redirected to your dashboard</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Didn't receive the email? Check your spam folder or contact support.
              </p>
              
              <Link to="/auth">
                <Button variant="outline" className="w-full">
                  Back to Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
