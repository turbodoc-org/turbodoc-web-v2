import { createFileRoute, Link } from '@tanstack/react-router';
import { AppHeader } from '@/components/shared/app-header';
import { AppFooter } from '@/components/shared/app-footer';
import { useAuth } from '@/lib/auth/context';

export const Route = createFileRoute('/terms')({
  head: () => ({
    meta: [
      { title: 'Terms of Service - Turbodoc' },
      {
        name: 'description',
        content:
          'Terms of service for Turbodoc bookmark management application',
      },
    ],
  }),
  component: Terms,
});

function Terms() {
  const { loading, user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <AppHeader showNavLinks={!loading && !!user} />
      <div className="container max-w-4xl mx-auto px-4 py-12 md:py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-muted-foreground">
            Last updated:{' '}
            {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
            {/* Introduction */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Introduction
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Welcome to Turbodoc. These Terms of Service (&quot;Terms&quot;)
                govern your use of Turbodoc application and website at{' '}
                <a
                  href="https://turbodoc.ai"
                  className="text-primary hover:underline"
                >
                  https://turbodoc.ai
                </a>{' '}
                operated by Classic Apps Co (&quot;we,&quot; &quot;us,&quot; or
                &quot;our&quot;). By using our service, you agree to be bound by
                these Terms.
              </p>
            </section>

            {/* Acceptance of Terms */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Acceptance of Terms
              </h2>
              <div className="bg-warning/10 border border-warning/20 rounded-lg p-6">
                <p className="text-foreground leading-relaxed">
                  By accessing or using Turbodoc, you acknowledge that you have
                  read, understood, and agree to be bound by these Terms. If you
                  do not agree to these Terms, please do not use our service.
                </p>
              </div>
            </section>

            {/* Description of Service */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Description of Service
              </h2>
              <p className="text-muted-foreground mb-4">
                Turbodoc is a bookmark management application that allows you
                to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Save and organize bookmarks from web pages</li>
                <li>Store text, images, videos, and other media content</li>
                <li>Search through your saved content</li>
                <li>Synchronize bookmarks across multiple devices</li>
                <li>Access your bookmarks from web and mobile platforms</li>
              </ul>
            </section>

            {/* User Accounts and Responsibilities */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                User Accounts and Responsibilities
              </h2>
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-6 border border-border">
                  <h3 className="text-lg font-medium text-foreground mb-3">
                    Account Creation
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    You must provide accurate and complete information when
                    creating an account. You are responsible for:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>
                      Maintaining the security of your account credentials
                    </li>
                    <li>All activities that occur under your account</li>
                    <li>Notifying us immediately of any unauthorized use</li>
                    <li>Keeping your account information up to date</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Acceptable Use */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Acceptable Use
              </h2>
              <p className="text-muted-foreground mb-4">
                You agree not to use Turbodoc for any unlawful purpose or in any
                way that violates these Terms. Prohibited activities include:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Storing illegal, harmful, or offensive content</li>
                <li>Violating any applicable laws or regulations</li>
                <li>Infringing on intellectual property rights</li>
                <li>Attempting to gain unauthorized access to our systems</li>
                <li>
                  Interfering with the service&apos;s operation or security
                </li>
                <li>Using the service to spam or harass others</li>
              </ul>
            </section>

            {/* Content Ownership and Rights */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Content Ownership and Rights
              </h2>
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
                <p className="text-foreground leading-relaxed mb-4">
                  You retain ownership of all content you save to Turbodoc. By
                  using our service, you grant us a limited, non-exclusive
                  license to store, process, and display your content solely for
                  the purpose of providing the bookmark management service.
                </p>
                <p className="text-muted-foreground">
                  You are responsible for ensuring you have the right to save
                  and store any content you add to Turbodoc.
                </p>
              </div>
            </section>

            {/* Service Availability */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Service Availability
              </h2>
              <p className="text-muted-foreground">
                We strive to maintain high availability of our service, but we
                cannot guarantee uninterrupted access. We reserve the right to
                modify, suspend, or discontinue any part of the service at any
                time with reasonable notice.
              </p>
            </section>

            {/* Privacy */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Privacy
              </h2>
              <p className="text-muted-foreground">
                Your privacy is important to us. Please review our{' '}
                <Link to="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>{' '}
                to understand how we collect, use, and protect your information.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Limitation of Liability
              </h2>
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
                <p className="text-foreground leading-relaxed">
                  To the fullest extent permitted by law, Classic Apps Co shall
                  not be liable for any indirect, incidental, special, or
                  consequential damages arising from your use of Turbodoc. Our
                  total liability shall not exceed the amount paid by you for
                  the service in the 12 months preceding the claim.
                </p>
              </div>
            </section>

            {/* Termination */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Termination
              </h2>
              <p className="text-muted-foreground mb-4">
                Either party may terminate your account at any time:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>
                  You may delete your account through the application settings
                </li>
                <li>We may terminate accounts that violate these Terms</li>
                <li>Upon termination, your access to the service will cease</li>
                <li>
                  Your data will be deleted according to our Privacy Policy
                </li>
              </ul>
            </section>

            {/* Changes to Terms */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Changes to These Terms
              </h2>
              <p className="text-muted-foreground">
                We may update these Terms from time to time to reflect changes
                in our service or legal requirements. We will notify you of any
                material changes by posting the updated Terms on our website and
                updating the &quot;Last updated&quot; date. Your continued use
                of the service after changes constitutes acceptance of the new
                Terms.
              </p>
            </section>

            {/* Governing Law */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Governing Law
              </h2>
              <p className="text-muted-foreground">
                These Terms are governed by and construed in accordance with the
                laws of the Netherlands. Any disputes arising from these Terms
                or your use of the service shall be subject to the exclusive
                jurisdiction of the courts in the Netherlands.
              </p>
            </section>

            {/* Contact Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Contact Us
              </h2>
              <div className="bg-success/10 border border-success/20 rounded-lg p-6">
                <p className="text-foreground mb-4">
                  If you have any questions about these Terms of Service, please
                  contact us:
                </p>
                <div className="space-y-2 text-muted-foreground">
                  <p>
                    <strong>Company:</strong> Classic Apps Co
                  </p>
                  <p>
                    <strong>Location:</strong> Netherlands
                  </p>
                  <p>
                    <strong>Website:</strong>{' '}
                    <a
                      href="https://turbodoc.ai"
                      className="text-primary hover:underline"
                    >
                      https://turbodoc.ai
                    </a>
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            ← Back to Turbodoc
          </Link>
        </div>
      </div>

      <AppFooter />
    </div>
  );
}
