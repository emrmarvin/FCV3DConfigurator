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
  let r = (Math.random() + 1).toString(36).substring(7);
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/x-icon" href="https://cdn.autodesk.io/favicon.ico" />
        <link rel="stylesheet" href="https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/style.css" />
        <Script src={"https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/viewer3D.js?r=" + r} strategy="beforeInteractive" id="autodesk_external_script"/>
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
