import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "GapFinder AI", description: "Find your knowledge gaps. Study smarter." };
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body>{children}</body></html>;
}