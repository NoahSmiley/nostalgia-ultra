import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="flex flex-col items-center text-center">
        <div className="w-[300px] h-[300px] mb-6 relative">
          <img
            src="/minecraft-sticker.gif"
            alt="Minecraft"
            className="w-full h-full object-contain"
          />
        </div>
        <h1 className="mb-8 flex items-baseline gap-2">
          <span className="text-3xl font-normal text-white tracking-tighter">nostalgia</span>
          <span className="font-[family-name:var(--font-minecraft)] text-xl text-white">
            ULTRA
          </span>
        </h1>

        <div>
          <Link
            href="/login"
            className="px-8 py-3 text-sm font-medium text-black bg-white border border-white rounded-md hover:bg-white/90 transition-all inline-block"
          >
            Sign In with Microsoft
          </Link>
        </div>
      </div>
    </div>
  );
}
