import SearchBar from "@/components/SearchBar";
import FunnelSection from "@/components/FunnelSection";
import ScrollShowcase from "@/components/ScrollShowcase";
import SparkleOverlay from "@/components/SparkleOverlay";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-16 sm:py-20">
        <SparkleOverlay />
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <h1 className="mb-6 text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Lets <span className="italic">Stalk</span> Them
          </h1>

          <p className="mx-auto mb-8 max-w-xl text-base text-zinc-400 sm:mb-10 sm:text-lg">
            Uncover any Reddit profile in seconds
          </p>

          <SearchBar />

          <p className="mt-4 text-xs text-zinc-600">
            Try searching: spez, GovSchwarzenegger, thisisbillgates
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-t border-card-border px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-10 text-center text-2xl font-bold text-foreground sm:mb-12 sm:text-3xl">
            Why <span className="text-green-accent">TrackTheirProfile</span>?
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              }
              title="Deep Search"
              description="Leverages Google's index to find every single post and comment associated with a Reddit username."
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
              description="Get comprehensive profile data in seconds. No sign-ups, no waiting — just enter a username and go."
            />
            <FeatureCard
              icon={
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              }
              title="Full Visibility"
              description="See post content, scores, comments, subreddits — everything you need to understand someone's Reddit activity."
            />
            <FeatureCard
              icon={
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                />
              }
              title="Privacy Focused"
              description="We only access publicly available information. No scraping private data, no storing results."
            />
            <FeatureCard
              icon={
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z"
                />
              }
              title="API Access"
              description="Need programmatic access? Our API lets you integrate Reddit profile data into your own tools and workflows."
            />
            <FeatureCard
              icon={
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              }
              title="Real-time Data"
              description="Results are fetched live from Reddit. You always get the most up-to-date information available."
            />
          </div>
        </div>
      </section>

      <FunnelSection />

      {/* Pricing Section */}
      <section id="pricing" className="border-t border-card-border px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-4 text-center text-2xl font-bold text-foreground sm:text-3xl">
            Simple pricing
          </h2>
          <p className="mb-12 text-center text-zinc-400">
            Try free. Unlock everything for{" "}
            <span className="font-semibold text-green-accent">$5</span> — one
            time, forever.
          </p>

          <div className="mx-auto grid max-w-2xl gap-6 sm:grid-cols-2">
            <PricingCard
              name="Free"
              price="$0"
              period=""
              features={[
                "5 searches (anonymous)",
                "20 searches after sign-up",
                "First 10 posts & comments",
                "Export to CSV",
              ]}
            />
            <PricingCard
              name="Lifetime"
              price="$5"
              period=" one-time"
              features={[
                "Unlimited searches",
                "All posts & comments revealed",
                "Export to CSV",
                "Lifetime access — pay once",
              ]}
              highlighted
              checkoutHref="/api/checkout"
            />
          </div>
        </div>
      </section>

      <ScrollShowcase />
    </>
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
