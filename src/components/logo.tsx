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
      <span className="text-xl font-semibold text-white">
        endless
      </span>
    </div>
  );
};
