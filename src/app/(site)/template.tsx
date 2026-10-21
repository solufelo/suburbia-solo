import { PageWipe } from "@/components/PageWipe";

/** Re-mounts on every navigation between shop pages, which is what drives the wipe. */
export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageWipe />
      {children}
    </>
  );
}
