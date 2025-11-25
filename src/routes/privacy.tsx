import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/privacy')({
  head: () => ({
    meta: [
      { title: 'Privacy Policy - Turbodoc' },
      {
        name: 'description',
        content: 'Privacy policy for Turbodoc bookmark management application',
      },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-12 md:py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-muted-foreground">
            Last updated:{' '}
            {new Date('2025-11-20').toLocaleDateString('en-US', {
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
                Welcome to Turbodoc. This Privacy Policy explains how Classic
                Apps Co (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;)
                collects, uses, and protects your information when you use our
                Turbodoc application and website at{' '}
                <a
                  href="https://turbodoc.ai"
                  className="text-primary hover:underline"
                >
                  https://turbodoc.ai
                </a>
                .
              </p>
            </section>

            {/* Information We Collect */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Information We Collect
              </h2>
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-6 border border-border">
                  <h3 className="text-lg font-medium text-foreground mb-3">
                    Website Content
                  </h3>
                  <p className="text-muted-foreground">
                    When you save bookmarks using Turbodoc, we collect and store
                    the content you choose to save, including:
                  </p>
                  <ul className="list-disc list-inside mt-3 text-muted-foreground space-y-1">
                    <li>Text content from web pages</li>
                    <li>Images and media files</li>
                    <li>Audio and video content</li>
                    <li>Hyperlinks and URL information</li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-3 italic">
                    This is currently the only type of data we collect from our
                    users.
                  </p>
                </div>
              </div>
            </section>

            {/* How We Use Your Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                How We Use Your Information
              </h2>
              <p className="text-muted-foreground mb-4">
                We use the website content you save to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>
                  Provide you with bookmark management and organization services
                </li>
                <li>Enable search functionality across your saved content</li>
                <li>
                  Synchronize your bookmarks across different devices and
                  platforms
                </li>
                <li>Improve and optimize our application&apos;s performance</li>
              </ul>
            </section>

            {/* Data Storage and Security */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Data Storage and Security
              </h2>
              <div className="bg-success/10 border border-success/20 rounded-lg p-6">
                <p className="text-foreground leading-relaxed">
                  Your data is stored securely using industry-standard
                  encryption and security measures. We implement appropriate
                  technical and organizational safeguards to protect your
                  information against unauthorized access, alteration,
                  disclosure, or destruction.
                </p>
              </div>
            </section>

            {/* Your Rights */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Your Rights
              </h2>
              <p className="text-muted-foreground mb-4">
                As a user, you have the right to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Access and view all your stored content</li>
                <li>Modify or update your saved bookmarks</li>
                <li>Delete individual bookmarks or your entire account</li>
                <li>Export your data in a portable format</li>
                <li>Request information about how your data is processed</li>
              </ul>
            </section>

            {/* Data Retention */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Data Retention
              </h2>
              <p className="text-muted-foreground">
                We retain your saved content for as long as your account remains
                active. If you delete your account, we will remove all
                associated content within 30 days, except where we are required
                to retain certain information for legal or regulatory purposes.
              </p>
            </section>

            {/* Third-Party Services */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Third-Party Services
              </h2>
              <p className="text-muted-foreground">
                Turbodoc may use third-party services for infrastructure and
                data processing. These services are carefully selected and
                required to maintain appropriate security standards and privacy
                protections for your data.
              </p>
            </section>

            {/* Changes to This Policy */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Changes to This Policy
              </h2>
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time to reflect
                changes in our practices or for legal and regulatory reasons. We
                will notify you of any material changes by posting the updated
                policy on our website and updating the &quot;Last updated&quot;
                date.
              </p>
            </section>

            {/* Contact Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Contact Us
              </h2>
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
                <p className="text-foreground mb-4">
                  If you have any questions about this Privacy Policy or our
                  data practices, please contact us:
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
    </div>
  );
}
