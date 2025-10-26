import { cn } from '@/lib/utils';
import { Link } from '@tanstack/react-router';
import { Image } from '@unpic/react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  href?: string;
  className?: string;
}

export function Logo({
  size = 'md',
  showText = true,
  href = '/',
  className,
}: LogoProps) {
  const sizeMap = {
    sm: { logo: 32, text: 'text-base', classes: 'w-8 h-8' },
    md: { logo: 48, text: 'text-lg', classes: 'w-12 h-12' },
    lg: { logo: 64, text: 'text-xl', classes: 'w-16 h-16' },
    xl: { logo: 80, text: 'text-2xl', classes: 'w-20 h-20' },
  };

  const logoSize = sizeMap[size].logo;
  const textSize = sizeMap[size].text;
  const logoClasses = sizeMap[size].classes;

  const content = (
    <div className={cn('flex items-center gap-3', className)}>
      <Image
        src="/logo.png"
        alt="Turbodoc"
        width={logoSize}
        height={logoSize}
        className={cn('object-contain', logoClasses)}
        priority
      />
      {showText && (
        <span className={cn('font-bold text-black dark:text-white', textSize)}>
          Turbodoc
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link to={href} className="transition-opacity hover:opacity-80">
        {content}
      </Link>
    );
  }

  return content;
}
