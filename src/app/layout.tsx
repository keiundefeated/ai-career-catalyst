import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Career Catalyst - Land Your Dream Job",
  description: "Upload your resume and paste a job description. Our AI will analyze your skill gaps and create a personalized 3-step roadmap.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="h-full">
        <body className={`${inter.variable} min-h-full antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
