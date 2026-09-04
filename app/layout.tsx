import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Secure DMS",
  description: "Secure Legal & Investigation Document Management System"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}