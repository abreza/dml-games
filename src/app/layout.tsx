import Script from "next/script";
import { Metadata } from "next";
import "../assets/globals.css";

export const metadata: Metadata = {
  title: "حدس آهنگ | بازی تلگرام",
  description: "بازی حدس نام آهنگ و خواننده",
  keywords: "بازی, تلگرام, آهنگ, حدس, موسیقی",
  authors: [{ name: "DML Games" }],
  creator: "DML Games",
  publisher: "DML Games",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.WEBHOOK_URL || "https://localhost:3000"),
  openGraph: {
    title: "بازی حدس آهنگ",
    description: "بازی حدس نام آهنگ و خواننده",
    type: "website",
    locale: "fa_IR",
    siteName: "DML Games",
  },
  twitter: {
    card: "summary_large_image",
    title: "بازی حدس آهنگ",
    description: "بازی حدس نام آهنگ و خواننده",
  },
  robots: {
    index: false,
    follow: false,
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <Script src="/telegram-web-app.js" strategy="beforeInteractive" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@100;200;300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />

        <meta name="telegram:card" content="app" />
        <meta name="telegram:site" content="@dml_games_bot" />
        <meta name="telegram:title" content="بازی حدس آهنگ" />
        <meta
          name="telegram:description"
          content="بازی حدس نام آهنگ و خواننده"
        />

        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="بازی حدس آهنگ" />

        <meta name="theme-color" content="#3b82f6" />
        <meta name="msapplication-navbutton-color" content="#3b82f6" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />

        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-tap-highlight" content="no" />

        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
      </head>

      <body className="font-vazir antialiased bg-telegram-bg text-telegram-text overflow-x-hidden">
        <Script
          id="telegram-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('load', function() {
                console.log('🚀 Initializing Telegram WebApp for Song Guessing Game...');
                
                let attempts = 0;
                const maxAttempts = 10;
                
                function initTelegram() {
                  attempts++;
                  
                  if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
                    const tg = window.Telegram.WebApp;
                    
                    console.log('📱 Telegram WebApp found, initializing...', {
                      version: tg.version,
                      platform: tg.platform,
                      initData: tg.initData,
                      initDataUnsafe: tg.initDataUnsafe
                    });
                    
                    tg.expand();
                    tg.enableClosingConfirmation();
                    tg.setHeaderColor('#3b82f6');
                    tg.setBackgroundColor('#ffffff');
                    tg.ready();
                    
                    console.log('✅ Song Guessing Game initialized:', {
                      platform: tg.platform,
                      version: tg.version,
                      colorScheme: tg.colorScheme,
                      isExpanded: tg.isExpanded,
                      viewportHeight: tg.viewportHeight,
                      viewportStableHeight: tg.viewportStableHeight,
                      user: tg.initDataUnsafe?.user,
                      chat: tg.initDataUnsafe?.chat,
                      initData: tg.initData ? 'Present' : 'Missing',
                      initDataLength: tg.initData ? tg.initData.length : 0
                    });

                    if (tg.colorScheme === 'dark') {
                      document.documentElement.classList.add('dark');
                      tg.setHeaderColor('#1f2937');
                      tg.setBackgroundColor('#111827');
                    }

                    tg.onEvent('themeChanged', function() {
                      console.log('🎨 Theme changed to:', tg.colorScheme);
                      if (tg.colorScheme === 'dark') {
                        document.documentElement.classList.add('dark');
                        tg.setHeaderColor('#1f2937');
                        tg.setBackgroundColor('#111827');
                      } else {
                        document.documentElement.classList.remove('dark');
                        tg.setHeaderColor('#3b82f6');
                        tg.setBackgroundColor('#ffffff');
                      }
                    });

                    tg.onEvent('viewportChanged', function() {
                      console.log('📱 Viewport changed:', {
                        height: tg.viewportHeight,
                        stableHeight: tg.viewportStableHeight,
                        isExpanded: tg.isExpanded
                      });
                    });

                    if (!tg.initData) {
                      console.warn('⚠️ initData is empty. Possible issues:');
                      console.warn('1. Bot not configured properly');
                      console.warn('2. Web App URL not set correctly');
                      console.warn('3. Domain not whitelisted');
                      console.warn('4. HTTPS issues');
                      console.warn('5. Opening outside of Telegram');
                    }

                  } else if (attempts < maxAttempts) {
                    console.log(\`🔄 Telegram WebApp not ready, retrying... (\${attempts}/\${maxAttempts})\`);
                    setTimeout(initTelegram, 100);
                  } else {
                    console.error('❌ Telegram WebApp not available after', maxAttempts, 'attempts');
                    console.log('⚠️ Running in fallback mode - using URL parameters');
                  }
                }
                
                initTelegram();
              });
            `,
          }}
        />

        <main className="min-h-screen min-h-screen-safe relative">
          {children}
        </main>

        <Script
          id="performance-monitor"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                window.addEventListener('load', function() {
                  setTimeout(function() {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    if (perfData) {
                      console.log('📊 Song Game load time:', Math.round(perfData.loadEventEnd - perfData.fetchStart) + 'ms');
                    }
                  }, 0);
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
