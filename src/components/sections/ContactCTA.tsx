import { motion, useReducedMotion } from "framer-motion";
import { Phone, Mail, MessageCircle, ArrowRight } from "lucide-react";
import { useCallback, memo } from "react";
import { Button } from "@/components/ui/button";

const COMPANY = {
  phone: "+917989345281",
  email: "mallikarjunatravels9771@gmail.com",
  whatsapp: "https://wa.me/917989345281",
};

const CONTACT_METHODS = [
  {
    icon: Phone,
    label: "Call Us 24/7",
    value: COMPANY.phone,
    href: `tel:${COMPANY.phone}`,
  },
  {
    icon: Mail,
    label: "Email Us",
    value: COMPANY.email,
    href: `mailto:${COMPANY.email}`,
  },
  {
    icon: MessageCircle,
    label: "Chat on WhatsApp",
    value: COMPANY.phone,
    href: COMPANY.whatsapp,
    external: true,
  },
];

export const ContactCTA = memo(() => {
  const prefersReducedMotion = useReducedMotion();

  const scrollToBooking = useCallback(() => {
    if (typeof window === "undefined") return;

    const element = document.getElementById("booking");
    if (!element) return;

    const offset = 80;
    const position =
      element.getBoundingClientRect().top + window.pageYOffset - offset;

    window.scrollTo({ top: position, behavior: "smooth" });
  }, []);

  const animationProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.5 },
      };

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="relative section-padding overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-800 via-primary-700 to-primary" />

      <div className="container-custom relative z-10 text-center max-w-4xl mx-auto">

        {/* Heading */}
        <h2
          id="contact-heading"
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-white"
        >
          Ready to Start Your Journey?
        </h2>

        <p className="mt-6 text-lg sm:text-xl text-white/90 max-w-2xl mx-auto">
          Book your premium rental today and experience professional service,
          reliable vehicles, and 24/7 customer support.
        </p>

        {/* Primary CTA */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={scrollToBooking}
            data-analytics="book-now-click"
            className="bg-accent hover:bg-accent-light font-semibold text-lg px-8 py-6 shadow-lg"
          >
            Book Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          <Button
            size="lg"
            variant="outline"
            asChild
            className="border-2 border-white/30 text-white bg-white/5 hover:bg-white/10"
          >
            <a href={`tel:${COMPANY.phone}`}>
              <Phone className="mr-2 h-5 w-5" />
              Call Us
            </a>
          </Button>
        </div>

        {/* Contact Options */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {CONTACT_METHODS.map((method, index) => (
            <motion.a
              key={method.label}
              href={method.href}
              {...animationProps}
              target={method.external ? "_blank" : undefined}
              rel={method.external ? "noopener noreferrer" : undefined}
              aria-label={method.label}
              data-analytics={`contact-${index}`}
              className="group flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <div className="p-3 rounded-full bg-white/10 group-hover:bg-accent transition">
                <method.icon className="h-6 w-6 text-white" />
              </div>

              <span className="text-sm text-white/70">
                {method.label}
              </span>

              <span className="text-white font-medium">
                {method.value}
              </span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
});
