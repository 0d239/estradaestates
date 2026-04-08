'use client'

import {
  UserPlus,
  Building2,
  ArrowRightLeft,
} from 'lucide-react'

export default function HelpPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-white mb-2">Help</h1>
      <p className="text-neutral-400 mb-8">
        How leads and listings work in the dashboard.
      </p>

      <div className="space-y-6">
        {/* Leads */}
        <Section
          icon={UserPlus}
          title="Leads"
          content={
            <>
              <p>
                When someone fills out the contact form on the website, they automatically appear here
                as a <strong>lead</strong>. Each lead captures their interest (buying, selling, or
                both), along with details like budget, bedroom/bathroom preferences, preferred zip
                codes, and any notes they included.
              </p>
              <p>
                Leads are <strong>your inbox</strong> — check them regularly and reach out. Once
                you&apos;ve made contact and are ready to work with someone, convert them into a
                contact.
              </p>

              <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-4 mt-3">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowRightLeft className="w-4 h-4 text-primary-400" />
                  <p className="text-sm font-semibold text-white">Converting a Lead</p>
                </div>
                <p className="text-sm">
                  Use the <strong>Convert</strong> button on any lead to turn them into:
                </p>
                <ul className="text-sm mt-2">
                  <li>
                    <strong>Contact</strong> — moves them into your contacts as a client. Use this for
                    buyers or anyone you want to keep in your CRM.
                  </li>
                  <li>
                    <strong>Listing</strong> — creates a new listing from their property info. Use
                    this when a seller submits their property. The lead is removed after conversion.
                  </li>
                  <li>
                    <strong>Contact + Listing</strong> — creates both at once. The contact is linked
                    to the listing so you can track the relationship.
                  </li>
                </ul>
                <p className="text-sm mt-3 text-neutral-400">
                  Once converted, the lead disappears from the Leads tab and lives in Contacts,
                  Listings, or both.
                </p>
              </div>
            </>
          }
        />

        {/* Listings */}
        <Section
          icon={Building2}
          title="Listings"
          content={
            <>
              <p>
                Listings come from two sources:
              </p>
              <ul>
                <li>
                  <strong>IDX (automatic)</strong> — these are synced from the MLS feed automatically.
                  They update on their own and reflect what&apos;s live on the MLS. You don&apos;t
                  need to manage these.
                </li>
                <li>
                  <strong>Manual (your responsibility)</strong> — these are listings you or your team
                  add through the dashboard. Unlike IDX listings, <strong>you own the full
                  lifecycle</strong>: creating them, updating the status as things change, and marking
                  them sold or off market when the time comes.
                </li>
              </ul>

              <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-4 mt-3">
                <p className="text-sm font-semibold text-white mb-2">Manual Listing Lifecycle</p>
                <p className="text-sm">
                  When you add a listing manually, keep its status current:
                </p>
                <ul className="text-sm mt-2">
                  <li><strong>Active</strong> — on the market and available.</li>
                  <li><strong>Pending</strong> — under contract or in escrow.</li>
                  <li><strong>Sold</strong> — deal closed.</li>
                  <li><strong>Off Market</strong> — pulled or no longer listed.</li>
                </ul>
                <p className="text-sm mt-3 text-neutral-400">
                  Manual listings appear on the public website alongside IDX listings. Keeping them
                  accurate is important — visitors see the same data you do.
                </p>
              </div>
            </>
          }
        />
      </div>
    </div>
  )
}

function Section({
  icon: Icon,
  title,
  content,
}: {
  icon: typeof BookOpen
  title: string
  content: React.ReactNode
}) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary-900/30 rounded-lg">
          <Icon className="w-5 h-5 text-primary-400" />
        </div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      <div className="text-sm text-neutral-300 space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_code]:bg-neutral-800 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-primary-300 [&_code]:text-xs [&_strong]:text-white">
        {content}
      </div>
    </div>
  )
}
