import type { Metadata } from "next";
import { Space_Grotesk, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ixigo - Smart PNR Status Tracker & Railway Portal",
  description: "Real-time IRCTC PNR tracking, booking history, and train status portal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme') || 'light';
                  var root = document.documentElement;
                  root.classList.remove('dark', 'theme-sahara', 'theme-system');
                  if (saved === 'dark') {
                    root.classList.add('dark');
                  } else {
                    root.classList.add('theme-sahara');
                  }

                  var savedScale = localStorage.getItem('textScale') || 'medium';
                  root.classList.remove('text-scale-small', 'text-scale-medium', 'text-scale-large');
                  if (savedScale === 'small') {
                    root.classList.add('text-scale-small');
                    root.style.fontSize = '14px';
                  } else if (savedScale === 'large') {
                    root.classList.add('text-scale-large');
                    root.style.fontSize = '18px';
                  } else {
                    root.classList.add('text-scale-medium');
                    root.style.fontSize = '16px';
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        {children}
      </body>
    </html>
  );
}
