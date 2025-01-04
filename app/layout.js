import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/theme";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Metrics Server",
  description:
    "A frontend built in NextJS to get Kubernetes nodes and pods metrics.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`{geistSans.variable} ${geistMono.variable} antialiased bg-slate-950 max-w-screen-sm md:max-w-[100vw] overflow-x-hidden `}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
