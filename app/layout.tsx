import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.css";
import { ThemeProvider } from "./ThemeContext"; // หรือ path ที่ถูกต้อง
import Head from "next/head";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dare2Thai",
  description: "Dare2Thai by 0203",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <Head>
          <link rel="icon" href="./../public/D2T2.png" />
        </Head>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
 