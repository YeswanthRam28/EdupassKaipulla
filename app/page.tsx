'use client';

import Header from '@/components/Header';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#E5E4DF] text-[#131313] font-mono selection:bg-[#FF5C00] selection:text-black">
      <Header />

      <main className="w-full">
        {/* HERO SECTION - Full Viewport Hero matching Screenshot */}
        <section className="w-full border-b border-[#131313] min-h-[calc(100vh-65px)] flex flex-col justify-between px-6 md:px-12 py-10">
          <div className="w-full max-w-[1440px] mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: ABOUT & Description */}
            <div className="lg:col-span-3 flex flex-col justify-center gap-6">
              <span className="font-mono text-xs font-semibold tracking-wider uppercase text-[#131313]">
                ABOUT
              </span>
              <p className="font-mono text-xs md:text-sm leading-relaxed uppercase text-[#131313] max-w-[320px]">
                BUILDING A PRIVACY-PRESERVING ACADEMIC PASSPORT THAT TURNS TRANSCRIPTS INTO VERIFIABLE, ZERO-KNOWLEDGE PROOFS — SO STUDENTS PROVE WHAT MATTERS WITHOUT REVEALING EVERYTHING ELSE.
              </p>
            </div>

            {/* Center Column: PRIVACY PASSPORT Display */}
            <div className="lg:col-span-6 flex flex-col justify-center items-center text-center py-4">
              <h1 className="font-anton text-[4.5rem] sm:text-[7rem] md:text-[9.5rem] leading-[0.88] tracking-tight uppercase text-[#131313] select-none">
                PRIVACY<br />PASSPORT
              </h1>
            </div>

            {/* Right Column: Location Status & Tagline */}
            <div className="lg:col-span-3 flex flex-col justify-between items-end h-full gap-16 lg:gap-32 py-2">
              <div className="text-right">
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#131313]">
                  LOCATION: INDIA &nbsp; STATUS: LIVE
                </span>
              </div>

              <div className="flex flex-col gap-2 w-full max-w-[240px]">
                <div className="border-l border-[#131313] pl-4 font-mono text-xs font-semibold leading-snug uppercase text-[#131313]">
                  DON&apos;T SEND YOUR TRANSCRIPT.<br />PROVE IT.
                </div>
                <div className="border-b border-[#131313] w-full pt-1" />
              </div>
            </div>

          </div>
        </section>

        {/* MARQUEE BANNER SECTION - Industrial Orange */}
        <section className="w-full bg-[#FF5C00] border-b border-[#131313] overflow-hidden py-8">
          <div className="animate-marquee font-archivo font-extrabold text-2xl md:text-4xl tracking-tight uppercase text-[#131313] flex gap-8">
            <span>GETTING A TRANSCRIPT TAKES WEEKS. VERIFYING ONE TAKES ANOTHER. EDUPASS TAKES SECONDS. •</span>
            <span>GETTING A TRANSCRIPT TAKES WEEKS. VERIFYING ONE TAKES ANOTHER. EDUPASS TAKES SECONDS. •</span>
            <span>GETTING A TRANSCRIPT TAKES WEEKS. VERIFYING ONE TAKES ANOTHER. EDUPASS TAKES SECONDS. •</span>
            <span>GETTING A TRANSCRIPT TAKES WEEKS. VERIFYING ONE TAKES ANOTHER. EDUPASS TAKES SECONDS. •</span>
          </div>
        </section>

        {/* TWO COLUMN STATEMENT SECTION */}
        <section className="w-full max-w-[1440px] mx-auto border-b border-[#131313]">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#131313]">
            <div className="p-10 md:p-16 flex items-center">
              <h2 className="font-archivo font-bold text-3xl md:text-5xl leading-[1.1] uppercase text-[#131313]">
                PROVE WHAT MATTERS WITHOUT REVEALING EVERYTHING ELSE
              </h2>
            </div>
            <div className="p-10 md:p-16 flex items-center">
              <h2 className="font-archivo font-bold text-3xl md:text-5xl leading-[1.1] uppercase text-[#131313]">
                RECORDS OWNED BY THE STUDENT, NOT THE GATEKEEPER
              </h2>
            </div>
          </div>
        </section>

        {/* NUMBERED FEATURE BREAKDOWN SECTION ([01] to [05]) */}
        <section className="w-full max-w-[1440px] mx-auto border-b border-[#131313] px-6 md:px-12 py-16 md:py-24">
          <div className="flex flex-col">
            
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-12 border-b border-[#131313] py-6 md:py-8 items-start gap-4">
              <div className="md:col-span-2 font-mono text-xs font-semibold tracking-wider text-[#131313]">
                [01]
              </div>
              <div className="md:col-span-10 flex flex-col md:flex-row md:items-center justify-between gap-2">
                <h3 className="font-archivo font-semibold text-xl md:text-2xl uppercase text-[#131313]">
                  VERIFIABLE CREDENTIALS
                </h3>
                <p className="font-mono text-xs md:text-sm text-[#333333] max-w-xl uppercase">
                  Building clear cryptographic commitments, strong payload privacy, and digital identities that feel distinctive and intentional.
                </p>
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-12 border-b border-[#131313] py-6 md:py-8 items-start gap-4">
              <div className="md:col-span-2 font-mono text-xs font-semibold tracking-wider text-[#131313]">
                [02]
              </div>
              <div className="md:col-span-10 flex flex-col md:flex-row md:items-center justify-between gap-2">
                <h3 className="font-archivo font-semibold text-xl md:text-2xl uppercase text-[#131313]">
                  ZERO-KNOWLEDGE PROOFS
                </h3>
                <p className="font-mono text-xs md:text-sm text-[#333333] max-w-xl uppercase">
                  Developing privacy-first eligibility proofs with zero-knowledge circuits, smooth performance, and precise execution.
                </p>
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 md:grid-cols-12 border-b border-[#131313] py-6 md:py-8 items-start gap-4">
              <div className="md:col-span-2 font-mono text-xs font-semibold tracking-wider text-[#131313]">
                [03]
              </div>
              <div className="md:col-span-10 flex flex-col md:flex-row md:items-center justify-between gap-2">
                <h3 className="font-archivo font-semibold text-xl md:text-2xl uppercase text-[#131313]">
                  AI MOBILITY AGENT
                </h3>
                <p className="font-mono text-xs md:text-sm text-[#333333] max-w-xl uppercase">
                  Using intelligent parsing to evaluate admission criteria, structure academic equivalencies, and streamline international mobility.
                </p>
              </div>
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-1 md:grid-cols-12 border-b border-[#131313] py-6 md:py-8 items-start gap-4">
              <div className="md:col-span-2 font-mono text-xs font-semibold tracking-wider text-[#131313]">
                [04]
              </div>
              <div className="md:col-span-10 flex flex-col md:flex-row md:items-center justify-between gap-2">
                <h3 className="font-archivo font-semibold text-xl md:text-2xl uppercase text-[#131313]">
                  INSTANT VERIFICATION
                </h3>
                <p className="font-mono text-xs md:text-sm text-[#333333] max-w-xl uppercase">
                  Translating university records into instant verifier outputs that execute on EVM devnets and public testnets without latency.
                </p>
              </div>
            </div>

            {/* Row 5 */}
            <div className="grid grid-cols-1 md:grid-cols-12 py-6 md:py-8 items-start gap-4">
              <div className="md:col-span-2 font-mono text-xs font-semibold tracking-wider text-[#131313]">
                [05]
              </div>
              <div className="md:col-span-10 flex flex-col md:flex-row md:items-center justify-between gap-2">
                <h3 className="font-archivo font-semibold text-xl md:text-2xl uppercase text-[#131313]">
                  CREDENTIAL FIREWALL
                </h3>
                <p className="font-mono text-xs md:text-sm text-[#333333] max-w-xl uppercase">
                  Shaping student-owned records into secure off-chain storage containers that stay flexible, purposeful, and immune to tampering.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* PASSPORT & GRADE BREAKDOWN SECTION */}
        <section className="w-full max-w-[1440px] mx-auto border-b border-[#131313]">
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#131313]">
            
            {/* Left Column: PASSPORT Title & Stamp */}
            <div className="lg:col-span-5 p-10 md:p-16 flex flex-col justify-between gap-12">
              <h2 className="font-anton text-6xl md:text-8xl uppercase text-[#131313]">
                PASSPORT
              </h2>

              <div className="bg-[#FF5C00] border border-[#131313] p-6 w-full max-w-xs flex flex-col gap-4">
                <div className="font-mono text-xs font-bold uppercase tracking-wider text-[#131313]">
                  T. CASSEROTTI
                </div>
                <div className="font-mono text-[10px] uppercase text-[#131313]/80 leading-tight">
                  VERIFIED ACADEMIC IDENTITY<br />
                  ISSUER: STANFORD UNIVERSITY<br />
                  COMMITMENT: 0x8F92...B3A1
                </div>
                <div className="h-2 w-full bg-[#131313]" />
              </div>
            </div>

            {/* Right Column: Grade Breakdown List */}
            <div className="lg:col-span-7 p-10 md:p-16 flex flex-col gap-8 justify-center">
              <p className="font-mono text-sm md:text-base leading-relaxed uppercase text-[#131313]">
                A single verifiable credential layer that travels with the student — across universities, employers, and borders.
              </p>

              <div className="flex flex-col border-t border-[#131313]">
                <div className="flex justify-between items-center py-3 border-b border-[#131313] font-mono text-xs md:text-sm">
                  <span className="font-archivo font-bold text-base uppercase text-[#131313]">KORMAN</span>
                  <span className="font-bold text-[#131313]">95</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-[#131313] font-mono text-xs md:text-sm">
                  <span className="font-archivo font-bold text-base uppercase text-[#131313]">DRUMWRIGHT</span>
                  <span className="font-bold text-[#131313]">92</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-[#131313] font-mono text-xs md:text-sm">
                  <span className="font-archivo font-bold text-base uppercase text-[#131313]">MILTURGE</span>
                  <span className="font-bold text-[#131313]">92</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-[#131313] font-mono text-xs md:text-sm">
                  <span className="font-archivo font-bold text-base uppercase text-[#131313]">TSENG</span>
                  <span className="font-bold text-[#131313]">85</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-[#131313] font-mono text-xs md:text-sm">
                  <span className="font-archivo font-bold text-base uppercase text-[#131313]">PRICE</span>
                  <span className="font-bold text-[#131313]">85+</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* INTERACTIVE WEB3 CARDS SECTION ("DON'T SEND YOUR TRANSCRIPT. PROVE IT.") */}
        <section className="w-full max-w-[1440px] mx-auto border-b border-[#131313] px-6 md:px-12 py-16 md:py-24">
          <div className="flex flex-col gap-12">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-[#131313] pb-6">
              <h2 className="font-anton text-5xl md:text-7xl uppercase text-[#131313] max-w-3xl leading-[0.95]">
                DON&apos;T SEND YOUR TRANSCRIPT. PROVE IT.
              </h2>
              <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[#131313]">
                [ 03 PORTALS ACTIVE ]
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              
              {/* Card 1: DASH / ISSUE */}
              <div className="bg-[#E2E1DC] border border-[#131313] p-8 flex flex-col justify-between gap-6 hover:border-[#FF5C00] transition-colors group">
                <div className="flex justify-between items-start">
                  <span className="font-mono text-xs font-bold text-[#131313]">[ 01 ]</span>
                  <Link 
                    href="/issue" 
                    className="font-mono text-xs font-semibold uppercase border border-[#131313] px-3 py-1 bg-white hover:bg-[#131313] hover:text-white transition-colors"
                  >
                    ISSUE PROJECT ↗
                  </Link>
                </div>
                <div>
                  <h3 className="font-archivo font-bold text-3xl uppercase text-[#131313] group-hover:text-[#FF5C00] transition-colors">
                    DASH
                  </h3>
                  <span className="font-archivo font-semibold text-xs text-[#6B7280] uppercase tracking-wider block mt-1">
                    INSTITUTION ISSUANCE PORTAL
                  </span>
                  <p className="font-mono text-xs text-[#131313] leading-relaxed uppercase mt-4">
                    A custom Web3 workflow shaped for modern universities and accredited institutions. Issue cryptographically signed commitments on-chain in seconds.
                  </p>
                </div>
              </div>

              {/* Card 2: RACEPOINT / VERIFY */}
              <div className="bg-[#E2E1DC] border border-[#131313] p-8 flex flex-col justify-between gap-6 hover:border-[#FF5C00] transition-colors group">
                <div className="flex justify-between items-start">
                  <span className="font-mono text-xs font-bold text-[#131313]">[ 02 ]</span>
                  <Link 
                    href="/verify" 
                    className="font-mono text-xs font-semibold uppercase border border-[#131313] px-3 py-1 bg-white hover:bg-[#131313] hover:text-white transition-colors"
                  >
                    VERIFY PORTAL ↗
                  </Link>
                </div>
                <div>
                  <h3 className="font-archivo font-bold text-3xl uppercase text-[#131313] group-hover:text-[#FF5C00] transition-colors">
                    RACEPOINT
                  </h3>
                  <span className="font-archivo font-semibold text-xs text-[#6B7280] uppercase tracking-wider block mt-1">
                    PUBLIC VERIFICATION SYSTEM
                  </span>
                  <p className="font-mono text-xs text-[#131313] leading-relaxed uppercase mt-4">
                    Instant verifier portal with off-chain JSON hash integrity verification against on-chain smart contract state. Zero phone calls, zero waiting.
                  </p>
                </div>
              </div>

              {/* Card 3: PASSPORT / DASHBOARD */}
              <div className="bg-[#E2E1DC] border border-[#131313] p-8 flex flex-col justify-between gap-6 hover:border-[#FF5C00] transition-colors group">
                <div className="flex justify-between items-start">
                  <span className="font-mono text-xs font-bold text-[#131313]">[ 03 ]</span>
                  <Link 
                    href="/passport" 
                    className="font-mono text-xs font-semibold uppercase border border-[#131313] px-3 py-1 bg-white hover:bg-[#131313] hover:text-white transition-colors"
                  >
                    MY PASSPORT ↗
                  </Link>
                </div>
                <div>
                  <h3 className="font-archivo font-bold text-3xl uppercase text-[#131313] group-hover:text-[#FF5C00] transition-colors">
                    PASSPORT
                  </h3>
                  <span className="font-archivo font-semibold text-xs text-[#6B7280] uppercase tracking-wider block mt-1">
                    STUDENT CREDENTIAL HUB
                  </span>
                  <p className="font-mono text-xs text-[#131313] leading-relaxed uppercase mt-4">
                    Student dashboard containing verified academic records, cryptographic commitments, and zero-knowledge eligibility proof generators.
                  </p>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* GIANT ORANGE FOOTER & CTA SECTION (#FF5C00) */}
        <footer className="w-full bg-[#FF5C00] border-t border-[#131313] text-[#131313] pt-16 md:pt-24 pb-8">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex flex-col gap-16">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              
              {/* Left Column: CTA Title & Subtext */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                <h2 className="font-anton text-5xl sm:text-6xl md:text-7xl leading-[0.95] uppercase text-[#131313]">
                  LET&apos;S MAKE YOUR NEXT CREDENTIAL VERIFIABLE.
                </h2>
                <p className="font-mono text-xs md:text-sm uppercase leading-relaxed text-[#131313] max-w-xl">
                  IT&apos;S TIME TRANSCRIPTS WERE STUDENT-OWNED, NOT PROXIED BY LATENCY AND MANUAL GATEKEEPERS. LET&apos;S BUILD THE WEB3 LAYER TOGETHER.
                </p>
              </div>

              {/* Right Column: Links */}
              <div className="lg:col-span-5 grid grid-cols-2 gap-8 font-mono text-xs uppercase tracking-wider text-[#131313]">
                <div className="flex flex-col gap-3">
                  <span className="font-bold border-b border-[#131313] pb-2">PORTALS</span>
                  <Link href="/issue" className="hover:underline">ISSUE CREDENTIAL</Link>
                  <Link href="/verify" className="hover:underline">VERIFY PORTAL</Link>
                  <Link href="/passport" className="hover:underline">STUDENT PASSPORT</Link>
                </div>
                <div className="flex flex-col gap-3">
                  <span className="font-bold border-b border-[#131313] pb-2">CONNECT</span>
                  <a href="https://github.com/YeswanthRam28/EdupassKaipulla" target="_blank" rel="noreferrer" className="hover:underline">GITHUB ↗</a>
                  <a href="#" className="hover:underline">TWITTER / X ↗</a>
                  <a href="#" className="hover:underline">DOCUMENTATION ↗</a>
                </div>
              </div>

            </div>

            {/* Giant EDUPASS Footer Typography */}
            <div className="pt-8 border-t border-[#131313] text-center">
              <h1 className="font-anton text-[16vw] leading-none tracking-tight uppercase text-[#131313] select-none">
                EDUPASS
              </h1>
            </div>

          </div>
        </footer>

      </main>
    </div>
  );
}
