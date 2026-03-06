// Reusable layout component for authentication pages

import { ReactNode } from 'react';
import { AuthLogo } from '@/components/auth/AuthLogo';

const highlightItems = [
  {
    title: 'One-click Twitch connect',
    description: 'Link your stream once—highlights flow in automatically.',
  },
  {
    title: 'Auto highlights to Shorts/Reels',
    description: 'AI finds the hype moments and frames them for vertical.',
  },
  {
    title: 'Brand-safe templates',
    description: 'Captions, overlays, and colors stay on-brand every time.',
  },
  {
    title: 'Ready to post',
    description: 'Schedule or push directly to Instagram and more in seconds.',
  },
];

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="grid min-h-screen grid-cols-1 md:grid-cols-[1.1fr_0.9fr] lg:grid-cols-2">
        <aside className="relative hidden md:flex overflow-hidden bg-gradient-to-br from-primary via-primary to-accent text-primary-foreground">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10" />
          <div className="absolute -left-10 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          <div className="relative z-10 flex flex-col justify-between px-10 py-12 lg:px-14 lg:py-14 gap-8">
            <AuthLogo type="white" />

            <div className="space-y-6">
              <h1 className="text-3xl font-bold leading-tight lg:text-4xl">
                Turn live streams into Shorts & Reels automatically.
              </h1>
              <p className="max-w-xl text-base text-primary-foreground/85 lg:text-lg">
                Connect Twitch, let AI pull the best moments, customize with your brand kit, and publish to Instagram in minutes.
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 max-w-2xl">
                {highlightItems.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-md"
                  >
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="mt-1 text-sm text-white/80">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-primary-foreground/80">
              <span className="rounded-full bg-white/15 px-3 py-1 font-medium backdrop-blur-sm">Twitch</span>
              <span className="rounded-full bg-white/15 px-3 py-1 font-medium backdrop-blur-sm">Instagram</span>
              <span className="rounded-full bg-white/15 px-3 py-1 font-medium backdrop-blur-sm">YouTube Shorts</span>
            </div>
          </div>
        </aside>

        <main className="flex items-center justify-center px-4 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-md">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

