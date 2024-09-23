import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Viewer",
  description: "Viewer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/x-icon" href="https://cdn.autodesk.io/favicon.ico" />
        <link rel="stylesheet" href="https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/style.css" />
        <Script src="https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/viewer3D.js" strategy="afterInteractive" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
