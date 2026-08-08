import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GlobalProviders } from "~/providers/global";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "LeafForm",
  description: "LeafForm Web Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className={`${inter.className} ${inter.variable} antialiased`}>
        <GlobalProviders>{children}</GlobalProviders>
      </body>
    </html>
  );
}
