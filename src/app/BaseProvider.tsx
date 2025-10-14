"use client";
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { baseSepolia } from 'wagmi/chains';
import { SafeArea } from '@coinbase/onchainkit/minikit';

export default function BaseProvider({children}:{children: React.ReactNode}){
  return(
    <OnchainKitProvider
    apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
    chain={baseSepolia}
    config={{
      appearance:{
        mode: 'dark',
      },
      wallet: {
        display: 'modal',
        preference: 'all'
      }
    }}
    miniKit={{
      enabled: true,
    }}
    >
      <SafeArea>
        {children}
      </SafeArea>
    </OnchainKitProvider>
  );
}
