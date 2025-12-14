interface BrandProps {
  className?: string;
}

export function Brand({ className = "" }: BrandProps) {
  return (
    <span className={`font-[family-name:var(--font-minecraft)] ${className}`}>
      Endless
    </span>
  );
}
