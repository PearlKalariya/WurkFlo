import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WurkFlo - Project Task Management",
  description: "Modern agile project management for software development teams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
