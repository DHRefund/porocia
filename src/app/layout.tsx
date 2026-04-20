import "./globals.css";
import Link from "next/link";
import { AuthProvider } from "@/components/auth-provider";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { Inter, Instrument_Serif } from "next/font/google";
import { SiteHeader } from "@/components/layout/site-header";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-heading",
});



export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${instrumentSerif.variable}`}>
      <body>
        <AuthProvider>
          <SiteHeader />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}