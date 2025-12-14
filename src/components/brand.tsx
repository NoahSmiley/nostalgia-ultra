interface BrandProps {
  className?: string;
}

export function Brand({ className = "" }: BrandProps) {
  return (
    <span className={`font-semibold ${className}`}>
      endless
    </span>
  );
}
