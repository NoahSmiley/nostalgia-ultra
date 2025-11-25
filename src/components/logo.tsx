import Link from "next/link";

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = "",
  showText = true,
}) => {
  return (
    <div className={`flex items-baseline gap-1 ${className}`}>
      <span className="text-xl font-normal text-white tracking-tighter">nostalgia</span>
      {showText && (
        <span className="font-[family-name:var(--font-minecraft)] text-xs text-white">
          ULTRA
        </span>
      )}
    </div>
  );
};
