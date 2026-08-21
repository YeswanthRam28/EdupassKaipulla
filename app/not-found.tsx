'use client';

import Header from '@/components/Header';
import Link from 'next/link';

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#F8F7F3] flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-6xl font-playfair font-bold text-[#113221]">404</h1>
        <p className="mt-4 text-lg font-inter text-[#113221]/70">
          The requested page or credential route could not be found.
        </p>
        <Link
          href="/"
          className="mt-8 bg-[#E85D34] hover:bg-[#d44c25] text-white font-montserrat font-semibold px-6 py-3 rounded-full transition-colors"
        >
          Return Home
        </Link>
      </main>
    </>
  );
}
