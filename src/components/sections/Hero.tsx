import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Shield, Clock, Award } from "lucide-react";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-car.jpg";

const COMPANY = {
  name: "Mallikarjuna Travels",
  tagline: "Premium Car Rental Services in Secunderabad & Hyderabad",
  description:
    "Experience premium car rentals with unmatched comfort, safety, and 24/7 support. Trusted by 500+ happy customers.",
  slogan: "Driven by Trust. Defined by Comfort.",
};

const TRUST_INDICATORS = [
  { icon: Award, text: "10+ Years Experience" },
  { icon: Shield, text: "500+ Happy Customers" },
  { icon: Clock, text: "24/7 Support" },
];

export const Hero = () => {
  const prefersReducedMotion = useReducedMotion();

  const scrollToSection = useCallback((id: string) => {
    if (typeof window === "undefined") return;

    const element = document.getElementById(id);
    if (!element) return;

    const offset = 80;
    const position =
      element.getBoundingClientRect().top + window.pageYOffset - offset;

    window.scrollTo({ top: position, behavior: "smooth" });
  }, []);

  const animationProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 },
      };

  return (
    <header
      id="home"
      role="banner"
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Luxury car rental service in Secunderabad"
          className="w-full h-full object-cover"
          loading="eager"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/95 via-primary-800/90 to-primary-700/80" />
      </div>

      {/* Content */}
      <div className="container-custom relative z-10 pt-24 pb-16">
        <div className="max-w-3xl">

          {/* Badge */}
          <motion.div {...animationProps}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 text-accent text-sm font-medium border border-accent/30 backdrop-blur-sm">
              Trusted Since 2014
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            {...animationProps}
            className="mt-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight"
          >
            {COMPANY.name}
            <br />
            <span className="text-accent text-3xl md:text-4xl block mt-3">
              {COMPANY.tagline}
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            {...animationProps}
            transition={{ delay: 0.2 }}
            className="mt-6 text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl"
          >
            {COMPANY.description}
          </motion.p>

          {/* CTA */}
          <motion.div
            {...animationProps}
            transition={{ delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row gap-4"
          >
            <Button
              size="lg"
              onClick={() => scrollToSection("booking")}
              className="bg-accent hover:bg-accent-light font-semibold text-lg px-8 py-6 shadow-lg"
            >
              Book Your Ride
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => scrollToSection("fleet")}
              className="border-white/40 text-white bg-white/5 hover:bg-white/10"
            >
              View Fleet
            </Button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            {...animationProps}
            transition={{ delay: 0.4 }}
            className="mt-12 flex flex-wrap gap-8"
          >
            {TRUST_INDICATORS.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/10">
                  <item.icon className="h-5 w-5 text-accent" />
                </div>
                <span className="text-sm md:text-base text-white/90 font-medium">
                  {item.text}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </header>
  );
};
