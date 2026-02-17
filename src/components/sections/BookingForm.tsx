import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  User,
  MapPin,
  Car,
  Settings,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Loader2,
  X,
  Check,
  Users,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { carsData, locationsData, additionalServicesData, type Car as CarType } from '@/data/cars';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

// Form Schema
const bookingSchema = z.object({
  fullName: z.string().min(3, 'Name must be at least 3 characters').regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number'),
  alternatePhone: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number').optional().or(z.literal('')),
  pickupLocation: z.string().min(1, 'Please select pickup location'),
  dropoffLocation: z.string().min(1, 'Please select dropoff location'),
  pickupDate: z.string().min(1, 'Please select pickup date'),
  pickupTime: z.string().min(1, 'Please select pickup time'),
  dropoffDate: z.string().min(1, 'Please select dropoff date'),
  dropoffTime: z.string().min(1, 'Please select dropoff time'),
  selectedCarId: z.string().min(1, 'Please select a vehicle'),
  additionalServices: z.array(z.string()).optional(),
  purposeOfTravel: z.string().min(1, 'Please select purpose of travel'),
  specialRequests: z.string().max(200, 'Maximum 200 characters').optional(),
  agreeToTerms: z.boolean().refine(val => val === true, 'You must agree to the terms'),
});

type BookingFormData = z.infer<typeof bookingSchema>;

const steps = [
  { id: 1, label: 'Personal Info', icon: User },
  { id: 2, label: 'Rental Details', icon: MapPin },
  { id: 3, label: 'Vehicle', icon: Car },
  { id: 4, label: 'Services', icon: Settings },
];

const timeSlots = Array.from({ length: 34 }, (_, i) => {
  const hour = Math.floor(i / 2) + 6;
  const minute = (i % 2) * 30;
  const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  const display = new Date(`2000-01-01 ${time}`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return { value: time, label: display };
});

const travelPurposes = [
  'Business',
  'Leisure',
  'Wedding',
  'Airport Transfer',
  'Outstation',
  'Other',
];

export const BookingForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [preSelectedCar, setPreSelectedCar] = useState<CarType | null>(null);

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      alternatePhone: '',
      pickupLocation: '',
      dropoffLocation: '',
      pickupDate: '',
      pickupTime: '09:00',
      dropoffDate: '',
      dropoffTime: '09:00',
      selectedCarId: '',
      additionalServices: [],
      purposeOfTravel: '',
      specialRequests: '',
      agreeToTerms: false,
    },
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = form;
  const watchedValues = watch();

  const [cars, setCars] = useState<CarType[]>([]);
  const [isCarsLoading, setIsCarsLoading] = useState(true);
  const [distance, setDistance] = useState<number>(0);

  // Calculate distance when locations change
  useEffect(() => {
    if (watchedValues.pickupLocation && watchedValues.dropoffLocation) {
      // Logic to fetch distance from backend
      // Using the simulated route endpoint
      const fetchRoute = async () => {
        try {
          const res = await fetch(`http://localhost:5000/api/maps/route?from=${watchedValues.pickupLocation}&to=${watchedValues.dropoffLocation}`);
          const data = await res.json();
          if (res.ok) {
            setDistance(data.distance);
          }
        } catch (error) {
          console.error("Failed to calculate distance");
        }
      };

      // Debounce slightly or just call
      const timer = setTimeout(fetchRoute, 500);
      return () => clearTimeout(timer);
    }
  }, [watchedValues.pickupLocation, watchedValues.dropoffLocation]);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/cars');
        const result = await response.json();
        if (response.ok) {
          const mappedCars = result.data.cars.map((car: any) => ({
            ...car,
            id: car._id,
          }));
          setCars(mappedCars);
        }
      } catch (err) {
        console.error('Failed to fetch cars:', err);
      } finally {
        setIsCarsLoading(false);
      }
    };
    fetchCars();
  }, []);

  // Pre-select car if coming from Fleet section
  useEffect(() => {
    const savedCar = sessionStorage.getItem('selectedCar');
    if (savedCar) {
      try {
        const car = JSON.parse(savedCar);
        // Ensure we use the mapped id (_id from backend)
        const carId = car.id || car._id;
        setValue('selectedCarId', carId);
        setCurrentStep(2); // Jump to date selection
        sessionStorage.removeItem('selectedCar'); // Clear after use
      } catch (e) {
        console.error('Error parsing saved car:', e);
      }
    }
  }, [setValue]);

  // Calculate pricing
  const selectedCar = cars.find(car => car.id === watchedValues.selectedCarId);
  const calculateDuration = () => {
    if (!watchedValues.pickupDate || !watchedValues.dropoffDate) return { days: 0, hours: 0 };
    const start = new Date(`${watchedValues.pickupDate} ${watchedValues.pickupTime}`);
    const end = new Date(`${watchedValues.dropoffDate} ${watchedValues.dropoffTime}`);
    const diffMs = end.getTime() - start.getTime();
    const totalDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    const totalHours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
    return { days: totalDays, hours: totalHours % 24 };
  };

  const duration = calculateDuration();
  const basePrice = selectedCar ? selectedCar.pricePerDay * duration.days : 0;
  const servicesTotal = selectedServices.reduce((total, serviceId) => {
    const service = additionalServicesData.find(s => s.id === serviceId);
    if (!service) return total;
    if (service.priceType === 'perDay') {
      return total + service.price * duration.days;
    }
    return total + service.price;
  }, 0);
  const subtotal = basePrice + servicesTotal;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + tax;

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(watchedValues.fullName && watchedValues.email && watchedValues.phone) &&
          !errors.fullName && !errors.email && !errors.phone;
      case 2:
        return !!(watchedValues.pickupLocation && watchedValues.dropoffLocation &&
          watchedValues.pickupDate && watchedValues.dropoffDate) &&
          !errors.pickupLocation && !errors.pickupDate && !errors.dropoffDate;
      case 3:
        return !!watchedValues.selectedCarId && !errors.selectedCarId;
      case 4:
        return !!(watchedValues.purposeOfTravel && watchedValues.agreeToTerms) &&
          !errors.purposeOfTravel && !errors.agreeToTerms;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (currentStep < 4 && validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const onSubmit = async (data: BookingFormData) => {
    // Check for errors in earlier steps that might have been missed
    if (!validateStep(1)) { setCurrentStep(1); return; }
    if (!validateStep(2)) { setCurrentStep(2); return; }
    if (!validateStep(3)) { setCurrentStep(3); return; }
    if (!validateStep(4)) { setCurrentStep(4); return; }

    setIsSubmitting(true);

    try {
      // 1. Create Booking
      const bookingResponse = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          carId: data.selectedCarId,
          pickupDate: data.pickupDate,
          pickupTime: data.pickupTime,
          dropoffDate: data.dropoffDate,
          dropoffTime: data.dropoffTime,
          pickupLocation: data.pickupLocation,
          dropoffLocation: data.dropoffLocation,
          services: selectedServices,
          customerName: data.fullName,
          customerEmail: data.email,
          customerPhone: data.phone,
          specialRequests: data.specialRequests,
          purposeOfTravel: data.purposeOfTravel
        }),
      });

      const bookingResult = await bookingResponse.json();

      if (!bookingResponse.ok) {
        throw new Error(bookingResult.message || 'Failed to create booking');
      }

      const bookingIdFromDb = bookingResult.data.booking._id;
      const displayBookingId = bookingResult.data.booking.bookingId;

      // 2. Create Razorpay Order
      const orderResponse = await fetch('http://localhost:5000/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingId: bookingIdFromDb }),
      });

      const orderResult = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderResult.message || 'Failed to create payment order');
      }

      const order = orderResult.data.order;

      // 3. Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder', // Should be in env
        amount: order.amount,
        currency: order.currency,
        name: "Mallikarjuna Travels",
        description: `Booking for ${selectedCar?.name}`,
        order_id: order.id,
        handler: async (response: any) => {
          try {
            // 4. Verify Payment
            const verifyResponse = await fetch('http://localhost:5000/api/payments/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingId: bookingIdFromDb
              }),
            });

            const verifyResult = await verifyResponse.json();

            if (!verifyResponse.ok) {
              throw new Error(verifyResult.message || 'Payment verification failed');
            }

            setBookingId(displayBookingId);
            setShowSuccess(true);
            toast({
              title: "Payment Successful",
              description: "Your booking has been confirmed.",
            });
          } catch (error: any) {
            toast({
              title: "Payment Verification Failed",
              description: error.message || "Please contact support if amount was deducted.",
              variant: "destructive",
            });
          }
        },
        prefill: {
          name: data.fullName,
          email: data.email,
          contact: data.phone,
        },
        theme: {
          color: "#2563eb",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        toast({
          title: "Payment Failed",
          description: response.error.description,
          variant: "destructive",
        });
      });
      rzp.open();

    } catch (error: any) {
      console.error('Booking/Payment Error:', error);
      toast({
        title: "Booking Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <section id="booking" className="section-padding bg-gradient-to-b from-secondary/50 to-background">
      <div className="container-custom">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-foreground">
            Book Your <span className="text-primary">Journey</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Fill in your details and we'll get you on the road
          </p>
        </motion.div>

        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto bg-card rounded-2xl shadow-2xl border border-border overflow-hidden"
        >
          {/* Progress Indicator */}
          <div className="bg-secondary/50 p-6 border-b border-border">
            <div className="flex justify-between items-center max-w-xl mx-auto">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all',
                        currentStep > step.id && 'bg-success text-success-foreground',
                        currentStep === step.id && 'bg-primary text-primary-foreground shadow-lg',
                        currentStep < step.id && 'bg-muted text-muted-foreground'
                      )}
                    >
                      {currentStep > step.id ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <step.icon className="h-5 w-5" />
                      )}
                    </div>
                    <span className={cn(
                      'mt-2 text-xs font-medium hidden sm:block',
                      currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                    )}>
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={cn(
                      'w-12 sm:w-16 h-1 mx-2 rounded-full',
                      currentStep > step.id ? 'bg-success' : 'bg-muted'
                    )} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid lg:grid-cols-3 gap-0">
              {/* Form Steps */}
              <div className="lg:col-span-2 p-6 md:p-8">
                <AnimatePresence mode="wait">
                  {/* Step 1: Personal Info */}
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <h3 className="text-xl font-heading font-semibold text-foreground">Your Information</h3>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="fullName">Full Name *</Label>
                          <Input
                            id="fullName"
                            {...register('fullName')}
                            placeholder="Enter your full name"
                            className="mt-1.5"
                          />
                          {errors.fullName && (
                            <p className="mt-1 text-sm text-destructive">{errors.fullName.message}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="email">Email Address *</Label>
                          <Input
                            id="email"
                            type="email"
                            {...register('email')}
                            placeholder="your.email@example.com"
                            className="mt-1.5"
                          />
                          {errors.email && (
                            <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
                          )}
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="phone">Phone Number *</Label>
                            <div className="flex mt-1.5">
                              <span className="inline-flex items-center px-3 bg-muted border border-r-0 border-input rounded-l-md text-sm text-muted-foreground">
                                +91
                              </span>
                              <Input
                                id="phone"
                                {...register('phone')}
                                placeholder="XXXXX XXXXX"
                                className="rounded-l-none"
                              />
                            </div>
                            {errors.phone && (
                              <p className="mt-1 text-sm text-destructive">{errors.phone.message}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="alternatePhone">Alternate Phone</Label>
                            <div className="flex mt-1.5">
                              <span className="inline-flex items-center px-3 bg-muted border border-r-0 border-input rounded-l-md text-sm text-muted-foreground">
                                +91
                              </span>
                              <Input
                                id="alternatePhone"
                                {...register('alternatePhone')}
                                placeholder="XXXXX XXXXX"
                                className="rounded-l-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Rental Details */}
                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <h3 className="text-xl font-heading font-semibold text-foreground">Journey Details</h3>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <Label>Pick-up Location *</Label>
                          <Select value={watchedValues.pickupLocation} onValueChange={(val) => setValue('pickupLocation', val)}>
                            <SelectTrigger className="mt-1.5">
                              <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                            <SelectContent>
                              {locationsData.map((loc) => (
                                <SelectItem key={loc.id} value={loc.value}>{loc.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.pickupLocation && (
                            <p className="mt-1 text-sm text-destructive">{errors.pickupLocation.message}</p>
                          )}
                        </div>

                        <div>
                          <Label>Drop-off Location *</Label>
                          <Select value={watchedValues.dropoffLocation} onValueChange={(val) => setValue('dropoffLocation', val)}>
                            <SelectTrigger className="mt-1.5">
                              <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                            <SelectContent>
                              {locationsData.map((loc) => (
                                <SelectItem key={loc.id} value={loc.value}>{loc.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Pick-up Date *</Label>
                          <Input
                            type="date"
                            {...register('pickupDate')}
                            min={today}
                            className="mt-1.5"
                          />
                          {errors.pickupDate && (
                            <p className="mt-1 text-sm text-destructive">{errors.pickupDate.message}</p>
                          )}
                        </div>

                        <div>
                          <Label>Pick-up Time *</Label>
                          <Select value={watchedValues.pickupTime} onValueChange={(val) => setValue('pickupTime', val)}>
                            <SelectTrigger className="mt-1.5">
                              <SelectValue placeholder="Select time" />
                            </SelectTrigger>
                            <SelectContent>
                              {timeSlots.map((slot) => (
                                <SelectItem key={slot.value} value={slot.value}>{slot.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Drop-off Date *</Label>
                          <Input
                            type="date"
                            {...register('dropoffDate')}
                            min={watchedValues.pickupDate || today}
                            className="mt-1.5"
                          />
                        </div>

                        <div>
                          <Label>Drop-off Time *</Label>
                          <Select value={watchedValues.dropoffTime} onValueChange={(val) => setValue('dropoffTime', val)}>
                            <SelectTrigger className="mt-1.5">
                              <SelectValue placeholder="Select time" />
                            </SelectTrigger>
                            <SelectContent>
                              {timeSlots.map((slot) => (
                                <SelectItem key={slot.value} value={slot.value}>{slot.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {duration.days > 0 && (
                        <div className="bg-primary-50 text-primary-800 p-4 rounded-lg">
                          <p className="font-medium">
                            Duration: {duration.days} day{duration.days !== 1 ? 's' : ''}
                            {duration.hours > 0 && `, ${duration.hours} hour${duration.hours !== 1 ? 's' : ''}`}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Step 3: Vehicle Selection */}
                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <h3 className="text-xl font-heading font-semibold text-foreground">Choose Your Vehicle</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {isCarsLoading ? (
                          <div className="col-span-full flex flex-col items-center justify-center py-12 gap-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-muted-foreground">Fetching our latest fleet...</p>
                          </div>
                        ) : cars.length === 0 ? (
                          <div className="col-span-full text-center py-12">
                            <p className="text-muted-foreground">No cars available at the moment. Please check back later.</p>
                          </div>
                        ) : (
                          cars.map((car) => (
                            <motion.div
                              key={car.id}
                              whileHover={{ y: -4 }}
                              className={cn(
                                "relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-300",
                                watchedValues.selectedCarId === car.id
                                  ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/20"
                                  : "border-border bg-card hover:border-primary/50 hover:shadow-sm"
                              )}
                              onClick={() => setValue('selectedCarId', car.id)}
                            >
                              {watchedValues.selectedCarId === car.id && (
                                <div className="absolute -right-2 -top-2 rounded-full bg-primary p-1 text-primary-foreground shadow-lg">
                                  <Check className="h-4 w-4" />
                                </div>
                              )}
                              <div className="aspect-video mb-4 overflow-hidden rounded-lg bg-secondary/50">
                                <img
                                  src={car.image}
                                  alt={car.name}
                                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                              </div>
                              <h3 className="font-heading font-semibold text-lg">{car.name}</h3>
                              <div className="mt-3 flex flex-wrap gap-2">
                                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-secondary/30 px-2 py-1 rounded">
                                  <Users className="h-3 w-3" /> {car.seats}
                                </span>
                                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-secondary/30 px-2 py-1 rounded">
                                  <Star className="h-3 w-3 fill-primary/20 text-primary" /> 4.9
                                </span>
                              </div>
                              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                                <span className="text-xl font-bold text-primary">₹{car.pricePerDay}</span>
                                <span className="text-xs text-muted-foreground">per day</span>
                              </div>
                            </motion.div>
                          ))
                        )}
                      </div>
                      {errors.selectedCarId && (
                        <p className="text-sm text-destructive">{errors.selectedCarId.message}</p>
                      )}
                    </motion.div>
                  )}

                  {/* Step 4: Additional Services */}
                  {currentStep === 4 && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <h3 className="text-xl font-heading font-semibold text-foreground">Enhance Your Experience</h3>

                      <div className="grid sm:grid-cols-2 gap-3">
                        {additionalServicesData.map((service) => (
                          <label
                            key={service.id}
                            className={cn(
                              'flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all',
                              selectedServices.includes(service.id)
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            )}
                          >
                            <Checkbox
                              checked={selectedServices.includes(service.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedServices([...selectedServices, service.id]);
                                } else {
                                  setSelectedServices(selectedServices.filter(id => id !== service.id));
                                }
                              }}
                            />
                            <div className="flex-1">
                              <p className="font-medium">{service.name}</p>
                              <p className="text-sm text-muted-foreground">{service.description}</p>
                              <p className="text-sm font-semibold text-primary mt-1">
                                +₹{service.price}{service.priceType === 'perDay' ? '/day' : ''}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>

                      <div>
                        <Label>Purpose of Travel *</Label>
                        <Select value={watchedValues.purposeOfTravel} onValueChange={(val) => setValue('purposeOfTravel', val)}>
                          <SelectTrigger className="mt-1.5">
                            <SelectValue placeholder="Select purpose" />
                          </SelectTrigger>
                          <SelectContent>
                            {travelPurposes.map((purpose) => (
                              <SelectItem key={purpose} value={purpose}>{purpose}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Special Requests</Label>
                        <Textarea
                          {...register('specialRequests')}
                          placeholder="Any specific requirements or notes..."
                          className="mt-1.5"
                          rows={3}
                        />
                      </div>

                      <label className="flex items-start gap-3 p-4 rounded-xl border border-border bg-muted/50">
                        <Checkbox
                          checked={watchedValues.agreeToTerms}
                          onCheckedChange={(checked) => setValue('agreeToTerms', checked as boolean)}
                        />
                        <span className="text-sm">
                          I agree to the{' '}
                          <a href="#" className="text-primary underline">Terms & Conditions</a>
                          {' '}and{' '}
                          <a href="#" className="text-primary underline">Privacy Policy</a>
                        </span>
                      </label>
                      {errors.agreeToTerms && (
                        <p className="text-sm text-destructive">{errors.agreeToTerms.message}</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 pt-6 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </Button>

                  {currentStep < 4 ? (
                    <Button type="button" onClick={nextStep} disabled={!validateStep(currentStep)} className="gap-2">
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button type="submit" disabled={isSubmitting || !validateStep(4)} className="gap-2 bg-accent hover:bg-accent-light">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Submit Booking
                          <CheckCircle className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Pricing Summary Sidebar */}
              <div className="bg-gradient-to-br from-primary-50 to-background p-6 border-l border-border">
                <h3 className="text-lg font-heading font-semibold text-foreground mb-4">Booking Summary</h3>

                {selectedCar ? (
                  <div className="space-y-4">
                    <div className="rounded-xl overflow-hidden border border-border">
                      <img src={selectedCar.image} alt={selectedCar.name} className="w-full aspect-video object-cover" />
                      <div className="p-3 bg-card">
                        <p className="font-semibold">{selectedCar.name}</p>
                        <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary uppercase">
                          {selectedCar.category}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Distance</span>
                        <span>{distance > 0 ? `${distance} km` : '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Base Rental</span>
                        <span>₹{basePrice.toLocaleString()}</span>
                      </div>
                      {servicesTotal > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Add-on Services</span>
                          <span>₹{servicesTotal.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>₹{subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">GST (18%)</span>
                        <span>₹{tax.toLocaleString()}</span>
                      </div>
                      <div className="border-t border-border pt-2 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">Total</span>
                          <span className="text-2xl font-heading font-bold text-primary">
                            ₹{total.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Car className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Select a vehicle to see pricing</p>
                  </div>
                )}
              </div>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowSuccess(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl shadow-2xl max-w-md w-full p-8 text-center"
            >
              <button
                onClick={() => setShowSuccess(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="w-20 h-20 mx-auto rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-success" />
              </div>

              <h3 className="mt-6 text-2xl font-heading font-bold text-foreground">
                Booking Request Submitted!
              </h3>

              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Reference Number</p>
                <p className="text-xl font-heading font-bold text-primary">{bookingId}</p>
              </div>

              <p className="mt-4 text-muted-foreground">
                Thank you! We've received your booking request. Our team will contact you within 2 hours to confirm.
              </p>

              <Button
                onClick={() => {
                  setShowSuccess(false);
                  setCurrentStep(1);
                  form.reset();
                  setSelectedServices([]);
                }}
                className="mt-6 w-full"
              >
                Book Another Ride
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
