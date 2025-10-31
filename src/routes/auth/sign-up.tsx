import { createFileRoute } from '@tanstack/react-router';
import { SignUpForm } from '@/components/auth/sign-up-form';
import { Logo } from '@/components/shared/logo';

export const Route = createFileRoute('/auth/sign-up')({
  component: SignUp,
});

function SignUp() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Logo size="lg" href="/" showText={false} />
        </div>
        <SignUpForm />
      </div>
    </div>
  );
}
