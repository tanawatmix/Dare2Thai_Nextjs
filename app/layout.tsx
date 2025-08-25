import type { Metadata } from "next";
import "../styles/globals.css";
import { ThemeProvider } from "./ThemeContext";
import Head from "next/head";

export const metadata: Metadata = {
  title: "Dare2Thai",
  description: "Dare2Thai by 0203",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <Head>
        <link rel="icon" href="/D2T2.png" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist+Sans&family=Geist+Mono&family=Itim&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
