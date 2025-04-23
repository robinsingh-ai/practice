import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import app from "@/lib/firebase"; // Import Firebase app to ensure it's initialized

const inter = Inter({ subsets: ["latin"] });

// Log Firebase initialization on the server side
console.log("Firebase app initialized in layout:", !!app);

export const metadata: Metadata = {
  title: "Waterlily Survey",
  description: "Create and share surveys with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          <Navbar />
          <main className="container mx-auto py-4 px-4">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
