import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — Baku Larp',
  description: 'Privacy policy for Baku Larp leaderboard.',
}

const EFFECTIVE_DATE = 'May 10, 2026'
const CONTACT_EMAIL = 'guluzadakaan@gmail.com'

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:py-16">
      <header className="mb-10">
        <Link
          href="/"
          className="mb-6 inline-block text-sm font-semibold text-az-blue hover:underline"
        >
          ← Back to leaderboard
        </Link>
        <h1 className="text-4xl font-black tracking-tight text-zinc-900 sm:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-zinc-500">Effective {EFFECTIVE_DATE}</p>
      </header>

      <article className="prose prose-zinc max-w-none space-y-6 text-zinc-700 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-zinc-900 [&_p]:leading-relaxed [&_a]:text-az-blue [&_a]:underline">
        <p>
          This Privacy Policy explains how Baku Larp (&ldquo;the site&rdquo;,
          &ldquo;we&rdquo;) handles information when you use our leaderboard at
          this domain. The site is a community-driven, lighthearted leaderboard.
          We collect as little information as possible.
        </p>

        <h2>What we collect</h2>
        <p>
          We do not require accounts and we do not ask for personal information.
          When you submit a larp entry or cast a vote, we store only the content
          you submit (the name and claim text) and the vote counts. We do not
          link this content to your identity.
        </p>
        <p>
          Our hosting and analytics providers may automatically receive
          standard server data such as IP address, browser type, and pages
          visited, which is used solely to operate the site, prevent abuse,
          and measure aggregate traffic.
        </p>

        <h2>Local storage</h2>
        <p>
          To prevent duplicate voting from the same device, we save a small
          record in your browser&apos;s local storage indicating which entry
          you voted on. This data never leaves your device and is not sent to
          our servers. You can clear it at any time using your browser&apos;s
          settings.
        </p>

        <h2>IP-based vote deduplication</h2>
        <p>
          To prevent vote manipulation, when you cast a vote we compute a
          one-way cryptographic hash (SHA-256, salted) of your IP address and
          store the hash. We do not store your raw IP. The hash is used only
          to enforce the one-vote-per-network rule and is not linked to your
          identity, your browser, or any other tracking system.
        </p>

        <h2>Cookies and advertising</h2>
        <p>
          Third-party vendors, including Google, use cookies to serve ads
          based on your prior visits to this site or other sites. Google&apos;s
          use of advertising cookies enables it and its partners to serve ads
          to you based on your visit to this site and/or other sites on the
          Internet.
        </p>
        <p>
          You may opt out of personalized advertising by visiting{' '}
          <a
            href="https://www.google.com/settings/ads"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Ads Settings
          </a>
          . You can also opt out of a third-party vendor&apos;s use of cookies
          for personalized advertising by visiting{' '}
          <a
            href="https://www.aboutads.info/"
            target="_blank"
            rel="noopener noreferrer"
          >
            www.aboutads.info
          </a>
          .
        </p>
        <p>
          For more information about how Google uses data, see{' '}
          <a
            href="https://policies.google.com/technologies/partner-sites"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google&apos;s privacy &amp; terms
          </a>
          .
        </p>

        <h2>Analytics</h2>
        <p>
          We use Vercel Analytics to measure aggregate, anonymized traffic
          patterns. Vercel Analytics does not use cookies and does not track
          individual users across sites.
        </p>

        <h2>Third-party services</h2>
        <p>
          The site uses the following third-party services to operate:
        </p>
        <ul className="list-disc space-y-1 pl-6">
          <li>Supabase — database hosting and realtime updates</li>
          <li>Vercel — site hosting and analytics</li>
          <li>Google AdSense — advertising</li>
        </ul>

        <h2>Data retention</h2>
        <p>
          Larp entries and vote counts are retained as part of the public
          leaderboard. If you would like an entry removed, contact us at the
          email below.
        </p>

        <h2>Children&apos;s privacy</h2>
        <p>
          The site is not directed at children under 13 and we do not
          knowingly collect information from children under 13.
        </p>

        <h2>Changes to this policy</h2>
        <p>
          We may update this policy from time to time. Material changes will
          be reflected by updating the effective date above.
        </p>

        <h2>Contact</h2>
        <p>
          Questions or removal requests:{' '}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </article>
    </main>
  )
}
