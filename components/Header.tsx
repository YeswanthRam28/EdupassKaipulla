'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-8">
      {/* We use mix-blend-difference so the header works on dark and light backgrounds.
          Alternatively, if the header is always on light bg, we can just use normal colors.
          Looking at the screenshots, the header is on white in the hero, dark green in footer. 
          Actually, wait. The header is likely not mix-blend. The hero background is white. 
          Let's just use normal colors and make it absolute or sticky. */}
      
      <div className="text-3xl font-playfair font-bold tracking-tight text-[#113221]">
        <Link href="/">EduPass.</Link>
      </div>

      <button className="text-[#113221] hover:opacity-70 transition-opacity" aria-label="Menu">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      </button>
    </header>
  );
}
