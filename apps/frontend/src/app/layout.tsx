import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Plus_Jakarta_Sans, Lora, Roboto_Mono } from 'next/font/google';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const lora = Lora({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-serif',
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${plusJakartaSans.variable} ${lora.variable} ${robotoMono.variable}`}>
      <head />
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
