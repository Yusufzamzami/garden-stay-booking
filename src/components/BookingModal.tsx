import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Calendar, CreditCard, User, Phone, Mail } from 'lucide-react';
import { z } from 'zod';

const bookingSchema = z.object({
  guestName: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  guestEmail: z.string().trim().email('Invalid email address').max(255, 'Email too long'),
  guestPhone: z.string().trim().min(8, 'Phone number must be at least 8 digits').max(20, 'Phone number too long'),
  specialRequests: z.string().max(1000, 'Special requests must be less than 1000 characters').optional(),
});

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: any;
  checkIn: string;
  checkOut: string;
  guests: number;
}

const BookingModal = ({ isOpen, onClose, room, checkIn, checkOut, guests }: BookingModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [bookingData, setBookingData] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    paymentMethod: 'credit_card',
    specialRequests: '',
  });

  const calculateNights = () => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const totalPrice = room ? calculateNights() * room.price_per_night : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to make a booking.",
        variant: "destructive",
      });
      return;
    }

    // Validate input data
    const validationResult = bookingSchema.safeParse(bookingData);
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      toast({
        title: "Validation Error",
        description: firstError.message,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.from('bookings').insert({
        user_id: user.id,
        room_id: room.id,
        guest_name: bookingData.guestName,
        guest_email: bookingData.guestEmail,
        guest_phone: bookingData.guestPhone,
        check_in_date: checkIn,
        check_out_date: checkOut,
        guests_count: guests,
        total_price: totalPrice,
        payment_method: bookingData.paymentMethod,
        special_requests: bookingData.specialRequests,
        payment_status: 'completed', // Simulated payment success
        booking_status: 'confirmed',
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Booking Confirmed!",
        description: `Your reservation for ${room.name} has been confirmed.`,
      });
      
      onClose();
      setBookingData({
        guestName: '',
        guestEmail: '',
        guestPhone: '',
        paymentMethod: 'credit_card',
        specialRequests: '',
      });
    } catch (error: any) {
      toast({
        title: "Booking Error",
        description: error.message || "Failed to create booking.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Complete Your Booking
          </DialogTitle>
          <DialogDescription>
            Please fill in your details to confirm your reservation
          </DialogDescription>
        </DialogHeader>

        {room && (
          <div className="space-y-6">
            {/* Booking Summary */}
            <div className="bg-primary-soft/10 p-4 rounded-lg">
              <h3 className="font-semibold text-foreground mb-2">Booking Summary</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Room:</span>
                  <span className="font-medium">{room.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Check-in:</span>
                  <span>{new Date(checkIn).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Check-out:</span>
                  <span>{new Date(checkOut).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Nights:</span>
                  <span>{calculateNights()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Guests:</span>
                  <span>{guests}</span>
                </div>
                <div className="flex justify-between font-semibold text-foreground border-t pt-2">
                  <span>Total Price:</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guest-name" className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    Guest Name
                  </Label>
                  <Input
                    id="guest-name"
                    value={bookingData.guestName}
                    onChange={(e) => setBookingData({...bookingData, guestName: e.target.value})}
                    placeholder="Enter your full name"
                    maxLength={100}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guest-email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    Email Address
                  </Label>
                  <Input
                    id="guest-email"
                    type="email"
                    value={bookingData.guestEmail}
                    onChange={(e) => setBookingData({...bookingData, guestEmail: e.target.value})}
                    placeholder="your.email@example.com"
                    maxLength={255}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guest-phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" />
                    Phone Number
                  </Label>
                  <Input
                    id="guest-phone"
                    type="tel"
                    value={bookingData.guestPhone}
                    onChange={(e) => setBookingData({...bookingData, guestPhone: e.target.value})}
                    placeholder="+62 812 3456 7890"
                    maxLength={20}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment-method" className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-primary" />
                    Payment Method
                  </Label>
                  <Select value={bookingData.paymentMethod} onValueChange={(value) => setBookingData({...bookingData, paymentMethod: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="debit_card">Debit Card</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="cash">Cash on Arrival</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="special-requests">Special Requests (Optional)</Label>
                <Textarea
                  id="special-requests"
                  placeholder="Any special requests or requirements..."
                  value={bookingData.specialRequests}
                  onChange={(e) => setBookingData({...bookingData, specialRequests: e.target.value})}
                  maxLength={1000}
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? "Processing..." : `Confirm Booking - $${totalPrice.toFixed(2)}`}
                </Button>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;