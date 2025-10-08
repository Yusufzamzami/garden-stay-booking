import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import BookingModal, { Room } from '@/components/BookingModal';
import { ArrowLeft, Users, Wifi, Snowflake, Car, Calendar } from 'lucide-react';

const Rooms = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const guests = parseInt(searchParams.get('guests') || '2');
  const roomType = searchParams.get('roomType') || '';

  useEffect(() => {
    fetchRooms();
  }, [roomType]);

  const fetchRooms = async () => {
    try {
      let query = supabase
        .from('rooms')
        .select('*')
        .eq('is_available', true)
        .in('type', ['standard', 'deluxe']);

      if (roomType && roomType !== 'any') {
        query = query.eq('type', roomType);
      }

      const { data, error } = await query.order('price_per_night', { ascending: true });
      if (error) throw error;

      setRooms(data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookRoom = (room: Room) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setSelectedRoom(room);
    setIsBookingModalOpen(true);
  };

  const getAmenityIcon = (amenity: string) => {
    if (amenity.toLowerCase().includes('wifi')) return <Wifi className="h-4 w-4" />;
    if (amenity.toLowerCase().includes('air')) return <Snowflake className="h-4 w-4" />;
    if (amenity.toLowerCase().includes('parking')) return <Car className="h-4 w-4" />;
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading available rooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8 animate-fade-in">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground mb-4 -ml-2 hover-scale"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Beranda
          </Button>

          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
              Kamar Tersedia
            </h1>
            {checkIn && checkOut && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm sm:text-base text-muted-foreground bg-card p-3 sm:p-4 rounded-lg border border-border">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="font-medium">
                    {new Date(checkIn).toLocaleDateString('id-ID', { 
                      day: 'numeric', 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </span>
                  <span>-</span>
                  <span className="font-medium">
                    {new Date(checkOut).toLocaleDateString('id-ID', { 
                      day: 'numeric', 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 sm:border-l sm:border-border sm:pl-4">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="font-medium">{guests} Tamu</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Rooms Grid */}
        {rooms.length === 0 ? (
          <div className="text-center py-12 sm:py-16 animate-fade-in">
            <div className="text-6xl sm:text-8xl mb-4 opacity-20">🏨</div>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">
              Tidak Ada Kamar Tersedia
            </h2>
            <p className="text-muted-foreground">
              Silakan coba tanggal atau kriteria lainnya.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {rooms.map((room, index) => (
              <Card
                key={room.id}
                className="group overflow-hidden shadow-elegant hover:shadow-xl transition-all duration-500 bg-gradient-card animate-fade-in hover-scale"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Room Image */}
                <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-primary/10 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center text-7xl sm:text-8xl opacity-20 group-hover:scale-110 transition-transform duration-700">
                    🏨
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-primary/90 text-primary-foreground backdrop-blur-sm">
                      <Users className="h-3 w-3 mr-1" />
                      {room.capacity} tamu
                    </Badge>
                  </div>
                </div>

                <CardHeader className="space-y-3 pb-3">
                  <div className="space-y-2">
                    <CardTitle className="text-lg sm:text-xl text-foreground group-hover:text-primary transition-colors">
                      {room.name}
                    </CardTitle>
                    <Badge variant="secondary" className="capitalize w-fit">
                      {room.type === 'standard' ? 'Standard Room' : 'Deluxe Room'}
                    </Badge>
                  </div>
                  <div className="flex items-baseline justify-between pt-2 border-t border-border">
                    <div>
                      <div className="text-2xl sm:text-3xl font-bold text-primary">
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        }).format(room.price_per_night)}
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground">per malam</div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-0">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {room.description}
                  </p>

                  {/* Amenities */}
                  {room.amenities && room.amenities.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-foreground uppercase tracking-wide">
                        Fasilitas:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {room.amenities.slice(0, 3).map((amenity, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-1.5 text-xs text-muted-foreground bg-primary/5 px-2.5 py-1.5 rounded-full border border-primary/10"
                          >
                            {getAmenityIcon(amenity)}
                            <span>{amenity}</span>
                          </div>
                        ))}
                        {room.amenities.length > 3 && (
                          <div className="flex items-center text-xs text-muted-foreground bg-primary/5 px-2.5 py-1.5 rounded-full border border-primary/10">
                            +{room.amenities.length - 3} lainnya
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <Button
                    onClick={() => handleBookRoom(room)}
                    className="w-full mt-2 group-hover:shadow-lg transition-all duration-300"
                    disabled={room.capacity < guests}
                  >
                    {room.capacity < guests ? 'Kapasitas Tidak Cukup' : 'Pesan Sekarang'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        room={selectedRoom}
        checkIn={checkIn}
        checkOut={checkOut}
        guests={guests}
      />
    </div>
  );
};

export default Rooms;
