import Link from 'next/link'
import { Zap, TrendingUp, Users, Trophy, BarChart3, Shield, ArrowRight, CheckCircle } from 'lucide-react'

const features = [
  {
    icon: TrendingUp,
    title: 'FTEM Pathway Tracking',
    description: "Built on the AIS's official athlete development framework. Track every athlete across all 10 development phases — from beginner to Olympic level.",
  },
  {
    icon: Users,
    title: 'Parent Visibility Portal',
    description: 'Give parents real-time insight into their child\'s progress, milestones, and development phase. Reduce the WhatsApp noise, increase trust.',
  },
  {
    icon: Trophy,
    title: 'Milestone Celebrations',
    description: 'Record and share athlete achievements with parents the moment they happen. Every milestone on the pathway deserves recognition.',
  },
  {
    icon: BarChart3,
    title: 'Club Intelligence',
    description: 'See your entire club\'s development funnel at a glance. Identify dropout risk early, benchmark against national cohorts, and prove your club\'s value.',
  },
  {
    icon: Shield,
    title: 'Australian-Built & Hosted',
    description: 'All data stored in Sydney, AWS ap-southeast-2. Fully compliant with the Australian Privacy Act. Designed for clubs managing under-18 athletes.',
  },
  {
    icon: Zap,
    title: 'Brisbane 2032 Ready',
    description: 'The countdown to a home Olympics is your club\'s biggest marketing opportunity. PathwayHQ gives you the infrastructure to tell that story.',
  },
]

const pricingTiers = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for small clubs getting started',
    athletes: 'Up to 15 athletes',
    cta: 'Start free',
    href: '/auth/signup',
    featured: false,
    features: ['Athlete profiles', 'FTEM phase tracking', 'Session logging', 'Basic attendance'],
  },
  {
    name: 'Starter',
    price: '$79',
    description: 'For growing community clubs',
    athletes: 'Up to 75 athletes',
    cta: 'Start free trial',
    href: '/auth/signup',
    featured: false,
    features: ['Everything in Free', 'Parent portal', 'Milestone sharing', 'Coach notes', 'Email support'],
  },
  {
    name: 'Growth',
    price: '$199',
    description: 'The most popular plan',
    athletes: 'Up to 300 athletes',
    cta: 'Start free trial',
    href: '/auth/signup',
    featured: true,
    features: ['Everything in Starter', 'Club analytics dashboard', 'Retention risk alerts', 'Multi-squad support', 'Benchmarking network', 'Priority support'],
  },
  {
    name: 'Elite',
    price: '$399',
    description: 'For large metropolitan clubs',
    athletes: 'Unlimited athletes',
    cta: 'Start free trial',
    href: '/auth/signup',
    featured: false,
    features: ['Everything in Growth', 'Pathway reports (PDF)', 'Grant application builder', 'API access', 'Dedicated account manager'],
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">PathwayHQ</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/clubs" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Find a club
            </Link>
            <Link href="/auth/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Sign in
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 px-6 py-24 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-4 py-1.5 text-sm font-medium text-emerald-300 ring-1 ring-emerald-500/30">
            <Zap className="h-3.5 w-3.5" />
            Brisbane 2032 — 6 years to the home Olympics
          </div>
          <h1 className="text-5xl font-extrabold leading-tight tracking-tight">
            The athlete development<br />
            <span className="text-emerald-400">platform for Australian sport.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
            Built on the AIS FTEM framework. Every athlete tracked, every milestone celebrated, every parent informed.
            The operating system your club needs for the road to 2032.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/auth/signup"
              className="flex items-center gap-2 rounded-xl bg-emerald-500 px-8 py-4 text-base font-semibold text-white hover:bg-emerald-400 transition-colors"
            >
              Start free — no credit card
              <ArrowRight className="h-4 w-4" />
            </Link>
            <span className="text-sm text-slate-400">Free forever up to 15 athletes</span>
          </div>
        </div>

        {/* Decorative gradient orbs */}
        <div className="pointer-events-none absolute -left-40 -top-40 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-40 -bottom-20 h-96 w-96 rounded-full bg-emerald-600/10 blur-3xl" />
      </section>

      {/* Social proof strip */}
      <section className="border-b border-slate-100 bg-slate-50 px-6 py-6">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-medium text-slate-500">
            Built for Australian clubs — data hosted in Sydney — Australian Privacy Act compliant
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900">Everything your club needs</h2>
            <p className="mt-3 text-slate-500">From grassroots to the Olympic pathway — one platform.</p>
          </div>
          <div className="grid grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                  <feature.icon className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="mb-2 text-base font-semibold text-slate-900">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FTEM callout */}
      <section className="bg-emerald-50 px-6 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-bold text-slate-900">Built on the AIS FTEM Framework</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            The Australian Institute of Sport&apos;s Foundations, Talent, Elite and Mastery framework is the official athlete development standard used by every National Sporting Organisation in Australia.
            PathwayHQ is the first platform to bring FTEM tracking to community clubs.
          </p>
          <div className="mt-8 flex justify-center gap-2 overflow-x-auto">
            {(['F1','F2','F3','T4','T5','T6','E7','E8','E9','M10'] as const).map((phase, i) => (
              <div
                key={phase}
                className={`flex h-10 min-w-[48px] items-center justify-center rounded-lg text-sm font-bold transition-all ${
                  i < 3 ? 'bg-emerald-200 text-emerald-800' :
                  i < 6 ? 'bg-blue-200 text-blue-800' :
                  i < 9 ? 'bg-purple-200 text-purple-800' :
                  'bg-amber-200 text-amber-900'
                }`}
              >
                {phase}
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-center gap-6 text-xs text-slate-500">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-400 inline-block" /> Foundations</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-400 inline-block" /> Talent</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-purple-400 inline-block" /> Elite</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400 inline-block" /> Mastery</span>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900">Simple, transparent pricing</h2>
            <p className="mt-3 text-slate-500">Start free. Upgrade when you grow.</p>
          </div>
          <div className="grid grid-cols-4 gap-6">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-xl border p-6 ${
                  tier.featured
                    ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-100'
                    : 'border-slate-200 bg-white'
                }`}
              >
                {tier.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-3 py-0.5 text-xs font-semibold text-white">
                    Most popular
                  </div>
                )}
                <h3 className="text-base font-semibold text-slate-900">{tier.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-slate-900">{tier.price}</span>
                  {tier.price !== '$0' && <span className="text-sm text-slate-500">/mo</span>}
                </div>
                <p className="mt-1 text-xs text-slate-500">{tier.athletes}</p>
                <p className="mt-1 text-xs text-slate-400">{tier.description}</p>

                <Link
                  href={tier.href}
                  className={`mt-6 block w-full rounded-lg px-4 py-2.5 text-center text-sm font-medium transition-colors ${
                    tier.featured
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  {tier.cta}
                </Link>

                <ul className="mt-6 space-y-2">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-slate-900 px-6 py-20 text-center text-white">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold">Start your club&apos;s Olympic journey today.</h2>
          <p className="mt-4 text-slate-400">
            Free to start. No credit card. Data hosted in Australia. Cancel anytime.
          </p>
          <Link
            href="/auth/signup"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-8 py-4 text-base font-semibold text-white hover:bg-emerald-400 transition-colors"
          >
            Create your club — it&apos;s free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 px-6 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-emerald-600">
              <Zap className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-700">PathwayHQ</span>
          </div>
          <p className="text-xs text-slate-400">
            Built in Brisbane, Australia. Data hosted in Sydney. © 2026 PathwayHQ.
          </p>
        </div>
      </footer>
    </div>
  )
}
