import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const WhatsAppButton = () => {
  return (
    <motion.a
      href="https://wa.me/919876543210?text=Hi%2C%20I%20would%20like%20to%20book%20a%20car"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 group"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.5, type: 'spring', stiffness: 200 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Chat on WhatsApp"
    >
      {/* Tooltip */}
      <span className="hidden sm:block px-3 py-1.5 rounded-lg bg-card text-card-foreground text-sm font-medium shadow-lg border border-border opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        Chat with us!
      </span>

      {/* Button */}
      <div className="relative">
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25" />
        <div className="relative w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] flex items-center justify-center shadow-xl transition-colors">
          <MessageCircle className="h-7 w-7 text-white fill-white" />
        </div>
      </div>
    </motion.a>
  );
};
