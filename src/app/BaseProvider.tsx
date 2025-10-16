"use client";

import { OnchainKitProvider } from '@coinbase/onchainkit';
import { baseSepolia } from 'wagmi/chains';
import { SafeArea } from '@coinbase/onchainkit/minikit';

export default function BaseProvider({children, apiKey}:{children: React.ReactNode, apiKey?: string}){
  return(
    <OnchainKitProvider
    apiKey={apiKey ?? ''}
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
