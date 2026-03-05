import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import DevTools from '@/components/DevTools';

const enableAds = process.env.NEXT_PUBLIC_ENABLE_ADS === 'true';
const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? 'ca-pub-7453204635551596';

export const metadata: Metadata = {
  title: '냥세(猫世) - MBTI × 사주 고양이 운세',
  description:
    'MBTI와 사주팔자로 알아보는 나의 운세 고양이. 20종 고양이 캐릭터 중 나는 누구?',
  other: {
    'google-adsense-account': 'ca-pub-7453204635551596',
  },
  openGraph: {
    title: '냥세(猫世) - 나의 운세 고양이는?',
    description: 'MBTI × 사주 기반 고양이 캐릭터 운세 서비스',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="font-sans">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="text-gray-900 antialiased font-sans">
        {enableAds && (
          <Script
            id="adsense-script"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`}
            strategy="lazyOnload"
            crossOrigin="anonymous"
          />
        )}
        <div className="min-h-screen flex flex-col">
          <div className="flex-1">{children}</div>
          {process.env.NODE_ENV === 'development' && <DevTools />}
          {/* SHOW_FOOTER: false → true 로 바꾸면 활성화 */}
          {false && (
          <footer className="border-t border-gray-100 bg-white/80 backdrop-blur px-4 py-6 text-xs text-gray-500 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-center">
            <span className="text-gray-400">© 2026 냥세</span>
            <span className="hidden sm:inline">·</span>
            <a href="/legal/privacy" className="hover:text-gray-700">개인정보처리방침</a>
            <span className="hidden sm:inline">·</span>
            <a href="/legal/terms" className="hover:text-gray-700">이용약관</a>
            <span className="hidden sm:inline">·</span>
            <span className="text-gray-400">문의: hello@nyangsae.app</span>
          </footer>
          )}
        </div>
      </body>
    </html>
  );
}
