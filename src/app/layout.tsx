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
  title: "Leadverse — Reddit Public Activity Search Tool",
  description:
    "Search any Reddit username and browse their public posts, comments, and activity in one organized dashboard. A research tool for journalists, moderators, and analysts.",
  metadataBase: new URL(process.env.APP_URL || "https://leadverse.ai"),
  icons: {
    icon: [{ url: "/avatar-removebg.png", type: "image/png" }],
    shortcut: ["/avatar-removebg.png"],
    apple: ["/avatar-removebg.png"],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Leadverse",
    title: "Leadverse — Reddit Public Activity Search Tool",
    description:
      "Search any Reddit username and browse their public posts, comments, and activity in one organized dashboard.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Leadverse — Reddit Public Activity Search Tool",
    description:
      "Search any Reddit username and browse their public posts and comments.",
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
