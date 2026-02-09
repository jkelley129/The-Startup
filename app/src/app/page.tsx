import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-xl font-bold text-slate-900">PulseAI</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-600 hover:text-slate-900 transition">Features</a>
              <a href="#pricing" className="text-slate-600 hover:text-slate-900 transition">Pricing</a>
              <a href="#docs" className="text-slate-600 hover:text-slate-900 transition">Docs</a>
              <Link href="/login" className="text-slate-600 hover:text-slate-900 transition">Sign in</Link>
              <Link
                href="/register"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition font-medium"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-sm font-medium mb-6">
            🚀 Now in Public Beta
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            API Analytics{' '}
            <span className="text-primary-600">Powered by AI</span>
          </h1>
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Monitor, analyze, and optimize your APIs in real-time. Get instant insights with
            AI-powered anomaly detection. Set up in 2 minutes, not 2 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-primary-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-primary-700 transition shadow-lg shadow-primary-600/25"
            >
              Start Free — No Credit Card
            </Link>
            <a
              href="#features"
              className="bg-white text-slate-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-slate-50 transition border border-slate-200"
            >
              See How It Works
            </a>
          </div>
          <p className="mt-6 text-sm text-slate-500">
            Free tier includes 100K API calls/month. No credit card required.
          </p>
        </div>
      </section>

      {/* Code Example */}
      <section className="pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-slate-900 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-slate-400 text-sm ml-2">Setup in 2 minutes</span>
            </div>
            <pre className="text-sm overflow-x-auto">
              <code className="text-green-400">{'// 1. Install the SDK\n'}</code>
              <code className="text-slate-300">{'npm install @pulseai/node\n\n'}</code>
              <code className="text-green-400">{'// 2. Add one line to your Express/Fastify/Koa app\n'}</code>
              <code className="text-slate-300">{'import { PulseAI } from \'@pulseai/node\';\n\n'}</code>
              <code className="text-slate-300">{'app.use(PulseAI.middleware({\n'}</code>
              <code className="text-slate-300">{'  apiKey: \'pk_live_your_key_here\'\n'}</code>
              <code className="text-slate-300">{'}));\n\n'}</code>
              <code className="text-green-400">{'// 3. That\'s it! Visit your dashboard 🎉\n'}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Everything you need to master your APIs
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Built by API developers, for API developers. Every feature designed to save you time.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '📊',
                title: 'Real-Time Dashboard',
                description: 'Live metrics on response times, error rates, throughput, and more. Beautiful charts that update in real-time.',
              },
              {
                icon: '🤖',
                title: 'AI Anomaly Detection',
                description: 'Machine learning models detect unusual patterns before they become incidents. Reduce alert noise by 90%.',
              },
              {
                icon: '⚡',
                title: '2-Minute Setup',
                description: 'One line of code. No complex configuration. Works with Express, Fastify, Koa, and any Node.js framework.',
              },
              {
                icon: '🔍',
                title: 'Endpoint Analytics',
                description: 'Per-endpoint breakdowns of performance, errors, and usage patterns. Find slow endpoints instantly.',
              },
              {
                icon: '🔔',
                title: 'Smart Alerts',
                description: 'AI-powered alerts that learn your API patterns. Get notified about real issues, not noise.',
              },
              {
                icon: '🔒',
                title: 'Security Insights',
                description: 'Detect suspicious patterns, unusual traffic spikes, and potential attacks in real-time.',
              },
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-2xl border border-slate-200 hover:border-primary-300 hover:shadow-lg transition">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-slate-600">Start free, scale as you grow. No surprises.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              {
                name: 'Free',
                price: '$0',
                period: 'forever',
                features: ['100K API calls/month', '1 project', '24h data retention', 'Basic dashboard', 'Community support'],
                cta: 'Get Started',
                highlighted: false,
              },
              {
                name: 'Starter',
                price: '$29',
                period: '/month',
                features: ['1M API calls/month', '5 projects', '30-day retention', 'AI anomaly detection', 'Email alerts', 'Email support'],
                cta: 'Start Trial',
                highlighted: false,
              },
              {
                name: 'Pro',
                price: '$99',
                period: '/month',
                features: ['10M API calls/month', 'Unlimited projects', '90-day retention', 'Advanced AI insights', 'Slack/PagerDuty', 'Team features', 'Priority support'],
                cta: 'Start Trial',
                highlighted: true,
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                period: '',
                features: ['Unlimited everything', '1-year retention', 'SSO/SAML', 'Custom SLA', 'Dedicated support', 'On-premise option', 'Custom integrations'],
                cta: 'Contact Sales',
                highlighted: false,
              },
            ].map((plan, i) => (
              <div
                key={i}
                className={`p-6 rounded-2xl ${
                  plan.highlighted
                    ? 'bg-primary-600 text-white ring-4 ring-primary-600/25 scale-105'
                    : 'bg-white border border-slate-200'
                }`}
              >
                <h3 className={`text-lg font-semibold ${plan.highlighted ? 'text-primary-100' : 'text-slate-600'}`}>
                  {plan.name}
                </h3>
                <div className="mt-2 mb-6">
                  <span className={`text-4xl font-bold ${plan.highlighted ? 'text-white' : 'text-slate-900'}`}>
                    {plan.price}
                  </span>
                  <span className={plan.highlighted ? 'text-primary-200' : 'text-slate-500'}>
                    {plan.period}
                  </span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className={`flex items-center text-sm ${plan.highlighted ? 'text-primary-100' : 'text-slate-600'}`}>
                      <span className="mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`block text-center py-2.5 rounded-lg font-medium transition ${
                    plan.highlighted
                      ? 'bg-white text-primary-600 hover:bg-primary-50'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <span className="text-lg font-bold text-white">PulseAI</span>
              </div>
              <p className="text-sm">AI-powered API analytics for modern development teams.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#docs" className="hover:text-white transition">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-sm text-center">
            © 2026 PulseAI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
