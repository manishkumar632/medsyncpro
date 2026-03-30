// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { config } from "@/lib/config";
import { AuthProvider } from "@/app/context/AuthContext";

export const metadata: Metadata = {
  title: "MedSyncpro – Health & Wellness Store",
  description:
    "Your trusted online pharmacy for medicines, skincare, baby care, supplements and wellness products. Flat 20% off your first order.",
  metadataBase: new URL(config.apiUrl),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
