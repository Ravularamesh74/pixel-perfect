import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Fuel, Cog, Wind, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { carsData, categories, type Car } from '@/data/cars';
import { cn } from '@/lib/utils';

interface CarCardProps {
  car: Car;
  onSelect: (car: Car) => void;
}

const CarCard = ({ car, onSelect }: CarCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group bg-card rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-border"
    >
      {/* Image Section */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={car.image}
          alt={car.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4">
          <span className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold uppercase tracking-wide">
            {car.category}
          </span>
        </div>
        <div className="absolute top-4 left-4 flex items-center gap-1 px-2 py-1 rounded-lg bg-accent text-accent-foreground text-xs font-semibold">
          <Star className="h-3 w-3 fill-current" />
          <span>4.9</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        <h3 className="text-xl font-heading font-semibold text-card-foreground group-hover:text-primary transition-colors">
          {car.name}
        </h3>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4 text-primary" />
            <span>{car.seats} Seats</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Cog className="h-4 w-4 text-primary" />
            <span>{car.transmission}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Fuel className="h-4 w-4 text-primary" />
            <span>{car.fuelType}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Wind className="h-4 w-4 text-primary" />
            <span>{car.ac ? 'AC' : 'Non-AC'}</span>
          </div>
        </div>

        {/* Features */}
        <p className="mt-4 text-xs text-muted-foreground line-clamp-1">
          {car.features.join(' • ')}
        </p>

        {/* Divider */}
        <div className="border-t border-border my-4" />

        {/* Price & CTA */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-heading font-bold text-primary">
              ₹{car.pricePerDay.toLocaleString('en-IN')}
            </span>
            <span className="text-sm text-muted-foreground">/day</span>
          </div>
          <Button
            onClick={() => onSelect(car)}
            className="bg-primary hover:bg-primary-700 text-primary-foreground font-semibold"
          >
            Book Now
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export const Fleet = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredCars = selectedCategory === 'all'
    ? carsData
    : carsData.filter(car => car.category === selectedCategory);

  const handleCarSelect = (car: Car) => {
    // Scroll to booking form with car pre-selected
    const bookingSection = document.getElementById('booking');
    if (bookingSection) {
      const offset = 80;
      const elementPosition = bookingSection.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
    // Store selected car for booking form
    sessionStorage.setItem('selectedCar', JSON.stringify(car));
  };

  return (
    <section id="fleet" className="section-padding bg-secondary/30">
      <div className="container-custom">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-foreground">
            Discover Our <span className="text-primary">Premium Fleet</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose from our wide range of well-maintained vehicles for every occasion
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-2 mb-10"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={cn(
                'px-5 py-2.5 rounded-full text-sm font-medium transition-all',
                selectedCategory === category.id
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'bg-card text-muted-foreground hover:bg-primary/10 hover:text-primary border border-border'
              )}
            >
              {category.label}
            </button>
          ))}
        </motion.div>

        {/* Car Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCars.map((car) => (
            <CarCard key={car.id} car={car} onSelect={handleCarSelect} />
          ))}
        </div>
      </div>
    </section>
  );
};
