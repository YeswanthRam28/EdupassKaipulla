import type { Metadata } from 'next';
import { Anton, Archivo_Narrow, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import CustomCursor from '@/components/CustomCursor';
import Web3Providers from '@/app/providers';

const anton = Anton({ 
  weight: '400', 
  subsets: ['latin'], 
  variable: '--font-anton' 
});

const archivo = Archivo_Narrow({ 
  subsets: ['latin'], 
  variable: '--font-archivo',
  weight: ['400', '500', '600', '700']
});

const mono = JetBrains_Mono({ 
  subsets: ['latin'], 
  variable: '--font-mono',
  weight: ['400', '500', '600', '700']
});

export const metadata: Metadata = {
  title: 'EDUPASS — Privacy-Preserving Academic Passport',
  description: 'Turn transcripts into programmable, cryptographically verifiable eligibility proofs.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${anton.variable} ${archivo.variable} ${mono.variable}`}>
      <body className="bg-[#EAE9E4] text-[#131313] font-mono antialiased selection:bg-[#FF5C00] selection:text-black" suppressHydrationWarning>
        <Web3Providers>
          <CustomCursor />
          {children}
        </Web3Providers>
      </body>
    </html>
  );
}
