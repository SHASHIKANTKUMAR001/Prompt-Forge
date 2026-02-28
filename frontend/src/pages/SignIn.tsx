import { SignIn } from '@clerk/clerk-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const SignInPage = () => {
  return (
    <div className="min-h-screen flex flex-col dark">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12">
        <SignIn
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          afterSignInUrl="/"
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'bg-card border border-border shadow-xl',
              headerTitle: 'text-foreground',
              headerSubtitle: 'text-muted-foreground',
              socialButtonsBlockButton: 'bg-secondary text-secondary-foreground border-border hover:bg-secondary/80',
              formFieldLabel: 'text-foreground',
              formFieldInput: 'bg-background border-input text-foreground',
              footerActionLink: 'text-primary hover:text-primary/80',
              formButtonPrimary: 'bg-primary text-primary-foreground hover:bg-primary/90',
            },
          }}
        />
      </main>
      <Footer />
    </div>
  );
};

export default SignInPage;
