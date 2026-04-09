'use client'

import {
  UserPlus,
  Building2,
  ArrowRightLeft,
  HelpCircle,
  Users,
  MessageSquare,
  Activity,
  Calendar,
  Eye,
} from 'lucide-react'
import { DashboardPageHeader } from '../layout'

export default function HelpPage() {
  return (
    <div className="max-w-4xl">
      <DashboardPageHeader
        icon={HelpCircle}
        label="Help"
        description="How the dashboard tools work — leads, contacts, listings, messages, and more."
      />

      <div className="space-y-6">
        {/* Leads */}
        <Section
          icon={UserPlus}
          title="Leads"
          content={
            <>
              <p>
                When someone fills out the contact form on the website, they automatically appear here
                as a <strong>lead</strong>. Each lead captures their interest (buying, selling, design,
                or a combination), along with details like budget, bedroom/bathroom preferences,
                preferred zip codes, and any notes they included.
              </p>
              <p>
                Leads are <strong>your inbox</strong> — check them regularly and reach out. Once
                you&apos;ve made contact and are ready to work with someone, convert them into a
                contact.
              </p>
              <p>
                You can <strong>filter leads by interest</strong> (Buying, Selling, or Design) and
                search by name, email, or phone to find specific submissions quickly.
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

        {/* Contacts */}
        <Section
          icon={Users}
          title="Contacts"
          content={
            <>
              <p>
                Contacts are the people you&apos;re actively working with — <strong>clients</strong> (buyers
                and sellers) and <strong>partners</strong> (lenders, inspectors, contractors, etc.).
                Unlike leads, contacts are people you&apos;ve already reached out to and have a
                relationship with.
              </p>
              <p>
                Each contact stores their name, phone, email, address, company, birthday, and notes.
                For buyer clients, you can also track their <strong>budget</strong>, preferred
                bedrooms/bathrooms, zip codes, and search radius. For sellers, you can note their
                property zip code and estimated value.
              </p>

              <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-4 mt-3">
                <p className="text-sm font-semibold text-white mb-2">Tips</p>
                <ul className="text-sm space-y-1">
                  <li>Use the <strong>Client</strong> / <strong>Partner</strong> filter to quickly switch between the two groups.</li>
                  <li>Search works across name, email, phone, address, and company.</li>
                  <li>Contacts created from lead conversion are automatically tagged as clients with their original details carried over.</li>
                  <li>Contacts with a phone number or email can be selected as recipients in the <strong>Messages</strong> tab.</li>
                </ul>
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
              <p>
                You can <strong>assign agents</strong> to any listing so the team knows who&apos;s
                handling what. Assigned agents appear on the public listing page with their contact info.
              </p>

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

              <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-4 mt-3">
                <p className="text-sm font-semibold text-white mb-2">Filtering &amp; Search</p>
                <p className="text-sm">
                  Use the filter panel to narrow listings by <strong>status</strong> (Active, Pending,
                  Sold, Off Market) and <strong>source</strong> (Manual or IDX). Search works across
                  address, city, zip code, and MLS number.
                </p>
              </div>
            </>
          }
        />

        {/* Messages */}
        <Section
          icon={MessageSquare}
          title="Messages"
          content={
            <>
              <p>
                The Messages tab lets you send <strong>bulk texts (SMS) or emails</strong> to your
                contacts. Choose your channel, write your message, and select recipients from your
                contact list.
              </p>

              <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-4 mt-3">
                <p className="text-sm font-semibold text-white mb-2">How It Works</p>
                <ul className="text-sm space-y-1">
                  <li><strong>Pick a channel</strong> — SMS or Email. The recipient list automatically updates to show only contacts with the right info (phone for SMS, email for Email).</li>
                  <li><strong>Filter recipients</strong> — narrow by type (Clients, Leads, Partners) or search by name.</li>
                  <li><strong>Select &amp; send</strong> — check individual recipients or use Select All, then compose and send.</li>
                </ul>
                <p className="text-sm mt-3 text-neutral-400">
                  Every message you send is saved in the history below the compose area, showing the
                  channel, recipient count, timestamp, and full message text.
                </p>
              </div>
            </>
          }
        />

        {/* Activity Log */}
        <Section
          icon={Activity}
          title="Activity Log"
          content={
            <>
              <p>
                The Activity tab is a <strong>complete audit trail</strong> of everything that happens
                in the dashboard — listings created, contacts updated, leads converted, status
                changes, agent assignments, and more. Every action is timestamped and shows who did it.
              </p>
              <p>
                Use the entity filter (Listings, Contacts, Leads) to focus on a specific area. This
                is helpful for reviewing what changed recently or checking on team activity.
              </p>

              <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-4 mt-3">
                <p className="text-sm font-semibold text-white mb-2">Adding Notes</p>
                <p className="text-sm">
                  You can add <strong>general notes</strong> directly from the Activity page using
                  the text input at the top. Notes appear in the activity feed alongside other events — useful for
                  logging calls, meetings, or anything that doesn&apos;t fit into a specific record.
                </p>
              </div>
            </>
          }
        />

        {/* Calendar */}
        <Section
          icon={Calendar}
          title="Calendar"
          content={
            <>
              <p>
                The Calendar tab embeds your <strong>Google Calendar</strong> directly into the
                dashboard. Enter your Google Calendar ID (usually your Gmail address) and your
                schedule will appear inline — no need to switch apps.
              </p>

              <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-4 mt-3">
                <p className="text-sm font-semibold text-white mb-2">Setup</p>
                <ul className="text-sm space-y-1">
                  <li>Your <strong>Calendar ID</strong> is typically your Gmail address (e.g., <code>you@gmail.com</code>).</li>
                  <li>Make sure your calendar is set to <strong>public</strong> in Google Calendar settings, or the embed won&apos;t load.</li>
                  <li>You can view and navigate your calendar here, or click the link to open the full Google Calendar.</li>
                </ul>
              </div>
            </>
          }
        />

        {/* Public Website */}
        <Section
          icon={Eye}
          title="What Visitors See"
          content={
            <>
              <p>
                The public website at <strong>estradaestates.com</strong> pulls directly from the same
                data you manage here. Here&apos;s what visitors interact with:
              </p>
              <ul>
                <li><strong>Listings page</strong> — shows all Active, Pending, and Sold listings with filters for city, bedrooms, price, and sorting options.</li>
                <li><strong>Listing detail</strong> — full property info with photos, description, assigned agent contact card, and an inquiry form.</li>
                <li><strong>Contact form</strong> — captures buyer/seller/design interest and creates a lead in your Leads tab.</li>
                <li><strong>Team page</strong> — agent bios and office info.</li>
                <li><strong>Services &amp; Resources</strong> — brokerage and design service descriptions, FAQs, mortgage calculator, and external listing links.</li>
              </ul>
              <p className="text-neutral-400">
                When you update a listing status or add a new listing, it shows up on the public site
                right away. Keeping your data current here means the website stays current too.
              </p>
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
  icon: typeof UserPlus
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
