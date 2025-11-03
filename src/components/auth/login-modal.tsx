import { Dialog, DialogContent } from '@/components/ui/dialog';
import { LoginForm } from '@/components/auth/login-form';
import { Logo } from '@/components/shared/logo';

interface LoginModalProps {
  open: boolean;
  search?: { redirect: string | undefined };
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function LoginModal({
  open,
  onOpenChange,
  onSuccess,
  search,
}: LoginModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <div className="w-full max-w-sm mx-auto">
          <div className="flex justify-center mb-8">
            <Logo size="lg" href="/" showText={false} />
          </div>
          <LoginForm search={search} onSuccess={onSuccess} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
