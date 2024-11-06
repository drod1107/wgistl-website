// app/layout.tsx
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter, Montserrat, Oswald } from "next/font/google";
import { Metadata } from "next";

// Load fonts
const inter = Inter({ subsets: ["latin"] });
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
});
const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-oswald",
});

export const metadata: Metadata = {
  title: "WGISTL - What's Good in St. Louis?",
  description: "Amplifying voices and connecting resources in St. Louis' nonprofit space.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${montserrat.variable} ${oswald.variable}`}>
        <ClerkProvider
          appearance={{
            elements: {
              footer: "hidden",
              headerSubtitle: "hidden",
            },
          }}
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
