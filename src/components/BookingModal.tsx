import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Room {
  id: string;
  name: string;
  type: string;
  price_per_night: number;
  capacity: number;
  description?: string;
  amenities?: string[];
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room | null;
  checkIn: string;
  checkOut: string;
  guests: number;
}

const BookingModal = ({ isOpen, onClose, room, checkIn, checkOut, guests }: BookingModalProps) => {
  const [loading, setLoading] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');

  const handleBooking = async () => {
    if (!room) return;

    if (!guestName || !guestEmail || !guestPhone) {
      toast.error('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('bookings').insert({
        room_id: room.id,
        guest_name: guestName,
        guest_email: guestEmail,
        guest_phone: guestPhone,
        check_in_date: checkIn,
        check_out_date: checkOut,
        guests_count: guests,
        total_price: room.price_per_night * guests,
        booking_status: 'confirmed',
        payment_status: 'pending',
        payment_method: 'cash',
        user_id: 'anonymous',
      });

      if (error) throw error;

      toast.success('Booking successful!');
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Booking failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{room?.name}</h2>
        <input
          type="text"
          placeholder="Guest Name"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          className="w-full mb-2 p-2 border rounded"
        />
        <input
          type="email"
          placeholder="Guest Email"
          value={guestEmail}
          onChange={(e) => setGuestEmail(e.target.value)}
          className="w-full mb-2 p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Guest Phone"
          value={guestPhone}
          onChange={(e) => setGuestPhone(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
        />

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleBooking} disabled={loading}>
            {loading ? 'Booking...' : 'Confirm Booking'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default BookingModal;
