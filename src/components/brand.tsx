interface BrandProps {
  className?: string;
}

export function Brand({ className = "" }: BrandProps) {
  return (
    <span className={`inline-flex items-baseline gap-0.5 ${className}`}>
      <span className="tracking-tighter">nostalgia</span>
      <span className="font-[family-name:var(--font-minecraft)] text-[0.7em]">ULTRA</span>
    </span>
  );
}
