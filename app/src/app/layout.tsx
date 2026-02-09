import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PulseAI - AI-Powered API Analytics',
  description: 'Monitor, analyze, and optimize your APIs with AI-powered insights. Set up in 2 minutes.',
  keywords: ['API analytics', 'API monitoring', 'API performance', 'developer tools'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
