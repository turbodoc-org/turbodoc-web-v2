import { AppHeader } from '@/components/shared/app-header';
import { AppFooter } from '@/components/shared/app-footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/auth/context';
import { sendContactMessage } from '@/lib/api';
import { createFileRoute } from '@tanstack/react-router';
import { Image } from '@unpic/react';
import {
  MessageSquare,
  Send,
  Github,
  Linkedin,
  Twitter,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export const Route = createFileRoute('/contact')({ component: ContactPage });

function ContactPage() {
  const { loading, user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = await sendContactMessage(formData);
      setIsSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      toast.success(data.message || 'Message sent successfully!');

      // Reset success state after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <main className="min-h-screen flex flex-col bg-linear-to-br from-background via-background to-muted/20">
      <AppHeader showNavLinks={!loading && !!user} />

      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col px-4 py-12 md:py-16">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-linear-to-r from-primary/5 via-transparent to-primary/5 blur-3xl" />
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-primary/5 rounded-full blur-xl animate-pulse delay-1000" />

        <div className="relative max-w-5xl mx-auto w-full">
          {/* Header */}
          <div className="text-center space-y-4 mb-12">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                <MessageSquare className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  Get in Touch
                </span>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight">
              Let's chat!
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Questions? Feedback? Just want to say hi? I'd love to hear from
              you.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            {/* Contact Form */}
            <Card className="bg-background/60 backdrop-blur-sm border-border/50 shadow-lg">
              <CardContent className="p-8">
                {isSuccess ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <div className="p-4 bg-green-500/10 rounded-full">
                      <CheckCircle2 className="h-12 w-12 text-green-500" />
                    </div>
                    <h3 className="text-2xl font-semibold text-foreground">
                      Message sent!
                    </h3>
                    <p className="text-muted-foreground text-center">
                      Thanks for reaching out! I'll get back to you as soon as
                      possible.
                    </p>
                    <Button
                      onClick={() => setIsSuccess(false)}
                      variant="outline"
                      className="mt-4"
                    >
                      Send another message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="bg-background"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="bg-background"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        name="subject"
                        type="text"
                        placeholder="What's on your mind?"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="bg-background"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Tell me more..."
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        className="bg-background resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-linear-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-xl hover:shadow-primary/30"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message
                          <Send className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* About Me Section */}
            <div className="space-y-6">
              {/* Profile Card */}
              <Card className="bg-linear-to-br from-background via-background to-muted/10 border-border/50 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex flex-col items-center text-center space-y-6">
                    {/* Profile Image */}
                    <div className="relative">
                      <div className="absolute inset-0 bg-linear-to-r from-primary/20 to-primary/10 rounded-full blur-lg" />
                      <Image
                        src="/pic.jpg"
                        alt="Nico Botha"
                        width={120}
                        height={120}
                        className="relative rounded-full border-2 border-primary/20 shadow-lg"
                      />
                    </div>

                    {/* Info */}
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-foreground">
                        Nico Botha
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Creator of Turbodoc
                      </p>
                    </div>

                    {/* Bio */}
                    <div className="space-y-4 text-left w-full">
                      <p className="text-muted-foreground leading-relaxed">
                        Hey! 👋 I'm Nico, the human behind Turbodoc.
                      </p>
                      <p className="text-muted-foreground leading-relaxed">
                        I love hearing from users - whether it's a bug report, a
                        feature idea, or just to say hi. Feel free to reach out!
                      </p>
                    </div>

                    {/* Social Links */}
                    <div className="flex items-center gap-3 pt-4 border-t border-border/30 w-full justify-center">
                      <a
                        href="https://x.com/nwbotha"
                        className="group text-muted-foreground hover:text-primary transition-all duration-200 p-3 hover:bg-primary/10 rounded-xl border border-transparent hover:border-primary/20"
                        aria-label="Twitter"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Twitter className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                      </a>
                      <a
                        href="https://www.linkedin.com/in/nico-botha/"
                        className="group text-muted-foreground hover:text-primary transition-all duration-200 p-3 hover:bg-primary/10 rounded-xl border border-transparent hover:border-primary/20"
                        aria-label="LinkedIn"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Linkedin className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                      </a>
                      <a
                        href="https://github.com/Ngineer101"
                        className="group text-muted-foreground hover:text-primary transition-all duration-200 p-3 hover:bg-primary/10 rounded-xl border border-transparent hover:border-primary/20"
                        aria-label="GitHub"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Github className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Links Card */}
              <Card className="bg-background/60 backdrop-blur-sm border-border/50 shadow-lg">
                <CardContent className="p-6">
                  <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Other Ways to Connect
                  </h4>
                  <div className="space-y-3">
                    <a
                      href="https://github.com/turbodoc-org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                      <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                        <Github className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          GitHub
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Open source contributions welcome
                        </div>
                      </div>
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* FAQ Preview */}
          <Card className="bg-linear-to-br from-background via-background to-muted/10 border-border/50 shadow-lg">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-foreground mb-6 text-center">
                Common Questions
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-foreground">
                    When will the mobile apps launch?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    The iOS app is coming soon! Android will follow shortly
                    after. Sign up to get notified.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-foreground">
                    Is Turbodoc free?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Yes! Turbodoc is currently free during beta. We'll announce
                    any pricing changes well in advance.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-foreground">
                    Can I contribute to the project?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Absolutely! Turbodoc is open source. Check out our{' '}
                    <a
                      href="https://github.com/turbodoc-org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      GitHub repos
                    </a>{' '}
                    and contribute.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-foreground">
                    How do I report a bug?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Use this contact form, open a{' '}
                    <a
                      href="https://github.com/turbodoc-org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      GitHub issue
                    </a>
                    , or email me directly. I read everything!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <AppFooter />
    </main>
  );
}
