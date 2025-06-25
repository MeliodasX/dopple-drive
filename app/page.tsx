import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import {
  ArrowRight,
  Badge,
  Check,
  Cloud,
  Share2,
  Shield,
  Smartphone,
  Star,
  Upload,
  Users,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

export default async function Home() {
  const { userId } = await auth()

  if (userId) redirect('/drive')

  const features = [
    {
      icon: <Upload className="h-6 w-6" />,
      title: 'Easy Upload',
      description:
        'Drag and drop files or upload with a single click. Support for all file types.'
    },
    {
      icon: <Share2 className="h-6 w-6" />,
      title: 'Secure Sharing',
      description:
        'Share files and folders with customizable permissions and expiration dates.'
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Enterprise Security',
      description:
        'End-to-end encryption and enterprise-grade security for your sensitive data.'
    },
    {
      icon: <Smartphone className="h-6 w-6" />,
      title: 'Mobile Ready',
      description:
        'Access your files anywhere with our responsive web app and mobile apps.'
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: 'Lightning Fast',
      description:
        'Optimized performance with instant sync and blazing-fast file operations.'
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Team Collaboration',
      description:
        'Work together seamlessly with real-time collaboration and team workspaces.'
    }
  ]

  const plans = [
    {
      name: 'Personal',
      price: 'Free',
      description: 'Perfect for personal use',
      features: [
        '5GB Storage',
        'Basic Sharing',
        'Mobile Access',
        'Email Support'
      ],
      popular: false
    },
    {
      name: 'Pro',
      price: '$9.99/mo',
      description: 'For professionals and small teams',
      features: [
        '100GB Storage',
        'Advanced Sharing',
        'Team Collaboration',
        'Priority Support',
        'Version History'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large organizations',
      features: [
        'Unlimited Storage',
        'Advanced Security',
        'Admin Controls',
        '24/7 Support',
        'Custom Integration',
        'SLA Guarantee'
      ],
      popular: false
    }
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <section className="px-4 py-20">
        <div className="container mx-auto text-center">
          <div className="mx-auto max-w-4xl">
            <Badge className="mb-6 border-blue-600/30 bg-blue-600/20 text-blue-400">
              <Star className="mr-1 h-3 w-3" />
              Now with AI-powered organization
            </Badge>

            <h1 className="mb-6 bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-4xl font-bold text-transparent md:text-6xl lg:text-7xl">
              Your files,{' '}
              <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                everywhere
              </span>
            </h1>
            <p className="mx-auto mb-8 max-w-3xl text-xl leading-relaxed text-slate-400 md:text-2xl">
              Store, sync, and share your files with the cloud storage solution
              built for the modern world. Fast, secure, and beautifully simple.
            </p>
            <div className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="bg-blue-600 px-8 py-3 text-lg text-white hover:bg-blue-500"
              >
                <Link href="/app">
                  Start for Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-slate-700 px-8 py-3 text-lg text-slate-300 hover:bg-slate-800 hover:text-slate-100"
              >
                Watch Demo
              </Button>
            </div>
            <div className="mx-auto grid max-w-2xl grid-cols-1 gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mb-2 text-3xl font-bold text-blue-400">
                  10M+
                </div>
                <div className="text-slate-400">Files Stored</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-3xl font-bold text-blue-400">
                  99.9%
                </div>
                <div className="text-slate-400">Uptime</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-3xl font-bold text-blue-400">
                  150+
                </div>
                <div className="text-slate-400">Countries</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="features" className="bg-slate-900/20 px-4 py-20">
        <div className="container mx-auto">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-100 md:text-4xl">
              Everything you need in cloud storage
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-slate-400">
              Powerful features designed to make file management effortless and
              collaboration seamless.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-slate-800 bg-slate-900/30 transition-colors hover:bg-slate-800/30"
              >
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-slate-100">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-400">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <section id="pricing" className="px-4 py-20">
        <div className="container mx-auto">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-100 md:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-slate-400">
              Choose the plan that&#39;s right for you. Upgrade or downgrade at
              any time.
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`relative border-slate-800 bg-slate-900/30 transition-colors hover:bg-slate-800/30 ${
                  plan.popular ? 'border-blue-600 bg-blue-600/5' : ''
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 transform bg-blue-600 text-white">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl text-slate-100">
                    {plan.name}
                  </CardTitle>
                  <div className="mt-4 text-3xl font-bold text-slate-100">
                    {plan.price}
                    {plan.price !== 'Free' && plan.price !== 'Custom' && (
                      <span className="text-lg font-normal text-slate-400">
                        /month
                      </span>
                    )}
                  </div>
                  <CardDescription className="text-slate-400">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="mb-6 space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-center gap-3"
                      >
                        <Check className="h-4 w-4 flex-shrink-0 text-blue-400" />
                        <span className="text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-500'
                        : 'bg-slate-800 text-slate-100 hover:bg-slate-700'
                    }`}
                  >
                    {plan.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-slate-900/20 px-4 py-20">
        <div className="container mx-auto text-center">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-6 text-3xl font-bold text-slate-100 md:text-4xl">
              Ready to get started?
            </h2>
            <p className="mb-8 text-xl text-slate-400">
              Join millions of users who trust Dopple Drive with their most
              important files.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="bg-blue-600 px-8 py-3 text-lg text-white hover:bg-blue-500"
              >
                <Link href="/app">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-slate-700 px-8 py-3 text-lg text-slate-300 hover:bg-slate-800 hover:text-slate-100"
              >
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>
      <footer className="border-t border-slate-800 bg-slate-900/50 px-4 py-12">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div className="col-span-1 md:col-span-2">
              <div className="mb-4 flex items-center gap-3">
                <div className="relative">
                  <Cloud
                    className="h-8 w-8 text-blue-500"
                    fill="currentColor"
                  />
                  <div className="absolute inset-0 rounded-full border-2 border-blue-700 opacity-60" />
                </div>
                <span className="text-xl font-bold text-slate-100">
                  Dopple Drive
                </span>
              </div>
              <p className="mb-6 max-w-md text-slate-400">
                The modern cloud storage solution that puts your files first.
                Fast, secure, and beautifully simple.
              </p>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between border-t border-slate-800 pt-8 md:flex-row">
            <p className="text-sm text-slate-400">
              © 2025 Created by MeliodasX. All rights reserved.
            </p>
            <div className="mt-4 flex gap-6 md:mt-0">
              <Link
                href="#"
                className="text-sm text-slate-400 transition-colors hover:text-slate-100"
              >
                Privacy Policy
              </Link>
              <Link
                href="#"
                className="text-sm text-slate-400 transition-colors hover:text-slate-100"
              >
                Terms of Service
              </Link>
              <Link
                href="#"
                className="text-sm text-slate-400 transition-colors hover:text-slate-100"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
