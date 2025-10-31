import { createFileRoute } from '@tanstack/react-router';
import { LoginForm } from '@/components/auth/login-form';
import { Logo } from '@/components/shared/logo';
import { z } from 'zod';

const loginSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute('/auth/login')({
  component: Login,
  validateSearch: loginSchema,
});

function Login() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Logo size="lg" href="/" showText={false} />
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
