'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'sonner';

export const Providers = ({ children }: { children: React.ReactNode }) => {
    return (
      <SessionProvider>
        <Toaster 
            position="bottom-left"
            duration={5000}
        />
        {children}
      </SessionProvider>
    );
  };