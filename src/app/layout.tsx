import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ErrorBoundary from "@/components/ErrorBoundary";
import "./globals.css";

const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-bricolage-grotesque",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TrackTheirProfile — Reddit Profile Tracker",
  description:
    "Track any public Reddit profile in seconds. Explore posts, comments, and profile activity in one place.",
  metadataBase: new URL(process.env.APP_URL || "https://tracktheirprofile.com"),
  icons: {
    icon: [{ url: "/avatar-removebg.png", type: "image/png" }],
    shortcut: ["/avatar-removebg.png"],
    apple: ["/avatar-removebg.png"],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "TrackTheirProfile",
    title: "TrackTheirProfile — Reddit Profile Tracker",
    description:
      "Track public Reddit profiles, posts, and comments in one place.",
  },
  twitter: {
    card: "summary_large_image",
    title: "TrackTheirProfile — Reddit Profile Tracker",
    description:
      "Stalk any reddit profile in seconds.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bricolageGrotesque.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <Header />
        <ErrorBoundary>
          <main className="flex flex-1 flex-col">{children}</main>
        </ErrorBoundary>
        <Footer />
      </body>
    </html>
  );
}
