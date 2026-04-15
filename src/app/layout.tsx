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
  title: "TrackTheirProfile — Reddit Profile Intelligence",
  description:
    "Search any Reddit username and instantly see all their posts, comments, and activity. The most powerful Reddit profile tracker.",
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
    title: "TrackTheirProfile — Reddit Profile Intelligence",
    description:
      "Search any Reddit username and instantly see all their posts, comments, and activity. The most powerful Reddit profile tracker.",
  },
  twitter: {
    card: "summary_large_image",
    title: "TrackTheirProfile — Reddit Profile Intelligence",
    description:
      "Search any Reddit username and instantly see all their posts, comments, and activity.",
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
