import type { Metadata } from 'next';
import Script from 'next/script';
import { Cormorant_Garamond, DM_Sans, Noto_Sans_Arabic } from 'next/font/google';
import './globals.css';
import { ThemeInit } from '@/components/ThemeInit';
import { LocaleInit } from '@/components/LocaleInit';
import { HydrationVisibility } from '@/components/HydrationVisibility';

const cormorant = Cormorant_Garamond({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const dmSans = DM_Sans({
  variable: '--font-body',
  subsets: ['latin'],
});

const notoSansArabic = Noto_Sans_Arabic({
  variable: '--font-arabic',
  subsets: ['arabic'],
  weight: ['400', '600', '700'],
});

export const metadata: Metadata = {
  title: 'SCENTARA — Parfumerie d\'exception',
  description: 'Parfums sur-mesure, coffrets Duo & Trio. Sculpté dans l\'or de vos souvenirs.',
};

const themeScript = `
(function(){
  try {
    var raw = localStorage.getItem('scentara_theme');
    var theme = 'light';
    if (raw) {
      var p = JSON.parse(raw);
      if (p && p.state && (p.state.theme === 'light' || p.state.theme === 'dark')) theme = p.state.theme;
    }
    document.documentElement.classList.remove('theme-light','theme-dark');
    document.documentElement.classList.add('theme-' + theme);
  } catch(e){}
})();
`;

const localeScript = `
(function(){
  try {
    var raw = localStorage.getItem('scentara_locale');
    var locale = 'fr';
    if (raw) {
      var p = JSON.parse(raw);
      if (p && p.state && (p.state.locale === 'fr' || p.state.locale === 'ar')) locale = p.state.locale;
    }
    document.documentElement.setAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', locale === 'ar' ? 'ar' : 'fr');
  } catch(e){}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" dir="ltr" className={`${cormorant.variable} ${dmSans.variable} ${notoSansArabic.variable} theme-light`} suppressHydrationWarning style={{ visibility: 'hidden' }}>
      <body className="antialiased" style={{ fontFamily: 'var(--font-body), sans-serif' }}>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeScript}
        </Script>
        <Script id="locale-init" strategy="beforeInteractive">
          {localeScript}
        </Script>
        <ThemeInit />
        <LocaleInit />
        <HydrationVisibility />
        {children}
      </body>
    </html>
  );
}
