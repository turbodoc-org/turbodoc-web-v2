import { createFileRoute } from '@tanstack/react-router';
import { ForgotPasswordForm } from '@/components/forgot-password-form';
import { Logo } from '@/components/logo';

export const Route = createFileRoute('/auth/forgot-password')({
  component: ForgotPassword,
});

function ForgotPassword() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Logo size="lg" href="/" showText={false} />
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
