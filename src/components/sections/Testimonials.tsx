import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/components/ScrollReveal';
import { Star, Quote } from 'lucide-react';
import { testimonialsData } from '@/data/cars';

export const Testimonials = () => {
  return (
    <section className="section-padding bg-secondary/30">
      <div className="container-custom">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-foreground">
            What Our <span className="text-primary">Customers Say</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Real experiences from real travelers
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {testimonialsData.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              variants={staggerItem}
              className="bg-card rounded-2xl p-6 shadow-lg border border-border hover:shadow-xl hover:border-primary/20 transition-all duration-300"
            >
              {/* Quote Icon */}
              <Quote className="h-10 w-10 text-primary/20" />

              {/* Rating */}
              <div className="flex gap-1 mt-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                ))}
              </div>

              {/* Review Text */}
              <p className="mt-4 text-muted-foreground italic leading-relaxed line-clamp-4">
                "{testimonial.review}"
              </p>

              {/* Customer Info */}
              <div className="mt-6 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-heading font-semibold">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-card-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
