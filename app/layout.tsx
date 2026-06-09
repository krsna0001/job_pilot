import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthCallbackHandler from "./components/AuthCallbackHandler";
import PosthogPageView from "./components/PosthogPageView";
import ThemeProvider from "@/components/ThemeProvider";

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
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-background text-text-primary">
        <script dangerouslySetInnerHTML={{
          __html: `(function(){try{var t=localStorage.getItem('jobpilot-theme');if(t&&t!=='default')document.documentElement.setAttribute('data-theme',t)}catch(e){}})()`
        }} />
        <ThemeProvider>
          <PosthogPageView />
          <AuthCallbackHandler />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
