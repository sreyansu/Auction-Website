interface TeamLogoProps {
  src: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  xs: 'w-5 h-5',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
};

export default function TeamLogo({ src, name, size = 'md', className = '' }: TeamLogoProps) {
  return (
    <img
      src={src}
      alt={name}
      className={`${sizeMap[size]} rounded-full object-cover ${className}`}
      style={{ border: '2px solid var(--color-border)' }}
    />
  );
}
