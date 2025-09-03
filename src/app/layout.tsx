import Script from "next/script";
import { Metadata } from "next";
import "../assets/globals.css";

export const metadata: Metadata = {
  title: "چالش کلیک سریع | بازی گروهی تلگرام",
  description: "30 ثانیه فرصت، 100 کلیک هدف! با دوستات رقابت کن",
  keywords: "بازی, تلگرام, رقابت, کلیک, گروهی",
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
    title: "چالش کلیک سریع",
    description: "30 ثانیه فرصت، 100 کلیک هدف! با دوستات رقابت کن",
    type: "website",
    locale: "fa_IR",
    siteName: "DML Games",
  },
  twitter: {
    card: "summary_large_image",
    title: "چالش کلیک سریع",
    description: "30 ثانیه فرصت، 100 کلیک هدف! با دوستات رقابت کن",
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
        <meta name="telegram:title" content="چالش کلیک سریع" />
        <meta
          name="telegram:description"
          content="30 ثانیه فرصت، 100 کلیک هدف! با دوستات رقابت کن"
        />

        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="چالش کلیک سریع" />

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
                console.log('🚀 Initializing Telegram WebApp...');
                
                // Wait for Telegram object to be available
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
                    
                    // Expand to full screen
                    tg.expand();
                    
                    // Enable closing confirmation
                    tg.enableClosingConfirmation();
                    
                    // Set header color to match theme
                    tg.setHeaderColor('#3b82f6');
                    tg.setBackgroundColor('#ffffff');
                    
                    // Ready signal
                    tg.ready();
                    
                    console.log('✅ Telegram WebApp initialized:', {
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

                    // Apply dark theme if needed
                    if (tg.colorScheme === 'dark') {
                      document.documentElement.classList.add('dark');
                      tg.setHeaderColor('#1f2937');
                      tg.setBackgroundColor('#111827');
                    }

                    // Handle theme changes
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

                    // Handle viewport changes
                    tg.onEvent('viewportChanged', function() {
                      console.log('📱 Viewport changed:', {
                        height: tg.viewportHeight,
                        stableHeight: tg.viewportStableHeight,
                        isExpanded: tg.isExpanded
                      });
                    });

                    // If initData is still empty, log warning
                    if (!tg.initData) {
                      console.warn('⚠️ initData is empty. This might be due to:');
                      console.warn('1. Bot not configured properly in BotFather');
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
                
                // Start initialization
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
                      console.log('📊 Page load time:', Math.round(perfData.loadEventEnd - perfData.fetchStart) + 'ms');
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
