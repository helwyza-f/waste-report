import PushPermissionBanner from "@/components/push-permission-banner"
import PWAInstallPrompt from "@/components/pwainstallprompt";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PushPermissionBanner />
      <PWAInstallPrompt />
      {children}
    </>
  );
}