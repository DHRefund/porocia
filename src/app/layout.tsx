import "./globals.css";
import Link from "next/link";
import { AuthProvider } from "@/components/auth-provider";
import { cn } from "@/lib/utils";
import { Geist, Inter, Noto_Serif_JP } from "next/font/google";
import { SiteHeader } from "@/components/layout/site-header";



const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});


const notoSerifJP = Noto_Serif_JP({
  weight: ["400","700"],
  subsets: ["latin"],
  variable: "--font-noto-serif-jp",
  preload: false,
  display: "swap", // ✅ Tránh blocking render
});



export default function RootLayout({children,}: { children: React.ReactNode;}) {
  return (
    <html lang="en" className={`${geistSans.variable}  ${notoSerifJP.variable}`}>
      <body>
        <AuthProvider>
          <SiteHeader />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}