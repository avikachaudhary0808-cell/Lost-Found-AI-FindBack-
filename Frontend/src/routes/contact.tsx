import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/findback/ui";
import { useLanguage } from "@/hooks/useLanguage";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — FindBack" },
      { name: "description", content: "Get in touch with the FindBack team." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t.contactUs}</h1>
            <p className="mt-3 text-sm text-muted-foreground">{t.contactSubtitle}</p>

            <div className="mt-8 space-y-4">
              <div className="rounded-xl border border-border bg-surface p-4">
                <h3 className="text-sm font-bold">{t.emailSupport}</h3>
                <p className="mt-1 text-sm text-muted-foreground">support@findback.app</p>
              </div>
              <div className="rounded-xl border border-border bg-surface p-4">
                <h3 className="text-sm font-bold">{t.phone}</h3>
                <p className="mt-1 text-sm text-muted-foreground">+1 (555) 123-4567</p>
              </div>
              <div className="rounded-xl border border-border bg-surface p-4">
                <h3 className="text-sm font-bold">{t.office}</h3>
                <p className="mt-1 text-sm text-muted-foreground" style={{ whiteSpace: "pre-line" }}>
                  {t.address}
                </p>
              </div>
            </div>

            <div className="mt-8">
              <Button size="sm" href="mailto:support@findback.app">
                {t.emailSupport}
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-2">
            <iframe
              title="FindBack office map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.0974381288378!2d-122.39971668468203!3d37.78777927975881!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80858070cc5f95b5%3A0x9c96b7f5e7f6c8b!2sSan%20Francisco%2C%20CA!5e0!3m2!1sen!2sus!4v1700000000000"
              width="100%"
              height="420"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
