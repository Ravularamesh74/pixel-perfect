import React, { memo, useCallback } from "react";
import {
  Car,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
} from "lucide-react";

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

const COMPANY_INFO = {
  name: "Mallikarjuna Travels",
  phone: "+919640059577",
  email: "mallikarjunatravels9771@gmail.com",
  address:
    "Skandagiri Temple, Padmarao Nagar, Secunderabad, Telangana - 500021",
};

const footerLinks: {
  quickLinks: FooterLink[];
  services: FooterLink[];
} = {
  quickLinks: [
    { label: "Home", href: "#home" },
    { label: "Our Fleet", href: "#fleet" },
    { label: "Services", href: "#services" },
    { label: "About Us", href: "#about" },
    { label: "Contact", href: "#contact" },
  ],
  services: [
    { label: "Airport Transfers", href: "#services" },
    { label: "Outstation Travel", href: "#services" },
    { label: "Corporate Rentals", href: "#services" },
    { label: "Wedding & Events", href: "#services" },
    { label: "Monthly Rentals", href: "#services" },
  ],
};

const socialLinks = [
  { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
];

const FooterLinkItem = memo(
  ({ link, onClick }: { link: FooterLink; onClick?: (href: string) => void }) => (
    <li>
      <a
        href={link.href}
        onClick={(e) => {
          if (!link.external && onClick) {
            e.preventDefault();
            onClick(link.href);
          }
        }}
        target={link.external ? "_blank" : undefined}
        rel={link.external ? "noopener noreferrer" : undefined}
        className="text-sm text-white/70 hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-accent rounded"
      >
        {link.label}
      </a>
    </li>
  )
);

export const Footer = memo(() => {
  const scrollToSection = useCallback((href: string) => {
    if (typeof window === "undefined") return;

    const element = document.querySelector(href);
    if (element) {
      const offset = 80;
      const position =
        element.getBoundingClientRect().top + window.pageYOffset - offset;

      window.scrollTo({ top: position, behavior: "smooth" });
    }
  }, []);

  return (
    <footer
      className="bg-primary-900 text-white"
      role="contentinfo"
      aria-label="Website Footer"
    >
      <div className="container-custom pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-accent">
                <Car className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg leading-tight">
                  Mallikarjuna
                </h2>
                <span className="text-xs uppercase tracking-wider text-white/70">
                  Travels
                </span>
              </div>
            </div>

            <p className="text-sm text-white/70 leading-relaxed">
              Premium car rental services across India. Reliable fleet,
              professional drivers, and seamless booking experience.
            </p>

            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit our ${social.label}`}
                  className="p-2.5 rounded-lg bg-white/10 hover:bg-accent transition-colors focus:ring-2 focus:ring-accent"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {footerLinks.quickLinks.map((link) => (
                <FooterLinkItem
                  key={link.label}
                  link={link}
                  onClick={scrollToSection}
                />
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-lg mb-6">Our Services</h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <FooterLinkItem
                  key={link.label}
                  link={link}
                  onClick={scrollToSection}
                />
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-6">Contact Us</h3>
            <ul className="space-y-4 text-sm text-white/70">
              <li>
                <a
                  href={`tel:${COMPANY_INFO.phone}`}
                  className="flex items-start gap-3 hover:text-accent transition-colors"
                >
                  <Phone className="h-4 w-4 mt-0.5" />
                  {COMPANY_INFO.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${COMPANY_INFO.email}`}
                  className="flex items-start gap-3 hover:text-accent transition-colors"
                >
                  <Mail className="h-4 w-4 mt-0.5" />
                  {COMPANY_INFO.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-0.5" />
                {COMPANY_INFO.address}
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/50">
          <p>
            © {new Date().getFullYear()} {COMPANY_INFO.name}. All rights
            reserved.
          </p>
          <div className="flex gap-6">
            <a href="/privacy-policy" className="hover:text-accent">
              Privacy Policy
            </a>
            <a href="/terms" className="hover:text-accent">
              Terms & Conditions
            </a>
            <a href="/refund-policy" className="hover:text-accent">
              Refund Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
});
