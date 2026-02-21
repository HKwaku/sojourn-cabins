'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

function ChevronLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 6 15 12 9 18" />
    </svg>
  );
}

// -------- HERO IMAGES (edit paths if needed) --------
const heroSlides = [
  { src: '/cabins/ext3.JPG', alt: '' },
  { src: '/cabins/4a4.jpg', alt: '' },
  { src: '/cabins/sea4.jpg', alt: '' },
  { src: '/cabins/sun.jpg', alt: '' },
  { src: '/cabins/sand.jpg', alt: '' },
  { src: '/cabins/ext13.jpg', alt: '' },
  { src: '/cabins/ext2.JPG', alt: '' },
  { src: '/cabins/coc.JPG', alt: '' },
  { src: '/cabins/exper1.jpg', alt: '' },
];

// -------- CATEGORY SLIDESHOWS (you will update images) --------
const galleryCategories = [
  {
    title: 'Exterior',
    description: 'Cabin exteriors and the surrounding landscape.',
    images: ['/cabins/ext00.JPG', '/cabins/ext1.JPG', '/cabins/ext2.JPG', '/cabins/ext3.JPG', '/cabins/ext4.jpg', '/cabins/ext5.jpg', '/cabins/ext8.JPG', '/cabins/ext9.JPG' ],
  },
  {
    title: 'Interior',
    description: 'Calm, minimal interiors designed for slow stays.',
    images: ['/cabins/int1.jpg', '/cabins/int2.jpg', '/cabins/int4.jpg', '/cabins/int5.jpg', '/cabins/int6.jpg', '/cabins/int7.jpg'],
  },
  {
    title: 'Chef Experience',
    description: 'Private dining and chef-led experiences.',
    images: ['/cabins/chef1.jpg', '/cabins/chef2.jpg', '/cabins/chef3.jpg', '/cabins/chef4.jpg', '/cabins/chef5.jpg'],
  },
  {
    title: 'Wellness',
    description: 'Guided wellness, massages and facials.',
    images: ['/cabins/well1.jpg', '/cabins/well3.jpg'],
  },
  {
    title: 'Sip & Paint',
    description: 'Creative evenings with a glass in hand.',
    images: ['/cabins/sip1.jpg', '/cabins/sip2.jpg'],
  },
  {
    title: 'Firepit Nights',
    description: 'Slow evenings, open skies and crackling fires.',
    images: ['/cabins/fire1.jpg', '/cabins/sax1.jpg', '/cabins/fire3.jpg', '/cabins/fire4.jpg'],
  },
  {
    title: 'Cinema Experience',
    description: 'Cinema experience under the stars',
    images: ['/cabins/cin1.jpg'],
  },
  {
    title: 'Outdoors & Activities',
    description: 'Immerse yourself in the history and culture of coastal Ghana',
    images: ['/cabins/hik1.jpg', '/cabins/hik2.jpg'],
  },
];

// -------- Mini slideshow for each category --------
function MiniSlideshow({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const goNext = useCallback(() => {
    setIndex((i) => (i + 1) % images.length);
    setPaused(true);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setIndex((i) => (i - 1 + images.length) % images.length);
    setPaused(true);
  }, [images.length]);

  useEffect(() => {
    if (!images || images.length <= 1 || paused) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, 6000);
    return () => clearInterval(id);
  }, [images, paused]);

  useEffect(() => {
    if (!paused) return;
    const id = setTimeout(() => setPaused(false), 12000);
    return () => clearTimeout(id);
  }, [paused]);

  if (!images || images.length === 0) return null;

  return (
    <div className="group relative w-full h-full">
      {images.map((img, i) => (
        <Image
          key={img}
          src={img}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className={`object-cover absolute inset-0 transition-opacity duration-[1200ms] ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`}
          loading={i === 0 ? 'eager' : 'lazy'}
        />
      ))}

      {images.length > 1 && (
        <>
          <button
            onClick={goPrev}
            aria-label="Previous image"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/50"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={goNext}
            aria-label="Next image"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/50"
          >
            <ChevronRight />
          </button>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => { setIndex(i); setPaused(true); }}
                aria-label={`Go to image ${i + 1}`}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  i === index ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// -------- Main page --------
export default function GalleryPage() {
  const [currentHero, setCurrentHero] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);

  const heroNext = useCallback(() => {
    setCurrentHero((prev) => (prev + 1) % heroSlides.length);
    setHeroPaused(true);
  }, []);

  const heroPrev = useCallback(() => {
    setCurrentHero((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    setHeroPaused(true);
  }, []);

  useEffect(() => {
    if (heroSlides.length <= 1 || heroPaused) return;
    const id = setInterval(
      () => setCurrentHero((prev) => (prev + 1) % heroSlides.length),
      8000
    );
    return () => clearInterval(id);
  }, [heroPaused]);

  useEffect(() => {
    if (!heroPaused) return;
    const id = setTimeout(() => setHeroPaused(false), 12000);
    return () => clearTimeout(id);
  }, [heroPaused]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero with fade */}
      <section className="group relative h-[70vh] md:h-[85vh] overflow-hidden">
        <div className="absolute inset-0">
          {heroSlides.map((slide, i) => (
            <Image
              key={slide.src}
              src={slide.src}
              alt={slide.alt}
              fill
              className={`object-cover absolute inset-0 transition-opacity duration-[2500ms] ${
                i === currentHero ? 'opacity-100' : 'opacity-0'
              }`}
              priority={i === currentHero}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70" />
        </div>

        {heroSlides.length > 1 && (
          <>
            <button
              onClick={heroPrev}
              aria-label="Previous slide"
              className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/25 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/45"
            >
              <ChevronLeft />
            </button>
            <button
              onClick={heroNext}
              aria-label="Next slide"
              className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/25 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/45"
            >
              <ChevronRight />
            </button>
          </>
        )}

        <div className="relative z-10 flex h-full items-end px-5 sm:px-6 md:px-10 pb-10 md:pb-14">
          <div className="max-w-xl text-center text-white">
            <p className="text-[10px] tracking-[0.35em] uppercase mb-3 text-gray-200">
              
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight mb-3">
              Gallery
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-100 leading-relaxed">
              
            </p>
          </div>
        </div>
      </section>

      {/* Categories – mobile-first, stacked tiles */}
      <section className="max-w-6xl mx-auto px-5 sm:px-6 py-10 sm:py-12 md:py-16">
        <div className="max-w-3xl mb-8 sm:mb-10">
          <p className="text-[10px] tracking-[0.32em] uppercase text-gray-500 mb-3">
            The Space
          </p>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-light mb-3">
            Moments from around the cabins.
          </h2>
          <p className="text-sm md:text-base text-gray-600 leading-relaxed">
            Explore the spaces, experiences and details that shape a stay at
            Sojourn. Tap into each section to get a feel for what your time
            here might look like.
          </p>
        </div>

        <div className="space-y-8 sm:space-y-10 md:space-y-12">
          {galleryCategories.map((cat) => (
            <div key={cat.title} className="space-y-3 sm:space-y-4">
              {/* Text */}
              <div>
                <p className="text-xs sm:text-sm md:text-base font-semibold tracking-[0.25em] uppercase text-gray-700 mb-1">
                  {cat.title}
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  {cat.description}
                </p>
              </div>

              {/* Tile slideshow – single full-width tile for all breakpoints */}
              <div className="relative w-full h-56 sm:h-64 md:h-auto md:aspect-[16/9] rounded-2xl overflow-hidden bg-gray-100">
                <MiniSlideshow images={cat.images} />
              </div>

            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 md:mt-14 border-t border-gray-200 pt-8 md:pt-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-[10px] tracking-[0.32em] uppercase text-gray-500 mb-2">
                Ready When You Are
              </p>
              <h3 className="text-base md:text-xl font-light text-gray-900">
                Book your cabin and start planning your own gallery of moments.
              </h3>
            </div>
            <a
              href="/book-escape"
              className="inline-flex items-center justify-center px-7 py-3 rounded-full border border-black text-[10px] md:text-xs tracking-[0.25em] uppercase font-medium hover:bg-black hover:text-white transition-colors"
            >
              Book Your Escape
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
