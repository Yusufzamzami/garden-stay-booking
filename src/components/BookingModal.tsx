import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
  const [paymentMethod, setPaymentMethod] = useState('cash');

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
        payment_method: paymentMethod,
        user_id: '00000000-0000-0000-0000-000000000000',
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{room?.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="guestName">Nama Tamu</Label>
            <Input
              id="guestName"
              type="text"
              placeholder="Masukkan nama lengkap"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="guestEmail">Email</Label>
            <Input
              id="guestEmail"
              type="email"
              placeholder="email@example.com"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="guestPhone">Nomor Telepon</Label>
            <Input
              id="guestPhone"
              type="text"
              placeholder="08xxxxxxxxxx"
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <Label>Metode Pembayaran</Label>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cash" id="cash" />
                <Label htmlFor="cash" className="font-normal cursor-pointer">Cash</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="iris_bca" id="iris_bca" />
                <Label htmlFor="iris_bca" className="font-normal cursor-pointer">IRIS - BCA</Label>
              </div>
            </RadioGroup>

            {paymentMethod === 'iris_bca' && (
              <div className="mt-3 p-4 bg-muted rounded-lg space-y-2">
                <p className="font-semibold">Transfer ke rekening BCA:</p>
                <div className="space-y-1">
                  <p className="text-sm">Nomor Rekening: <span className="font-mono font-bold">1234567890</span></p>
                  <p className="text-sm">Atas Nama: <span className="font-semibold">Hotel Management</span></p>
                  <p className="text-sm text-muted-foreground">Silakan transfer sejumlah {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR'
                  }).format(room?.price_per_night ? room.price_per_night * guests : 0)}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Batal
            </Button>
            <Button onClick={handleBooking} disabled={loading}>
              {loading ? 'Memproses...' : 'Konfirmasi Booking'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
