import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ThemeProvider from "@/components/ThemeProvider";

export const metadata = {
  title: "FurniAI — Design Smart Furniture with AI",
  description:
    "Free AI-powered furniture design platform. Create custom wardrobes, sofas, tables, kitchens with real-time 3D preview and factory-ready export.",
  keywords: "furniture design, AI, 3D preview, custom furniture, interior design, kitchen design, factory export",
  metadataBase: new URL("https://furn-ai.vercel.app"),
  openGraph: {
    title: "FurniAI — Design Smart Furniture with AI",
    description: "Free AI-powered furniture design platform with real-time 3D preview and factory-ready export.",
    siteName: "FurniAI",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "FurniAI — Design Smart Furniture with AI",
    description: "Free AI-powered furniture design platform with real-time 3D preview.",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
