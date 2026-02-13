import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/components/ScrollReveal';
import {
  Car,
  Headset,
  IndianRupee,
  ShieldCheck,
  Calendar,
  UserCheck,
  XCircle,
  MapPin,
  type LucideIcon,
} from 'lucide-react';
import { featuresData } from '@/data/cars';

const iconMap: Record<string, LucideIcon> = {
  Car,
  Headset,
  IndianRupee,
  ShieldCheck,
  Calendar,
  UserCheck,
  XCircle,
  MapPin,
};

export const Features = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-custom">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-foreground">
            Why Choose <span className="text-primary">Mallikarjuna Travels</span>?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience the difference with our premium services and commitment to excellence
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {featuresData.map((feature) => {
            const IconComponent = iconMap[feature.icon] || Car;
            return (
              <motion.div
                key={feature.title}
                variants={staggerItem}
                className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300 text-center"
              >
                <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                  <IconComponent className="h-8 w-8 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="mt-5 text-lg font-heading font-semibold text-card-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
