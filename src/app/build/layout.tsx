import { SkateboardProvider } from "@/contexts/SkateboardContext";

export default function BuildLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SkateboardProvider>
      {children}
    </SkateboardProvider>
  );
}
