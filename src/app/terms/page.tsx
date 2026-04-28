import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — TrackTheirProfile",
  description: "Terms of Service for TrackTheirProfile, the Reddit profile tracking tool.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
      <h1 className="mb-2 text-3xl font-bold text-foreground sm:text-4xl">
        Terms of Service
      </h1>
      <p className="mb-10 text-sm text-zinc-500">
        Last updated: April 18, 2026
      </p>

      <div className="prose-sm space-y-8 text-zinc-300">
        <Section title="1. Introduction">
          <p>
            Welcome to TrackTheirProfile (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). TrackTheirProfile is a
            software-as-a-service (SaaS) tool that helps users inspect public
            Reddit profile activity by aggregating publicly available posts and
            comments into a structured dashboard. By accessing or using our
            website at tracktheirprofile.com (the &quot;Service&quot;), you agree to be bound by these Terms
            of Service (&quot;Terms&quot;). If you do not agree, please do not use the
            Service.
          </p>
        </Section>

        <Section title="2. Description of the Service">
          <p>
            TrackTheirProfile provides a web-based profile tracking tool that allows users to
            inspect public Reddit activity by author. The
            Service displays an aggregated, structured view of publicly available
            posts and comments.
          </p>
          <p>
            The Service only accesses and displays data that is already publicly
            available on Reddit. We do not access private messages, deleted
            content, non-public user data, or any information that requires
            authentication to view on Reddit.
          </p>
        </Section>

        <Section title="3. Acceptable Use">
          <p>You agree to use the Service only for lawful purposes. You may NOT use the Service to:</p>
          <ul className="ml-4 list-disc space-y-1.5">
            <li>Harass, stalk, threaten, or intimidate any person</li>
            <li>Conduct unsolicited outbound marketing, spam, or mass outreach campaigns</li>
            <li>Scrape, redistribute, or resell the data obtained through the Service</li>
            <li>Violate any applicable local, state, national, or international law or regulation</li>
            <li>Infringe on any third party&apos;s intellectual property rights</li>
            <li>Attempt to gain unauthorized access to any part of the Service or its systems</li>
            <li>Use automated bots, scripts, or tools to access the Service without our written consent</li>
          </ul>
          <p>
            We reserve the right to suspend or terminate accounts that violate
            these terms at our sole discretion without refund.
          </p>
        </Section>

        <Section title="4. User Accounts">
          <p>
            To access certain features, you may create an account using Google
            OAuth. You are responsible for maintaining the confidentiality of
            your account and for all activity that occurs under your account. You
            agree to notify us immediately of any unauthorized use.
          </p>
        </Section>

        <Section title="5. Payments and Billing">
          <p>
            TrackTheirProfile offers a free tier with limited searches and a paid
            &quot;Lifetime Pro&quot; plan for a one-time payment of $5 (USD). The
            Lifetime Pro plan grants unlimited access to full search results
            with no recurring charges.
          </p>
          <p>
            All payments are processed securely through our third-party payment
            processor. By making a purchase, you agree to the payment
            processor&apos;s terms and conditions. Prices are subject to change, but
            any changes will not affect previously completed purchases.
          </p>
        </Section>

        <Section title="6. Refunds">
          <p>
            We offer a 7-day refund policy for the Lifetime Pro plan. If you are
            not satisfied with your purchase, you may request a refund within 7
            days of payment. See our{" "}
            <Link href="/refund-policy" className="text-green-accent hover:underline">
              Refund Policy
            </Link>{" "}
            for full details.
          </p>
        </Section>

        <Section title="7. Intellectual Property">
          <p>
            All content, design, graphics, code, and other materials on the
            TrackTheirProfile website are owned by TrackTheirProfile or its licensors and are
            protected by applicable intellectual property laws. You may not copy,
            modify, distribute, or reproduce any part of the Service without
            our written permission.
          </p>
          <p>
            Reddit content displayed through the Service remains the property
            of Reddit and its respective authors. TrackTheirProfile does not claim
            ownership of any Reddit content.
          </p>
        </Section>

        <Section title="8. Disclaimer of Warranties">
          <p>
            The Service is provided &quot;as is&quot; and &quot;as available&quot; without
            warranties of any kind, either express or implied. We do not
            guarantee the accuracy, completeness, or timeliness of the data
            displayed. Public Reddit data may be modified or deleted by its
            authors at any time.
          </p>
        </Section>

        <Section title="9. Limitation of Liability">
          <p>
            To the maximum extent permitted by law, TrackTheirProfile and its owners,
            officers, employees, and agents shall not be liable for any
            indirect, incidental, special, consequential, or punitive damages
            arising from your use of the Service.
          </p>
        </Section>

        <Section title="10. Privacy">
          <p>
            Your use of the Service is also governed by our{" "}
            <Link href="/privacy" className="text-green-accent hover:underline">
              Privacy Policy
            </Link>
            , which describes how we collect, use, and protect your personal
            information.
          </p>
        </Section>

        <Section title="11. Changes to These Terms">
          <p>
            We may update these Terms from time to time. We will notify users of
            material changes by posting the updated Terms on our website with a
            revised &quot;Last updated&quot; date. Continued use of the Service after
            changes constitutes acceptance of the new Terms.
          </p>
        </Section>

        <Section title="12. Termination">
          <p>
            We may terminate or suspend your access to the Service at any time,
            with or without cause, with or without notice. Upon termination,
            your right to use the Service will immediately cease.
          </p>
        </Section>

        <Section title="13. Governing Law">
          <p>
            These Terms shall be governed by and construed in accordance with
            the laws of the jurisdiction in which TrackTheirProfile operates, without
            regard to conflict of law provisions.
          </p>
        </Section>

        <Section title="14. Contact Us">
          <p>
            If you have questions about these Terms, please contact us at:{" "}
            <a
              href="mailto:support@tracktheirprofile.com"
              className="text-green-accent hover:underline"
            >
              support@tracktheirprofile.com
            </a>
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-foreground">{title}</h2>
      <div className="space-y-3 text-sm leading-7 text-zinc-400">{children}</div>
    </section>
  );
}
