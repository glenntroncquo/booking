import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Salonify Booking",
    template: "%s | Salonify",
  },
  description: "Book your salon appointment online with Salonify.",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body className="min-h-screen antialiased">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
