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
    <div className={`flex items-baseline ${className}`}>
      <span className="font-[family-name:var(--font-minecraft)] text-xl text-white">
        Endless
      </span>
    </div>
  );
};
