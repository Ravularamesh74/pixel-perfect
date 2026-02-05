import { motion } from 'framer-motion';
import { Phone, Mail, MessageCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const contactMethods = [
  {
    icon: Phone,
    label: 'Call Us 24/7',
    value: '+91 98765 43210',
    href: 'tel:+919876543210',
  },
  {
    icon: Mail,
    label: 'Email Us',
    value: 'info@mallikarjunatravels.com',
    href: 'mailto:info@mallikarjunatravels.com',
  },
  {
    icon: MessageCircle,
    label: 'Chat on WhatsApp',
    value: '+91 98765 43210',
    href: 'https://wa.me/919876543210',
  },
];

export const ContactCTA = () => {
  const scrollToBooking = () => {
    const element = document.getElementById('booking');
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  return (
    <section id="contact" className="relative section-padding overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-800 via-primary-700 to-primary" />
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2" />

      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-white">
            Ready to Start Your Journey?
          </h2>
          <p className="mt-6 text-lg sm:text-xl text-white/90 max-w-2xl mx-auto">
            Book your car today and experience premium service that exceeds expectations
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={scrollToBooking}
              className="bg-accent hover:bg-accent-light text-accent-foreground font-semibold text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all group"
            >
              Book Now
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-2 border-white/30 text-white bg-white/5 hover:bg-white/10 hover:border-white/50 font-semibold text-lg px-8 py-6"
            >
              <a href="tel:+919876543210">
                <Phone className="mr-2 h-5 w-5" />
                Call Us
              </a>
            </Button>
          </div>

          {/* Contact Methods */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactMethods.map((method) => (
              <motion.a
                key={method.label}
                href={method.href}
                target={method.href.startsWith('http') ? '_blank' : undefined}
                rel={method.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
              >
                <div className="p-3 rounded-full bg-white/10 group-hover:bg-accent transition-colors">
                  <method.icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-sm text-white/70">{method.label}</span>
                <span className="text-white font-medium">{method.value}</span>
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
