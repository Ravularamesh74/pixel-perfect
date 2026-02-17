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
    Check,
    Users,
    Star,
    Wind,
    Fuel,
    Cog
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
import { locationsData, additionalServicesData } from '@/data/cars';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import { loadRazorpay } from '@/lib/razorpay';
import { useParams, useNavigate } from 'react-router-dom';

// Form Schema
const bookingSchema = z.object({
    fullName: z.string().min(3, 'Name must be at least 3 characters'),
    email: z.string().email('Please enter a valid email'),
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number'),
    alternatePhone: z.string().optional(),
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

export default function BookingWizard() {
    const { user } = useAuth();
    const { carId } = useParams();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [cars, setCars] = useState<any[]>([]);
    const [isCarsLoading, setIsCarsLoading] = useState(true);

    const form = useForm<BookingFormData>({
        resolver: zodResolver(bookingSchema),
        defaultValues: {
            fullName: user?.name || '',
            email: user?.email || '',
            phone: '', // User model might not have phone populated in session sometimes
            alternatePhone: '',
            pickupLocation: '',
            dropoffLocation: '',
            pickupDate: '',
            pickupTime: '09:00',
            dropoffDate: '',
            dropoffTime: '09:00',
            selectedCarId: carId || '',
            additionalServices: [],
            purposeOfTravel: '',
            specialRequests: '',
            agreeToTerms: false,
        },
    });

    const { register, handleSubmit, watch, setValue, formState: { errors } } = form;
    const watchedValues = watch();

    // Load cars
    useEffect(() => {
        const fetchCars = async () => {
            try {
                const response = await api.get('/cars');
                const mappedCars = response.data.data.cars.map((car: any) => ({
                    ...car,
                    id: car._id,
                }));
                setCars(mappedCars);
            } catch (err) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to fetch cars."
                });
            } finally {
                setIsCarsLoading(false);
            }
        };
        fetchCars();
    }, []);

    // Pre-fill user data when user loads
    useEffect(() => {
        if (user) {
            setValue('fullName', user.name);
            setValue('email', user.email);
            // If phone exists in user object
            if ((user as any).phone) setValue('phone', (user as any).phone);
        }
    }, [user, setValue]);

    // Handle URL param for car
    useEffect(() => {
        if (carId) {
            setValue('selectedCarId', carId);
            // Only skip to step 2 if car is selected initially
            if (currentStep === 1 && user) setCurrentStep(2);
        }
    }, [carId, setValue, user]);

    const selectedCar = cars.find(car => car.id === watchedValues.selectedCarId);

    const calculateDuration = () => {
        if (!watchedValues.pickupDate || !watchedValues.dropoffDate) return { days: 0, hours: 0 };
        const start = new Date(`${watchedValues.pickupDate} ${watchedValues.pickupTime}`);
        const end = new Date(`${watchedValues.dropoffDate} ${watchedValues.dropoffTime}`);
        const diffMs = end.getTime() - start.getTime();
        const totalDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        return { days: totalDays };
    };

    const duration = calculateDuration();
    const basePrice = selectedCar ? selectedCar.pricePerDay * duration.days : 0;
    // Note: Backend doesn't calculate services cost yet, but we display it here
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
        // Simplified validation check (can be robustified)
        if (step === 1) return !!watchedValues.fullName && !!watchedValues.email && !!watchedValues.phone;
        if (step === 2) return !!watchedValues.pickupLocation && !!watchedValues.dropoffLocation && !!watchedValues.pickupDate && !!watchedValues.dropoffDate;
        if (step === 3) return !!watchedValues.selectedCarId;
        if (step === 4) return !!watchedValues.agreeToTerms && !!watchedValues.purposeOfTravel;
        return true;
    };

    const nextStep = () => {
        if (currentStep < 4 && validateStep(currentStep)) setCurrentStep(prev => prev + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(prev => prev - 1);
    };

    const onSubmit = async (data: BookingFormData) => {
        setIsSubmitting(true);
        try {
            // 1. Create Booking
            const bookingRes = await api.post('/bookings', {
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
            });

            const bookingId = bookingRes.data.data.booking._id;

            // 2. Create Razorpay Order
            const orderRes = await api.post('/payments/create-order', { bookingId });
            const { order } = orderRes.data.data;

            // 3. Load Razorpay
            const isLoaded = await loadRazorpay();
            if (!isLoaded) {
                throw new Error('Razorpay SDK failed to load');
            }

            // 4. Open Razorpay
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "Mallikarjuna Travels",
                description: `Booking for ${selectedCar?.name}`,
                order_id: order.id,
                handler: async (response: any) => {
                    try {
                        await api.post('/payments/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            bookingId
                        });

                        toast({
                            title: "Booking Confirmed",
                            description: "Your payment was successful!"
                        });

                        navigate('/dashboard/bookings');
                    } catch (error) {
                        toast({
                            variant: "destructive",
                            title: "Verification Failed",
                            description: "Payment verification failed. Please contact support."
                        });
                    }
                },
                prefill: {
                    name: data.fullName,
                    email: data.email,
                    contact: data.phone
                },
                theme: {
                    color: "#2563eb"
                }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.open();

        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Booking Failed",
                description: error.response?.data?.message || "Something went wrong"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="container-custom py-10 max-w-5xl">
            <h1 className="text-3xl font-bold mb-8 text-center">Complete Your Booking</h1>

            {/* Progress Steps */}
            <div className="flex justify-between items-center mb-10 px-4 md:px-20">
                {steps.map((step, index) => (
                    <div key={step.id} className="flex flex-col items-center relative z-10">
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300",
                            currentStep >= step.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        )}>
                            {currentStep > step.id ? <Check className="h-5 w-5" /> : step.id}
                        </div>
                        <span className="text-xs mt-2 font-medium">{step.label}</span>
                    </div>
                ))}
                {/* Progress Bar Background - simplified for this implementaiton */}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                        <form onSubmit={handleSubmit(onSubmit)}>
                            {/* Step 1: Personal Info */}
                            {currentStep === 1 && (
                                <div className="space-y-4 animate-fade-in">
                                    <h2 className="text-xl font-semibold mb-4">Personal Details</h2>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Full Name</Label>
                                            <Input {...register('fullName')} placeholder="John Doe" />
                                            {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Email</Label>
                                            <Input {...register('email')} placeholder="john@example.com" />
                                            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Phone</Label>
                                            <Input {...register('phone')} placeholder="1234567890" />
                                            {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Rental Details */}
                            {currentStep === 2 && (
                                <div className="space-y-4 animate-fade-in">
                                    <h2 className="text-xl font-semibold mb-4">Trip Details</h2>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Pickup Location</Label>
                                            <Select onValueChange={(val) => setValue('pickupLocation', val)} value={watchedValues.pickupLocation}>
                                                <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                                                <SelectContent>
                                                    {locationsData.map(l => <SelectItem key={l.id} value={l.value}>{l.label}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Dropoff Location</Label>
                                            <Select onValueChange={(val) => setValue('dropoffLocation', val)} value={watchedValues.dropoffLocation}>
                                                <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                                                <SelectContent>
                                                    {locationsData.map(l => <SelectItem key={l.id} value={l.value}>{l.label}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Pickup Date</Label>
                                            <Input type="date" {...register('pickupDate')} min={today} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Pickup Time</Label>
                                            <Select onValueChange={(val) => setValue('pickupTime', val)} value={watchedValues.pickupTime}>
                                                <SelectTrigger><SelectValue placeholder="Select time" /></SelectTrigger>
                                                <SelectContent>
                                                    {timeSlots.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Dropoff Date</Label>
                                            <Input type="date" {...register('dropoffDate')} min={watchedValues.pickupDate || today} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Dropoff Time</Label>
                                            <Select onValueChange={(val) => setValue('dropoffTime', val)} value={watchedValues.dropoffTime}>
                                                <SelectTrigger><SelectValue placeholder="Select time" /></SelectTrigger>
                                                <SelectContent>
                                                    {timeSlots.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Vehicle Selection */}
                            {currentStep === 3 && (
                                <div className="space-y-4 animate-fade-in">
                                    <h2 className="text-xl font-semibold mb-4">Select Vehicle</h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {isCarsLoading ? <Loader2 className="animate-spin" /> : cars.map(car => (
                                            <div
                                                key={car.id}
                                                onClick={() => setValue('selectedCarId', car.id)}
                                                className={cn(
                                                    "border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md",
                                                    watchedValues.selectedCarId === car.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border"
                                                )}
                                            >
                                                <img src={car.image} alt={car.name} className="w-full h-32 object-cover rounded-md mb-2" />
                                                <h3 className="font-bold">{car.name}</h3>
                                                <div className="flex justify-between items-center mt-2">
                                                    <span className="text-primary font-bold">₹{car.pricePerDay}/day</span>
                                                    <div className="flex gap-2 text-xs text-muted-foreground">
                                                        <span className="flex items-center"><Users size={12} className="mr-1" />{car.seats}</span>
                                                        <span className="flex items-center"><Fuel size={12} className="mr-1" />{car.fuelType}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Final Review */}
                            {currentStep === 4 && (
                                <div className="space-y-6 animate-fade-in">
                                    <h2 className="text-xl font-semibold mb-4">Review & Pay</h2>

                                    <div className="space-y-4">
                                        <Label>Purpose of Travel</Label>
                                        <Select onValueChange={(val) => setValue('purposeOfTravel', val)} value={watchedValues.purposeOfTravel}>
                                            <SelectTrigger><SelectValue placeholder="Select purpose" /></SelectTrigger>
                                            <SelectContent>
                                                {travelPurposes.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                            </SelectContent>
                                        </Select>

                                        <div className="space-y-2 border rounded-lg p-4">
                                            <Label>Additional Services</Label>
                                            <div className="grid sm:grid-cols-2 gap-2">
                                                {additionalServicesData.map(service => (
                                                    <div key={service.id} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={service.id}
                                                            checked={selectedServices.includes(service.id)}
                                                            onCheckedChange={(checked) => {
                                                                if (checked) setSelectedServices([...selectedServices, service.id]);
                                                                else setSelectedServices(selectedServices.filter(id => id !== service.id));
                                                            }}
                                                        />
                                                        <label htmlFor={service.id} className="text-sm cursor-pointer">
                                                            {service.name} (+₹{service.price})
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="terms"
                                                checked={watchedValues.agreeToTerms}
                                                onCheckedChange={(checked) => setValue('agreeToTerms', checked as boolean)}
                                            />
                                            <label htmlFor="terms" className="text-sm">
                                                I agree to the Terms & Conditions and Privacy Policy
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between mt-8 pt-4 border-t">
                                <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 1}>Back</Button>
                                {currentStep < 4 ? (
                                    <Button type="button" onClick={nextStep} disabled={!validateStep(currentStep)}>Next</Button>
                                ) : (
                                    <Button type="submit" disabled={isSubmitting || !watchedValues.agreeToTerms}>
                                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Pay ₹{total.toLocaleString()}
                                    </Button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* Sidebar Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm sticky top-6">
                        <h3 className="text-lg font-bold mb-4">Booking Summary</h3>
                        {selectedCar && (
                            <div className="mb-4">
                                <h4 className="font-semibold text-primary">{selectedCar.name}</h4>
                                <p className="text-sm text-muted-foreground">{duration.days} Day(s) Trip</p>
                            </div>
                        )}

                        <div className="space-y-2 text-sm border-t pt-4">
                            <div className="flex justify-between">
                                <span>Base Price</span>
                                <span>₹{basePrice.toLocaleString()}</span>
                            </div>
                            {servicesTotal > 0 && (
                                <div className="flex justify-between">
                                    <span>Services</span>
                                    <span>₹{servicesTotal.toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span>Tax (18%)</span>
                                <span>₹{tax.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2">
                                <span>Total</span>
                                <span>₹{total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
