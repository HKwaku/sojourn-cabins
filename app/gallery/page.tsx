'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

// -------- HERO IMAGES (edit paths if needed) --------
const heroSlides = [
  { src: '/cabins/ext000.jpg', alt: '' },
  { src: '/cabins/ext0.jpg', alt: '' },
  { src: '/cabins/sea.jpg', alt: '' },
  { src: '/cabins/sun.jpg', alt: '' },
  { src: '/cabins/sand.jpg', alt: '' },
  { src: '/cabins/ext1.jpg', alt: '' },
  { src: '/cabins/ext2.jpg', alt: '' },
  { src: '/cabins/coc.jpg', alt: '' },
  { src: '/cabins/exper1.jpg', alt: '' },
];

// -------- CATEGORY SLIDESHOWS (you will update images) --------
const galleryCategories = [
  {
    title: 'Exterior',
    description: 'Cabin exteriors and the surrounding landscape.',
    images: ['/cabins/ext00.jpg', '/cabins/ext1.jpg', '/cabins/ext2.jpg', '/cabins/ext3.jpg', '/cabins/ext4.jpg', '/cabins/ext5.jpg', '/cabins/ext8.jpg', '/cabins/ext9.jpg' ],
  },
  {
    title: 'Interior',
    description: 'Calm, minimal interiors designed for slow stays.',
    images: ['/cabins/int1.jpg', '/cabins/int2.jpg'],
  },
  {
    title: 'Chef Experience',
    description: 'Private dining and chef-led experiences.',
    images: ['/cabins/chef1.jpg', '/cabins/chef2.jpg', '/cabins/chef3.jpg', '/cabins/chef4.jpg', '/cabins/chef5.jpg'],
  },
  {
    title: 'Wellness',
    description: 'Guided wellness, massages and facials.',
    images: ['/cabins/well1.jpg', '/cabins/well2.jpg', '/cabins/well3.jpg'],
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

  useEffect(() => {
    if (!images || images.length <= 1) return;

    const id = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, 6000); // 6s per slide

    return () => clearInterval(id);
  }, [images]);

  if (!images || images.length === 0) return null;

  return (
    <div className="relative w-full h-full">
      {images.map((img, i) => (
        <Image
          key={img}
          src={img}
          alt=""
          fill
          className={`object-cover absolute inset-0 transition-opacity duration-[2000ms] ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
    </div>
  );
}

// -------- Main page --------
export default function GalleryPage() {
  const [currentHero, setCurrentHero] = useState(0);

  // Auto-advance hero
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const id = setInterval(
      () => setCurrentHero((prev) => (prev + 1) % heroSlides.length),
      8000
    );
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero with fade */}
      <section className="relative h-[55vh] md:h-[70vh] overflow-hidden">
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

        <div className="relative z-10 flex h-full items-end px-5 sm:px-6 md:px-10 pb-10 md:pb-14">
          <div className="max-w-xl text-white">
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
