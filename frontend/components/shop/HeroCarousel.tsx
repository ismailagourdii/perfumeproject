'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { fetchSlides, trackSlideView, trackSlideClick } from '@/lib/api';
import type { HeroSlide } from '@/lib/api';
import { useLanguageStore } from '@/store/languageStore';
import { useTranslation } from '@/lib/i18n';
import { resolveMediaSrc } from '@/lib/media-url';

const HERO_IMAGE_URL = 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=400&auto=format&fit=crop&q=80';

const primaryBtnBase = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '14px 32px',
  border: 'none',
  borderRadius: 4,
  fontFamily: 'var(--font-body), DM Sans, sans-serif',
  fontSize: 14,
  fontWeight: 600,
  letterSpacing: '0.08em',
  textDecoration: 'none',
  transition: 'background-color 0.2s ease, transform 0.2s ease',
} as const;

const secondaryBtnBase = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '14px 32px',
  borderRadius: 4,
  fontFamily: 'var(--font-body), DM Sans, sans-serif',
  fontSize: 14,
  fontWeight: 600,
  letterSpacing: '0.08em',
  textDecoration: 'none',
  border: '1.5px solid rgba(255,255,255,0.95)',
  transition: 'background-color 0.2s ease',
} as const;

export function HeroCarousel() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [btn1Hover, setBtn1Hover] = useState(false);
  const [btn2Hover, setBtn2Hover] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevIndexRef = useRef(0);
  const locale = useLanguageStore((s) => s.locale);

  useEffect(() => {
    const check = () => setIsMobile(typeof window !== 'undefined' && window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    fetchSlides()
      .then((list) => setSlides(Array.isArray(list) ? list : []))
      .catch(() => setSlides([]))
      .finally(() => setLoading(false));
  }, []);

  const goNext = useCallback(() => {
    setIndex((i) => (i + 1) % Math.max(1, slides.length));
  }, [slides.length]);

  const goPrev = useCallback(() => {
    setIndex((i) => (i - 1 + slides.length) % Math.max(1, slides.length));
  }, [slides.length]);

  // Per-slide duration for auto-advance
  useEffect(() => {
    if (slides.length <= 1) return;
    const slide = slides[index];
    const durationMs = slide?.duration_ms ?? 5000;
    intervalRef.current = setInterval(goNext, durationMs);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [index, slides, goNext]);

  // Track view when slide becomes visible
  useEffect(() => {
    if (slides.length === 0) return;
    const slide = slides[index];
    if (slide?.id && index !== prevIndexRef.current) {
      trackSlideView(slide.id);
      prevIndexRef.current = index;
    }
  }, [index, slides]);

  if (loading || slides.length === 0) {
    return <DefaultHero />;
  }

  const slide = slides[index];
  const isAr = locale === 'ar';
  const badge = isAr ? (slide.badge_ar || slide.badge_text) : (slide.badge_text || slide.badge_ar);
  const title = isAr ? (slide.title_ar || slide.title) : (slide.title || slide.title_ar);
  const subtitle = isAr ? (slide.subtitle_ar || slide.subtitle) : (slide.subtitle || slide.subtitle_ar);
  const button1Text = isAr ? (slide.button1_text_ar || slide.button1_text) : (slide.button1_text || slide.button1_text_ar);
  const button2Text = isAr ? (slide.button2_text_ar || slide.button2_text) : (slide.button2_text || slide.button2_text_ar);
  const isPlaceholder = (text?: string | null) => {
    const value = (text || '').trim();
    if (!value) return true;
    const lower = value.toLowerCase();
    if (lower.includes('bouton')) return true;
    if (lower === 'test' || lower === 'testtesttesttesttesttest') return true;
    if (value.length > 50 && value === value.charAt(0).repeat(value.length)) return true;
    return false;
  };
  const showButton1 = !isPlaceholder(button1Text);
  const showButton2 = !isPlaceholder(button2Text);
  const resolvedMain = slide.image_url ? resolveMediaSrc(slide.image_url) : '';
  const mobileRaw = slide.mobile_image_url || slide.image_url;
  const resolvedMobile = mobileRaw ? resolveMediaSrc(mobileRaw) : '';
  const imageUrl = resolvedMain || HERO_IMAGE_URL;
  const mobileImageUrl = resolvedMobile || imageUrl;
  const displayImageUrl = isMobile ? mobileImageUrl : imageUrl;
  const textColor = slide.text_color || '#ffffff';
  const overlayOpacity = (slide.overlay_opacity ?? 40) / 100;

  return (
    <section
      className="hero-carousel-fullwidth"
      style={{
        position: 'relative',
        width: '100vw',
        marginLeft: 'calc(-50vw + 50%)',
        minHeight: '100vh',
        borderRadius: 0,
        overflow: 'hidden',
        paddingTop: 40,
      }}
      onTouchStart={(e) => slides.length > 1 && setTouchStartX(e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (slides.length <= 1) return;
        const endX = e.changedTouches[0].clientX;
        const start = touchStartX;
        setTouchStartX(null);
        if (start == null) return;
        const diff = start - endX;
        if (Math.abs(diff) > 50) {
          if (diff > 0) goNext();
          else goPrev();
        }
      }}
    >
      {/* Background image: desktop vs mobile */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${displayImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 0,
        }}
      />
      {/* Overlay with slide-specific opacity */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: `rgba(0,0,0,${overlayOpacity})`,
          zIndex: 1,
        }}
      />

      {/* Text block: positioned via .hero-text-block (RTL/LTR in CSS) */}
      <div className="hero-text-block" style={{ position: 'absolute', bottom: '15%', zIndex: 2, maxWidth: 600, width: '100%' }}>
        {badge && (
          <p
            className="hero-badge"
            style={{
              margin: '0 0 16px',
              textTransform: isAr ? 'none' : 'uppercase',
              letterSpacing: isAr ? '0' : '0.2em',
              fontSize: 11,
              border: '1px solid rgba(255,255,255,0.5)',
              padding: '4px 12px',
              borderRadius: 2,
              color: '#ffffff',
              display: 'inline-block',
              fontFamily: 'var(--font-body), DM Sans, sans-serif',
              fontWeight: 600,
              direction: isAr ? 'rtl' : 'ltr',
            }}
          >
            {badge}
          </p>
        )}
        <h1
          className="hero-title"
          style={{
            margin: 0,
            marginBottom: 16,
            fontFamily: 'var(--font-display), Cormorant Garamond, serif',
            fontSize: 'clamp(32px, 8vw, 72px)',
            fontWeight: 600,
            lineHeight: 1.1,
            color: textColor,
            wordBreak: 'break-word',
            overflow: 'visible',
            width: '100%',
            maxWidth: '90vw',
            direction: isAr ? 'rtl' : 'ltr',
          }}
        >
          {title || (isAr ? 'فن العطر المغربي' : "L'art du parfum marocain")}
        </h1>
        <p
          className="hero-subtitle"
          style={{
            margin: 0,
            marginBottom: 40,
            fontFamily: 'var(--font-body), DM Sans, sans-serif',
            fontSize: 16,
            lineHeight: 1.6,
            color: textColor,
            opacity: 0.85,
            maxWidth: 480,
            direction: isAr ? 'rtl' : 'ltr',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {(() => {
            const raw = subtitle || (isAr ? 'اكتشف مجموعة من العطور الاستثنائية.' : "Découvrez une collection de parfums d'exception.");
            if (raw.length <= 200) return raw;
            return raw.slice(0, 197).trim() + '…';
          })()}
        </p>
        <div className="hero-buttons" style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          {showButton1 && (
            <Link
              className="hero-btn"
              href={slide.button1_link || '/catalogue'}
              onClick={() => trackSlideClick(slide.id, 1)}
              onMouseEnter={() => setBtn1Hover(true)}
              onMouseLeave={() => setBtn1Hover(false)}
              style={{
                ...primaryBtnBase,
                backgroundColor: btn1Hover ? '#f0e8d8' : '#ffffff',
                color: '#1a1208',
                transform: btn1Hover ? 'scale(1.02)' : 'scale(1)',
                direction: isAr ? 'rtl' : 'ltr',
              }}
            >
              {button1Text}
            </Link>
          )}
          {showButton2 && (
            <Link
              className="hero-btn"
              href={slide.button2_link || '/pack-builder'}
              onClick={() => trackSlideClick(slide.id, 2)}
              onMouseEnter={() => setBtn2Hover(true)}
              onMouseLeave={() => setBtn2Hover(false)}
              style={{
                ...secondaryBtnBase,
                border: `1.5px solid ${textColor}`,
                backgroundColor: btn2Hover ? 'rgba(255,255,255,0.15)' : 'transparent',
                color: textColor,
                direction: isAr ? 'rtl' : 'ltr',
              }}
            >
              {button2Text}
            </Link>
          )}
        </div>
      </div>

      {/* Arrow navigation (hidden on mobile via .hero-arrows) */}
      {slides.length > 1 && (
        <div className="hero-arrows" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3 }}>
          <button
            type="button"
            aria-label="Précédent"
            onClick={goPrev}
            style={{
              position: 'absolute',
              left: 32,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 48,
              height: 48,
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.3)',
              backgroundColor: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(8px)',
              color: '#fff',
              cursor: 'pointer',
              fontSize: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s ease',
              pointerEvents: 'auto',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)';
            }}
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Suivant"
            onClick={goNext}
            style={{
              position: 'absolute',
              right: 32,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 48,
              height: 48,
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.3)',
              backgroundColor: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(8px)',
              color: '#fff',
              cursor: 'pointer',
              fontSize: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s ease',
              pointerEvents: 'auto',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)';
            }}
          >
            →
          </button>
        </div>
      )}

      {/* Dot indicators */}
      {slides.length > 1 && (
        <div className="hero-dots" style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', zIndex: 3, display: 'flex', gap: 8, alignItems: 'center' }}>
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={i === index ? 'hero-dot-active' : ''}
              style={{
                height: 8,
                width: i === index ? 24 : 8,
                borderRadius: i === index ? 4 : 8,
                border: 'none',
                backgroundColor: i === index ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.4)',
                cursor: 'pointer',
                padding: 0,
                transition: 'width 0.25s ease, background-color 0.2s ease',
              }}
            />
          ))}
        </div>
      )}

    </section>
  );
}

function DefaultHero() {
  const { t } = useTranslation();
  return (
    <section
      className="hero-carousel-fullwidth"
      style={{
        position: 'relative',
        width: '100vw',
        marginLeft: 'calc(-50vw + 50%)',
        minHeight: '100vh',
        borderRadius: 0,
        overflow: 'hidden',
        paddingTop: 40,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${HERO_IMAGE_URL})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 1,
        }}
      />
      <div className="hero-text-block" style={{ position: 'absolute', bottom: '15%', zIndex: 2, maxWidth: 600, width: '100%' }}>
        <h1
          className="hero-title"
          style={{
            margin: 0,
            marginBottom: 16,
            fontFamily: 'var(--font-display), Cormorant Garamond, serif',
            fontSize: 'clamp(32px, 8vw, 72px)',
            fontWeight: 600,
            lineHeight: 1.1,
            color: '#fff',
            wordBreak: 'break-word',
            overflow: 'visible',
            width: '100%',
            maxWidth: '90vw',
          }}
        >
          {t('hero.title')}
        </h1>
        <p
          className="hero-subtitle"
          style={{
            margin: 0,
            marginBottom: 40,
            fontFamily: 'var(--font-body), DM Sans, sans-serif',
            fontSize: 16,
            lineHeight: 1.6,
            color: '#fff',
            opacity: 0.85,
            maxWidth: 480,
          }}
        >
          {t('hero.subtitle')}
        </p>
        <div className="hero-buttons" style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <Link
            className="hero-btn"
            href="/catalogue"
            style={{
              ...primaryBtnBase,
              backgroundColor: '#ffffff',
              color: '#1a1208',
            }}
          >
            {t('hero.cta1')}
          </Link>
          <Link
            className="hero-btn"
            href="/pack-builder"
            style={{
              ...secondaryBtnBase,
              border: '1.5px solid #ffffff',
              backgroundColor: 'transparent',
              color: '#ffffff',
            }}
          >
            {t('hero.cta2')}
          </Link>
        </div>
      </div>
    </section>
  );
}
