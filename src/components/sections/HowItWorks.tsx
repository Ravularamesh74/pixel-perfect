import { motion } from 'framer-motion';
import { Search, CalendarCheck, CheckCircle, Car } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Search,
    title: 'Choose Your Car',
    description: 'Browse our fleet and select the perfect vehicle for your journey',
  },
  {
    number: '02',
    icon: CalendarCheck,
    title: 'Book Online',
    description: 'Fill in your details and submit your booking request easily',
  },
  {
    number: '03',
    icon: CheckCircle,
    title: 'Get Confirmation',
    description: 'Receive instant confirmation and booking details via SMS & email',
  },
  {
    number: '04',
    icon: Car,
    title: 'Hit the Road',
    description: 'Pickup your car or get doorstep delivery and enjoy your trip',
  },
];

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="section-padding bg-gradient-to-b from-primary-50 to-background">
      <div className="container-custom">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-foreground">
            Your Journey <span className="text-primary">Starts Here</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Simple steps to get you on the road in no time
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting Line - Desktop */}
          <div className="hidden lg:block absolute top-16 left-[10%] right-[10%] h-1 bg-gradient-to-r from-primary-200 via-primary to-primary-200 rounded-full" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative text-center group"
              >
                {/* Number Circle */}
                <div className="relative z-10 mx-auto w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-heading font-bold text-2xl shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="mt-5 mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <step.icon className="h-6 w-6 text-primary" />
                </div>

                {/* Content */}
                <h3 className="mt-4 text-xl font-heading font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
