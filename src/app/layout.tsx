import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ThemeProvider from './theme';
import './globals.css';

import SdkInit from './SdkInit';
import '@coinbase/onchainkit/styles.css';
import BaseProvider from './BaseProvider';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: "GachaCare",
        description: "Pull NFTs, Raise, Battle, Earn",
        other: {
        'fc:miniapp': JSON.stringify({
            version: 'next',
            imageUrl: 'https://raite25-gacha.vercel.app/globe.svg',
            button: {
                title: `Launch GachaCare`,
                action: {
                    type: 'launch_miniapp',
                    name: 'GachaCare',
                    url: 'https://raite25-gacha.vercel.app/',
                    splashImageUrl: 'https://raite25-gacha.vercel.app/globe.svg',
                    splashBackgroundColor: '#000000',
                },
            },
        }),
        },
    };
    }
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <BaseProvider>
      <html lang="en" className={inter.className}>
        <body className='antialiased'>
          <ThemeProvider>
              <SdkInit />
              {children}
          </ThemeProvider>
        </body>
      </html>
    </BaseProvider>
  );
}

