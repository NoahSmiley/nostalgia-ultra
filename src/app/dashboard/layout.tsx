import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { UpdateBanner, UpdateBannerSpacer } from "@/components/update-banner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Fixed banner at top */}
      <UpdateBanner />

      {/* Spacer to push content below banner */}
      <UpdateBannerSpacer />

      {/* Main layout with sidebar */}
      <DashboardSidebar />

      {/* Main content area - offset by sidebar width on desktop */}
      <main className="lg:pl-[200px]">
        {/* Mobile header spacer */}
        <div className="h-14 lg:hidden" />
        {/* Content container */}
        <div className="min-h-[calc(100vh-3.5rem)] lg:min-h-screen">
          <div className="max-w-6xl mx-auto px-6 lg:px-16 py-12 lg:py-20">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
