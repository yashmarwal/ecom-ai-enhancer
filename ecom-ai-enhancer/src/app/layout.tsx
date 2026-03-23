import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VisualCommerce AI — Product Enhancer',
  description: 'Upload a product photo and get an SEO title, description, and 3 AI-generated lifestyle images instantly.',
  openGraph: {
    title: 'VisualCommerce AI',
    description: 'AI-powered e-commerce product photo enhancer',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
