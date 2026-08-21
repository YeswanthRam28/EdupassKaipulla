import type { Metadata } from 'next';
import { Inter, Montserrat, Playfair_Display, Mrs_Saint_Delafield } from 'next/font/google';
import './globals.css';
import CustomCursor from '@/components/CustomCursor';
import Web3Providers from '@/app/providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });
const cursive = Mrs_Saint_Delafield({ weight: "400", subsets: ['latin'], variable: '--font-cursive' });

export const metadata: Metadata = {
  title: 'EduPass — Privacy-Preserving Academic Passport',
  description: 'Turn transcripts into programmable, cryptographically verifiable eligibility proofs.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${montserrat.variable} ${playfair.variable} ${cursive.variable}`}>
      <body className="bg-[#F8F7F3] text-[#113221] font-sans antialiased selection:bg-[#E85D34] selection:text-white" suppressHydrationWarning>
        <Web3Providers>
          <CustomCursor />
          {children}
        </Web3Providers>
      </body>
    </html>
  );
}
