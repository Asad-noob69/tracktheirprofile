import SearchBar from "@/components/SearchBar";
import FunnelSection from "@/components/FunnelSection";
import ScrollShowcase from "@/components/ScrollShowcase";
import SparkleOverlay from "@/components/SparkleOverlay";
import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-4 py-12 sm:py-16">
        <SparkleOverlay />
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-6xl md:text-7xl">
            Reddit <span className="text-green-accent">Market</span> Research
          </h1>

          <p className="mx-auto mb-8 max-w-xl text-base text-zinc-400 sm:mb-10 sm:text-lg">
            Discover what communities are saying — research topics, brands, and trends across Reddit
          </p>

          <SearchBar maxWidthClass="max-w-4xl" />

          <p className="mt-4 text-xs text-zinc-600">
            Try searching: spez, GovSchwarzenegger, thisisbillgates
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-t border-card-border px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-4 text-center text-2xl font-bold text-foreground sm:mb-6 sm:text-3xl">
            Built for <span className="text-green-accent">Market Research &amp; Competitive Analysis</span>
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-center text-sm text-zinc-400 sm:mb-12 sm:text-base">
            Whether you&apos;re analyzing brand sentiment, researching a market, or studying community trends — our tool saves you hours of manual work.
          </p>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              }
              title="Comprehensive Search"
              description="Aggregates publicly available posts and comments by topic, brand, or author into a single, structured view for research."
            />
            <FeatureCard
              icon={
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                />
              }
              title="Instant Results"
              description="Get organized community data in seconds. Enter a keyword or author and receive a structured summary immediately."
            />
            <FeatureCard
              icon={
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5"
                />
              }
              title="Structured Data"
              description="View posts, scores, comments, and subreddit context organized in a clean, easy-to-read dashboard."
            />
            <FeatureCard
              icon={
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                />
              }
              title="Public Data Only"
              description="We only aggregate publicly available Reddit content. No private data — just the public discussions that shape markets and opinions."
            />
            <FeatureCard
              icon={
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              }
              title="CSV Export"
              description="Download search results as a CSV file for offline analysis, reporting, or further research in your preferred tools."
            />
            <FeatureCard
              icon={
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              }
              title="Up-to-Date Results"
              description="Results are fetched live from public Reddit data. Always get the most current discussions, sentiment, and trends."
            />
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="border-t border-card-border px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-10 text-center text-2xl font-bold text-foreground sm:mb-12 sm:text-3xl">
            Who Uses <span className="text-green-accent">Leadverse</span>?
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <UseCaseCard
              title="Market Researchers"
              description="Understand what real users say about products, services, and brands. Gather unfiltered market feedback at scale."
            />
            <UseCaseCard
              title="Competitive Analysts"
              description="Monitor how competitors are discussed across Reddit communities. Identify strengths, weaknesses, and opportunities."
            />
            <UseCaseCard
              title="Product Teams"
              description="Research feature requests, pain points, and user sentiment from authentic community discussions before building."
            />
            <UseCaseCard
              title="Content Strategists"
              description="Discover trending topics, popular discussion themes, and content gaps to inform your editorial calendar."
            />
            <UseCaseCard
              title="Brand Monitoring"
              description="See how your brand or product is being discussed organically across thousands of subreddit communities."
            />
            <UseCaseCard
              title="Academic Researchers"
              description="Study public discourse patterns, community dynamics, and sentiment trends for social science research."
            />
          </div>
        </div>
      </section>

      <FunnelSection />

      {/* Pricing Section */}
      <section id="pricing" className="border-t border-card-border px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-4 text-center text-2xl font-bold text-foreground sm:text-3xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mb-12 text-center text-zinc-400">
            Start for free. Upgrade to unlimited access for a one-time payment of{" "}
            <span className="font-semibold text-green-accent">$5</span>.
          </p>

          <div className="mx-auto grid max-w-2xl gap-6 sm:grid-cols-2">
            <PricingCard
              name="Free"
              price="$0"
              period=""
              features={[
                "5 searches (no account needed)",
                "20 searches with free account",
                "Preview of first 10 results",
                "CSV export included",
              ]}
            />
            <PricingCard
              name="Lifetime Pro"
              price="$5"
              period=" one-time"
              features={[
                "Unlimited searches",
                "Full results — all posts & comments",
                "CSV export included",
                "Lifetime access — no subscription",
              ]}
              highlighted
              checkoutHref="/api/checkout"
            />
          </div>
          <p className="mt-8 text-center text-xs text-zinc-500">
            See our <Link href="/refund-policy" className="text-green-accent hover:underline">refund policy</Link> for details on our satisfaction guarantee.
          </p>
        </div>
      </section>

      <ScrollShowcase />
    </>
  );
}

function UseCaseCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-card-border bg-card-bg p-6 transition-all hover:border-green-accent/20">
      <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm leading-relaxed text-zinc-400">{description}</p>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-card-border bg-card-bg p-6 transition-all hover:border-green-accent/20">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-green-accent/10">
        <svg
          className="h-5 w-5 text-green-accent"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          {icon}
        </svg>
      </div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm leading-relaxed text-zinc-400">{description}</p>
    </div>
  );
}

function PricingCard({
  name,
  price,
  period,
  features,
  highlighted = false,
  checkoutHref,
}: {
  name: string;
  price: string;
  period: string;
  features: string[];
  highlighted?: boolean;
  checkoutHref?: string;
}) {
  return (
    <div
      className={`rounded-xl border p-6 ${
        highlighted
          ? "border-green-accent/50 bg-green-accent/5 shadow-[0_0_30px_rgba(0, 255, 157,0.1)]"
          : "border-card-border bg-card-bg"
      }`}
    >
      {highlighted && (
        <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-green-accent">
          Best Value
        </div>
      )}
      <h3 className="mb-1 text-xl font-bold text-foreground">{name}</h3>
      <div className="mb-6">
        <span className="text-3xl font-bold text-foreground">{price}</span>
        <span className="text-zinc-500">{period}</span>
      </div>
      <ul className="mb-6 space-y-3">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm text-zinc-300">
            <svg
              className="h-4 w-4 flex-shrink-0 text-green-accent"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
            {f}
          </li>
        ))}
      </ul>
      {checkoutHref ? (
        <a
          href={checkoutHref}
          className={`block w-full rounded-lg py-2.5 text-center text-sm font-semibold transition-all ${
            highlighted
              ? "bg-green-accent text-black hover:bg-[#00e68d]"
              : "border border-card-border bg-background text-foreground hover:border-green-accent/30"
          }`}
        >
          Get Lifetime Access
        </a>
      ) : (
        <a
          href="/signup"
          className={`block w-full rounded-lg py-2.5 text-center text-sm font-semibold transition-all ${
            highlighted
              ? "bg-green-accent text-black hover:bg-[#00e68d]"
              : "border border-card-border bg-background text-foreground hover:border-green-accent/30"
          }`}
        >
          Get Started Free
        </a>
      )}
    </div>
  );
}
