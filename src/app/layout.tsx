import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { Geist, Noto_Serif_JP } from "next/font/google";


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
  display: "swap",
});

export default function RootLayout({children,}: { children: React.ReactNode;}) {
  return (
    <html lang="en" className={`${geistSans.variable}  ${notoSerifJP.variable}`}>
      <body className="bg-background antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}