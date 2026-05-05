import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Rally Rewards',
  description: 'Your loyalty rewards platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white">{children}</body>
    </html>
  );
}
