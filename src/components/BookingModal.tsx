import { useState, useEffect } from 'react';
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
  const [totalPrice, setTotalPrice] = useState(0);

  // Set default price when room changes
  useState(() => {
    if (room) {
      setTotalPrice(room.price_per_night * guests);
    }
  });


  // Update price when room or guests change
  useEffect(() => {
    if (room) {
      setTotalPrice(room.price_per_night * guests);
    }
  }, [room, guests]);

  const handleBooking = async () => {
    if (!room) return;

    if (!guestName || !guestEmail || !guestPhone) {
      toast.error('Mohon lengkapi semua field.');
      return;
    }

    if (totalPrice <= 0) {
      toast.error('Harga total harus lebih dari 0.');
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
        total_price: totalPrice,
        booking_status: 'confirmed',
        payment_status: 'pending',
        payment_method: paymentMethod,
        user_id: '00000000-0000-0000-0000-000000000000',
      });

      if (error) throw error;

      toast.success('Booking berhasil!');
      // Reset form
      setGuestName('');
      setGuestEmail('');
      setGuestPhone('');
      setPaymentMethod('cash');
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Booking gagal.');
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

          <div className="space-y-2">
            <Label htmlFor="totalPrice">Total Harga</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                Rp
              </span>
              <Input
                id="totalPrice"
                type="number"
                placeholder="Masukkan total harga"
                value={totalPrice}
                onChange={(e) => setTotalPrice(parseFloat(e.target.value) || 0)}
                className="pl-10"
                min="0"
                step="1000"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Harga default: {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(room?.price_per_night ? room.price_per_night * guests : 0)}
            </p>
          </div>

          <div className="space-y-3">
            <Label>Metode Pembayaran</Label>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cash" id="cash" />
                <Label htmlFor="cash" className="font-normal cursor-pointer">Cash</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bca" id="bca" />
                <Label htmlFor="bca" className="font-normal cursor-pointer">BCA</Label>
              </div>
            </RadioGroup>

            {paymentMethod === 'bca' && (
              <div className="mt-3 p-4 bg-muted rounded-lg space-y-2">
                <p className="font-semibold">Transfer ke rekening BCA:</p>
                <div className="space-y-1">
                  <p className="text-sm">Nomor Rekening: <span className="font-mono font-bold">5380087580</span></p>
                  <p className="text-sm">Atas Nama: <span className="font-semibold">Sumitro</span></p>
                  <p className="text-sm text-muted-foreground">Silakan transfer sejumlah {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(totalPrice)}</p>
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
