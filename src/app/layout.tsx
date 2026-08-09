import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "CourseMap — Make your classes actually make sense",
  description:
    "Turn your class notes into a digital notebook you can navigate like a map — and chat with to find, rewrite, or elaborate.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className={`${nunito.variable} ${nunito.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
