import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Forex Conversion Rate",
  description:
    "Get the latest currency exchange rate with Finage Forex Data API",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" sizes="any" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
