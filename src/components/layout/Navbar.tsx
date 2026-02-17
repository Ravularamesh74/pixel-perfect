import { useState, useEffect, useCallback, useMemo } from "react";
import { Menu, X, Phone, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavLink {
  label: string;
  href: string;
}

const COMPANY = {
  name: "Mallikarjuna Travels",
  phones: ["+917989345281", "+919640059577"],
};

const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "#home" },
  { label: "Our Fleet", href: "#fleet" },
  { label: "Services", href: "#services" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Contact", href: "#contact" },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const sections = useMemo(
    () => NAV_LINKS.map((link) => link.href.replace("#", "")),
    []
  );

  const handleScroll = useCallback(() => {
    if (typeof window === "undefined") return;

    const scrollY = window.scrollY;
    setIsScrolled(scrollY > 20);

    for (let i = sections.length - 1; i >= 0; i--) {
      const section = document.getElementById(sections[i]);
      if (section && section.offsetTop - 120 <= scrollY) {
        setActiveSection(sections[i]);
        break;
      }
    }
  }, [sections]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const scrollToSection = useCallback((href: string) => {
    if (typeof window === "undefined") return;

    const element = document.querySelector(href);
    if (!element) return;

    const offset = 80;
    const position =
      element.getBoundingClientRect().top + window.pageYOffset - offset;

    window.scrollTo({ top: position, behavior: "smooth" });
    setIsOpen(false);
  }, []);

  return (
    <nav
      role="navigation"
      aria-label="Main Navigation"
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-background/95 backdrop-blur-md shadow-lg border-b"
          : "bg-transparent"
      )}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-[72px]">

          {/* Logo */}
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("#home");
            }}
            className="flex items-center gap-2 group focus:outline-none"
          >
            <div
              className={cn(
                "p-2 rounded-lg transition-colors",
                isScrolled ? "bg-primary" : "bg-accent"
              )}
            >
              <Car className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span
                className={cn(
                  "font-bold text-lg leading-tight transition-colors",
                  isScrolled ? "text-foreground" : "text-white"
                )}
              >
                Mallikarjuna
              </span>
              <span
                className={cn(
                  "text-xs uppercase tracking-wider transition-colors",
                  isScrolled ? "text-muted-foreground" : "text-white/80"
                )}
              >
                Travels
              </span>
            </div>
          </a>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => {
              const isActive =
                activeSection === link.href.replace("#", "");

              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(link.href);
                  }}
                  className={cn(
                    "relative font-medium text-sm transition-colors",
                    isScrolled ? "text-foreground" : "text-white",
                    isActive && "text-primary"
                  )}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />
                  )}
                </a>
              );
            })}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-6">
            {COMPANY.phones.map((phone) => (
              <a
                key={phone}
                href={`tel:${phone}`}
                className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
              >
                <Phone className="h-4 w-4" />
                {phone}
              </a>
            ))}

            <Button
              onClick={() => scrollToSection("#booking")}
              className="bg-accent hover:bg-accent-light font-semibold shadow-md"
            >
              Book Now
            </Button>
          </div>

          {/* Mobile Toggle */}
          <button
            aria-label="Toggle Menu"
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            onClick={() => setIsOpen((prev) => !prev)}
            className="lg:hidden p-2 rounded-lg"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className={cn(
          "lg:hidden fixed inset-x-0 top-[72px] bg-background/98 backdrop-blur-lg border-b shadow-xl transition-all duration-300 overflow-hidden",
          isOpen ? "max-h-[100vh] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="container-custom py-6 space-y-4">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(link.href);
              }}
              className="block py-3 px-4 rounded-lg font-medium hover:bg-muted transition"
            >
              {link.label}
            </a>
          ))}

          <div className="pt-4 border-t space-y-4">
            {COMPANY.phones.map((phone) => (
              <a
                key={phone}
                href={`tel:${phone}`}
                className="flex items-center gap-2 py-3 px-4"
              >
                <Phone size={16} />
                {phone}
              </a>
            ))}

            <Button
              onClick={() => scrollToSection("#booking")}
              className="w-full bg-accent hover:bg-accent-light font-semibold"
            >
              Book Now
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
