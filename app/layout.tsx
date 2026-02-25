import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

const enableAds = process.env.NEXT_PUBLIC_ENABLE_ADS === 'true';
const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

export const metadata: Metadata = {
  title: '냥세(猫世) - MBTI × 사주 고양이 운세',
  description:
    'MBTI와 사주팔자로 알아보는 나의 운명 고양이. 20종 고양이 캐릭터 중 나는 누구?',
  openGraph: {
    title: '냥세(猫世) - 나의 운명 고양이는?',
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
    <html lang="ko">
      <body className="bg-white text-gray-900 antialiased">
        {enableAds && adClient && (
          <Script
            id="adsense-script"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`}
            strategy="lazyOnload"
            crossOrigin="anonymous"
          />
        )}
        {children}
      </body>
    </html>
  );
}
