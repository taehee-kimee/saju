'use client';

import { CSSProperties, useEffect, useRef, useState } from 'react';

const enableAds = process.env.NEXT_PUBLIC_ENABLE_ADS === 'true';
const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
const defaultSlotId = process.env.NEXT_PUBLIC_ADSENSE_SLOT;

interface AdSlotProps {
  slotId?: string;
  format?: string;
  className?: string;
  style?: CSSProperties;
  placeholderHeight?: number;
}

export default function AdSlot({
  slotId,
  format = 'auto',
  className,
  style,
  placeholderHeight = 120,
}: AdSlotProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const [isPushed, setIsPushed] = useState(false);

  useEffect(() => {
    if (!enableAds || !clientId || !(slotId || defaultSlotId)) return;
    if (!adRef.current || isPushed) return;

    const target = adRef.current;
    let observer: IntersectionObserver | null = null;

    const pushAd = () => {
      if (isPushed) return;
      try {
        // @ts-expect-error adsbygoogle global
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        setIsPushed(true);
      } catch (e) {
        console.error('adsbygoogle push error', e);
      }
    };

    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            pushAd();
            observer?.disconnect();
          }
        });
      }, {
        rootMargin: '0px 0px 200px 0px',
        threshold: 0.1,
      });
      observer.observe(target);
    } else {
      // fallback
      pushAd();
    }

    return () => {
      observer?.disconnect();
    };
  }, [isPushed, slotId]);

  if (!enableAds || !clientId || !(slotId || defaultSlotId)) {
    return null;
  }

  return (
    <div
      className={className}
      style={{ display: 'block', width: '100%', ...style }}
    >
      <div
        ref={adRef}
        className="relative overflow-hidden rounded-xl bg-gray-100"
        style={{ minHeight: placeholderHeight, display: 'block' }}
      >
        {/* Placeholder */}
        {!isPushed && (
          <div className="animate-pulse absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100" />
        )}
        <ins
          className="adsbygoogle block"
          style={{ display: 'block', height: '100%' }}
          data-ad-client={clientId}
          data-ad-slot={slotId || defaultSlotId}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}
