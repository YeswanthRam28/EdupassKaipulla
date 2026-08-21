'use client';

import Header from '@/components/Header';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Prevent scrolling while loading
    document.body.style.overflow = 'hidden';
    const timer = setTimeout(() => {
      setIsLoading(false);
      document.body.style.overflow = '';
      window.scrollTo(0, 0);
    }, 2500);
    
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = '';
    };
  }, []);

  // Parallax hooks for Hero
  const heroRef = useRef(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroImageY = useTransform(heroScroll, [0, 1], ["0%", "30%"]);
  const heroTextY = useTransform(heroScroll, [0, 1], ["0%", "50%"]);
  const heroOpacity = useTransform(heroScroll, [0, 1], [1, 0]);

  // Horizontal Scroll hooks
  const horizontalRef = useRef(null);
  const { scrollYProgress: horizontalScroll } = useScroll({ 
    target: horizontalRef,
    offset: ["start start", "end end"]
  });
  // Map scroll progress (0 to 1) to horizontal translation (0% to -50%)
  const horizontalX = useTransform(horizontalScroll, [0, 1], ["0%", "-50%"]);

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="preloader"
            className="fixed inset-0 z-[1000] bg-[#113221] flex flex-col items-center justify-center text-white"
            exit={{ y: "-100%", transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
          >
            <div className="overflow-hidden">
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
                className="text-5xl md:text-7xl font-playfair font-bold tracking-tight"
              >
                EduPass.
              </motion.div>
            </div>
            {/* Loading progress bar */}
            <div className="absolute bottom-12 w-64 h-[1px] bg-white/20 overflow-hidden">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "0%" }}
                transition={{ duration: 2, ease: "easeInOut" }}
                className="w-full h-full bg-white"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Header />
      <main className="min-h-screen bg-[#F8F7F3]">
        
        {/* HERO SECTION - Parallax & Mask Reveals */}
        <section ref={heroRef} className="relative pt-32 pb-24 px-6 md:px-12 flex flex-col md:flex-row min-h-screen items-center overflow-hidden">
          <motion.div 
            style={{ y: heroImageY, opacity: heroOpacity }}
            className="w-full md:w-[55%] h-[60vh] md:h-[80vh] relative mt-12 md:mt-0"
          >
            {/* Image Mask Reveal */}
            <motion.div
              initial={{ clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)" }}
              animate={{ clipPath: isLoading ? "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)" : "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
              transition={{ duration: 1.5, delay: 0.2, ease: [0.76, 0, 0.24, 1] }}
              className="w-full h-full relative"
            >
              <Image 
                src="https://picsum.photos/seed/bellhopbed/1000/1200"
                alt="Student verified identity"
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
                priority
              />
            </motion.div>
          </motion.div>
          
          <motion.div 
            style={{ y: heroTextY }}
            className="w-full md:w-[45%] flex flex-col justify-center pl-0 md:pl-12 lg:pl-24 mt-16 md:mt-0"
          >
            <div className="relative inline-block max-w-xl">
              <h1 className="text-[3rem] md:text-[4rem] font-montserrat font-semibold leading-[1.1] text-[#113221] relative z-10">
                <span className="block overflow-hidden">
                  <motion.span 
                    initial={{ y: "100%" }} 
                    animate={{ y: isLoading ? "100%" : "0%" }} 
                    transition={{ duration: 0.8, delay: 0.3, ease: [0.76, 0, 0.24, 1] }} 
                    className="block"
                  >
                    It&apos;s about so much
                  </motion.span>
                </span>
                <span className="block overflow-hidden pt-2">
                  <motion.span 
                    initial={{ y: "100%" }} 
                    animate={{ y: isLoading ? "100%" : "0%" }} 
                    transition={{ duration: 0.8, delay: 0.4, ease: [0.76, 0, 0.24, 1] }} 
                    className="block"
                  >
                    more than a
                  </motion.span>
                </span>
              </h1>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                animate={{ opacity: isLoading ? 0 : 1, scale: isLoading ? 0.8 : 1, rotate: isLoading ? -10 : -3 }}
                transition={{ duration: 1, delay: 0.7, ease: "easeOut" }}
                className="absolute -bottom-4 md:-bottom-12 -left-4 md:-left-8 font-cursive text-[6rem] md:text-[10rem] text-[#4c618b] whitespace-nowrap z-0 select-none origin-left"
              >
                transcript.
              </motion.div>
            </div>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isLoading ? 0 : 1, y: isLoading ? 20 : 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="mt-16 md:mt-24 text-lg md:text-xl font-inter text-[#113221] max-w-md leading-relaxed z-10"
            >
              Our approach is student-first and privacy-led — proving what matters without exposing everything else.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isLoading ? 0 : 1, y: isLoading ? 20 : 0 }}
              transition={{ duration: 0.8, delay: 1.1 }}
              className="mt-12 z-10"
            >
              <Link href="/about" className="inline-flex items-center space-x-4 text-[#4c618b] font-montserrat font-medium hover:opacity-70 transition-opacity group">
                <span>See How It Works</span>
                <svg width="32" height="12" viewBox="0 0 32 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform duration-300 group-hover:translate-x-2">
                  <path d="M26 1L31 6M31 6L26 11M31 6H0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* WHAT WE DO SECTION - Horizontal Scroll & Mask Reveals */}
        <section ref={horizontalRef} className="h-[200vh] relative bg-[#F8F7F3]">
          <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
            <div className="px-6 md:px-12 mb-12">
              <motion.h2 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-sm font-montserrat font-bold tracking-widest uppercase text-[#113221]"
              >
                What We Do
              </motion.h2>
            </div>
            
            <motion.div style={{ x: horizontalX }} className="flex gap-8 md:gap-24 px-6 md:px-12 w-max items-center">
              {/* Project 1 */}
              <div className="group cursor-pointer flex flex-col w-[85vw] md:w-[50vw]">
                <div 
                  className="relative h-[50vh] md:h-[65vh] w-full overflow-hidden"
                  data-cursor="VIEW"
                >
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="w-full h-full relative"
                  >
                    <Image 
                      src="https://picsum.photos/seed/arro/1000/1000"
                      alt="Academic Passport"
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </motion.div>
                </div>
                <div className="mt-6 flex justify-between items-center">
                  <h3 className="text-2xl font-montserrat font-semibold text-[#113221]">Academic Passport</h3>
                  <svg width="40" height="12" viewBox="0 0 40 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#113221] transition-transform duration-300 group-hover:translate-x-2">
                    <path d="M34 1L39 6M39 6L34 11M39 6H0" />
                  </svg>
                </div>
              </div>

              {/* Project 2 */}
              <div className="group cursor-pointer flex flex-col w-[85vw] md:w-[50vw]">
                <div 
                  className="relative h-[50vh] md:h-[65vh] w-full overflow-hidden"
                  data-cursor="VIEW"
                >
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="w-full h-full relative"
                  >
                    <Image 
                      src="https://picsum.photos/seed/coba/1000/1000"
                      alt="Zero-Knowledge Proof"
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </motion.div>
                </div>
                <div className="mt-6 flex justify-between items-center">
                  <h3 className="text-2xl font-montserrat font-semibold text-[#113221]">Zero-Knowledge Proof</h3>
                  <svg width="40" height="12" viewBox="0 0 40 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#113221] transition-transform duration-300 group-hover:translate-x-2">
                    <path d="M34 1L39 6M39 6L34 11M39 6H0" />
                  </svg>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* WHY WE DO IT SECTION - 3D Scroll Triggered Reveal */}
        <section className="bg-[#E4DCCB] px-6 md:px-12 py-32 mt-12 overflow-hidden" style={{ perspective: 1000 }}>
          <motion.div 
            initial={{ opacity: 0, rotateX: 15, y: 100 }}
            whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="max-w-4xl"
            style={{ transformStyle: "preserve-3d" }}
          >
            <h2 className="text-sm font-montserrat font-bold tracking-widest uppercase text-[#113221] mb-8">Why We Do It</h2>
            
            <div className="relative inline-block mb-8">
              <h3 className="text-[2.5rem] md:text-[3.5rem] font-montserrat font-bold leading-[1.2] text-[#113221] relative z-10">
                Our why and how <br />
                give way to
              </h3>
              <motion.div 
                initial={{ opacity: 0, scale: 0.8, rotate: -15 }}
                whileInView={{ opacity: 1, scale: 1, rotate: -3 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3, ease: "backOut" }}
                className="absolute -bottom-8 -right-8 md:-right-24 font-cursive text-[5rem] md:text-[8rem] text-[#E85D34] whitespace-nowrap z-0 select-none origin-bottom-left"
              >
                the proof.
              </motion.div>
            </div>
            
            <p className="mt-12 md:mt-16 text-lg font-inter text-[#113221] max-w-xl leading-relaxed">
              A degree shouldn&apos;t require handing over your entire academic history just to prove one fact. We built EduPass so students stay in control — sharing exactly what a university, employer, or embassy needs, and nothing more.
            </p>
            
            <div className="mt-12">
              <Link href="/about" className="inline-flex items-center space-x-4 text-[#E85D34] font-montserrat font-medium hover:opacity-70 transition-opacity group">
                <span>Get To Know Us</span>
                <svg width="32" height="12" viewBox="0 0 32 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform duration-300 group-hover:translate-x-2">
                  <path d="M26 1L31 6M31 6L26 11M31 6H0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>
          </motion.div>
        </section>

        {/* CLIENTS CAROUSEL SECTION - Interactive Hover Marquee */}
        <section className="px-6 md:px-12 py-32 overflow-hidden bg-[#F8F7F3]" data-cursor="DRAG">
          {/* Using hover:[animation-play-state:paused] creates an interactive hover carousel effect */}
          <div className="flex items-center space-x-16 md:space-x-32 w-max animate-marquee hover:[animation-play-state:paused] cursor-pointer">
            <div className="flex flex-col items-center justify-center transition-transform hover:scale-105">
              <span className="text-3xl font-montserrat font-medium tracking-widest text-[#113221]">W3C</span>
              <span className="text-[10px] font-montserrat tracking-[0.2em] uppercase text-[#113221] mt-1">Verifiable Credentials</span>
            </div>
            <div className="flex flex-col items-center justify-center transition-transform hover:scale-105">
              <span className="text-3xl font-montserrat font-bold tracking-widest text-[#113221]">DID</span>
              <span className="text-xs font-montserrat tracking-[0.2em] uppercase text-[#113221] mt-1">Decentralized Identity</span>
            </div>
            <div className="flex flex-col items-center justify-center transition-transform hover:scale-105">
              <span className="text-4xl font-playfair font-bold tracking-widest text-[#113221]">ZK-SNARK</span>
              <span className="text-xs font-montserrat tracking-[0.2em] uppercase text-[#113221] mt-1">Proof Engine</span>
            </div>
            <div className="flex flex-col items-center justify-center transition-transform hover:scale-105">
              <span className="text-3xl font-playfair tracking-widest text-[#113221]">DIGILOCKER</span>
              <span className="text-[10px] font-montserrat tracking-widest text-[#113221] mt-1">Interoperable</span>
            </div>
            <div className="flex flex-col items-center justify-center transition-transform hover:scale-105">
              <span className="text-3xl font-montserrat tracking-widest text-[#113221]">UGC/AICTE</span>
              <span className="text-[10px] font-montserrat tracking-widest text-[#113221] mt-1">Accreditation-Ready</span>
            </div>
            
            {/* Duplicate for infinite effect */}
            <div className="flex flex-col items-center justify-center transition-transform hover:scale-105">
              <span className="text-3xl font-montserrat font-medium tracking-widest text-[#113221]">W3C</span>
              <span className="text-[10px] font-montserrat tracking-[0.2em] uppercase text-[#113221] mt-1">Verifiable Credentials</span>
            </div>
            <div className="flex flex-col items-center justify-center transition-transform hover:scale-105">
              <span className="text-3xl font-montserrat font-bold tracking-widest text-[#113221]">DID</span>
              <span className="text-xs font-montserrat tracking-[0.2em] uppercase text-[#113221] mt-1">Decentralized Identity</span>
            </div>
            <div className="flex flex-col items-center justify-center transition-transform hover:scale-105">
              <span className="text-4xl font-playfair font-bold tracking-widest text-[#113221]">ZK-SNARK</span>
              <span className="text-xs font-montserrat tracking-[0.2em] uppercase text-[#113221] mt-1">Proof Engine</span>
            </div>
            <div className="flex flex-col items-center justify-center transition-transform hover:scale-105">
              <span className="text-3xl font-playfair tracking-widest text-[#113221]">DIGILOCKER</span>
              <span className="text-[10px] font-montserrat tracking-widest text-[#113221] mt-1">Interoperable</span>
            </div>
            <div className="flex flex-col items-center justify-center transition-transform hover:scale-105">
              <span className="text-3xl font-montserrat tracking-widest text-[#113221]">UGC/AICTE</span>
              <span className="text-[10px] font-montserrat tracking-widest text-[#113221] mt-1">Accreditation-Ready</span>
            </div>
          </div>
        </section>

      </main>
      
      {/* FOOTER */}
      <footer className="bg-[#133221] text-white pt-24 pb-12 px-6 md:px-12 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 border-b border-[#2A4B3A] pb-16">
          
          <div className="md:col-span-5">
            <Link href="/" className="text-[4rem] md:text-[6rem] leading-none font-playfair font-bold text-[#698B75] hover:text-white transition-colors">
              EduPass.
            </Link>
          </div>
          
          <div className="md:col-span-2 flex flex-col space-y-4 pt-2">
            <Link href="/about" className="font-montserrat font-semibold tracking-widest uppercase text-sm hover:text-[#E85D34] transition-colors">About</Link>
            <Link href="/features" className="font-montserrat font-semibold tracking-widest uppercase text-sm hover:text-[#E85D34] transition-colors">Features</Link>
            <Link href="/demo" className="font-montserrat font-semibold tracking-widest uppercase text-sm hover:text-[#E85D34] transition-colors">Demo</Link>
            <Link href="/roadmap" className="font-montserrat font-semibold tracking-widest uppercase text-sm hover:text-[#E85D34] transition-colors">Roadmap</Link>
            <Link href="/contact" className="font-montserrat font-semibold tracking-widest uppercase text-sm hover:text-[#E85D34] transition-colors">Contact</Link>
          </div>
          
          <div className="md:col-span-3 flex flex-col space-y-2 pt-2">
            <h4 className="font-montserrat font-bold tracking-widest uppercase text-sm mb-2">Studio</h4>
            <p className="font-inter text-gray-300">Prove, don&apos;t reveal.</p>
          </div>
          
          <div className="md:col-span-2 flex space-x-6 justify-start md:justify-end pt-2">
            <a href="#" className="text-[#698B75] hover:text-white transition-colors" aria-label="GitHub">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
            </a>
            <a href="#" className="text-[#698B75] hover:text-white transition-colors" aria-label="LinkedIn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect x="2" y="9" width="4" height="12"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
            </a>
          </div>
        </div>
        
        <div className="pt-8">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#698B75]">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
      </footer>
    </>
  );
}
