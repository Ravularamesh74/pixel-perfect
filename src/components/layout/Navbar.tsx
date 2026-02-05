import { useState, useEffect } from 'react';
import { Menu, X, Phone, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Our Fleet', href: '#fleet' },
  { label: 'Services', href: '#services' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Contact', href: '#contact' },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      
      // Track active section
      const sections = navLinks.map(link => link.href.replace('#', ''));
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section && section.offsetTop - 100 <= window.scrollY) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
    setIsOpen(false);
  };

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-background/95 backdrop-blur-md shadow-lg border-b'
          : 'bg-transparent'
      )}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('#home');
            }}
            className="flex items-center gap-2 group"
          >
            <div className={cn(
              "p-2 rounded-lg transition-colors",
              isScrolled ? "bg-primary" : "bg-accent"
            )}>
              <Car className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className={cn(
                "font-heading font-bold text-lg leading-tight transition-colors",
                isScrolled ? "text-foreground" : "text-white"
              )}>
                Mallikarjuna
              </span>
              <span className={cn(
                "text-xs font-medium tracking-wider uppercase transition-colors",
                isScrolled ? "text-muted-foreground" : "text-white/80"
              )}>
                Travels
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(link.href);
                }}
                className={cn(
                  'relative font-medium text-sm transition-colors hover:text-primary',
                  isScrolled ? 'text-foreground' : 'text-white',
                  activeSection === link.href.replace('#', '') && 'text-primary',
                  activeSection === link.href.replace('#', '') && !isScrolled && 'text-accent'
                )}
              >
                {link.label}
                {activeSection === link.href.replace('#', '') && (
                  <span className={cn(
                    "absolute -bottom-1 left-0 right-0 h-0.5 rounded-full",
                    isScrolled ? "bg-primary" : "bg-accent"
                  )} />
                )}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <a
              href="tel:+919876543210"
              className={cn(
                "flex items-center gap-2 text-sm font-medium transition-colors",
                isScrolled ? "text-foreground hover:text-primary" : "text-white hover:text-accent"
              )}
            >
              <Phone className="h-4 w-4" />
              <span>+91 98765 43210</span>
            </a>
            <Button
              onClick={() => scrollToSection('#booking')}
              className="bg-accent hover:bg-accent-light text-accent-foreground font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Book Now
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "lg:hidden p-2 rounded-lg transition-colors",
              isScrolled ? "text-foreground" : "text-white"
            )}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          'lg:hidden fixed inset-x-0 top-[72px] bg-background/98 backdrop-blur-lg border-b shadow-xl transition-all duration-300 overflow-hidden',
          isOpen ? 'max-h-[calc(100vh-72px)] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="container-custom py-6 space-y-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(link.href);
              }}
              className={cn(
                'block py-3 px-4 rounded-lg font-medium transition-colors',
                activeSection === link.href.replace('#', '')
                  ? 'bg-primary/10 text-primary'
                  : 'text-foreground hover:bg-muted'
              )}
            >
              {link.label}
            </a>
          ))}
          <div className="pt-4 border-t space-y-4">
            <a
              href="tel:+919876543210"
              className="flex items-center gap-2 py-3 px-4 text-foreground"
            >
              <Phone className="h-4 w-4" />
              <span>+91 98765 43210</span>
            </a>
            <Button
              onClick={() => scrollToSection('#booking')}
              className="w-full bg-accent hover:bg-accent-light text-accent-foreground font-semibold"
            >
              Book Now
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
