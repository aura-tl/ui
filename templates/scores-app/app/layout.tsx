import type { Metadata } from 'next';
import './globals.css';
import { AuraWatermark } from '../components/aura-watermark';

export const metadata: Metadata = {
  title: 'Aura Scores',
  description: 'Live scores powered by Aura',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}<AuraWatermark /></body></html>;
}
