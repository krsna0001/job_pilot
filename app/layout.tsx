import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthCallbackHandler from "./components/AuthCallbackHandler";
import PosthogPageView from "./components/PosthogPageView";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "JobPilot — AI Job Search Assistant",
  description:
    "JobPilot helps developers find jobs, score matches, and research companies with AI-powered insight.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-text-primary">
        <PosthogPageView />
        <AuthCallbackHandler />
        {children}
      </body>
    </html>
  );
}
