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
      let query = supabase.from('rooms').select('*').eq('is_available', true);

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
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>

          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">Available Rooms</h1>
            {checkIn && checkOut && (
              <p className="text-muted-foreground mt-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(checkIn).toLocaleDateString()} - {new Date(checkOut).toLocaleDateString()}
                <Users className="h-4 w-4 ml-4" />
                {guests} {guests === 1 ? 'Guest' : 'Guests'}
              </p>
            )}
          </div>
        </div>

        {rooms.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-foreground mb-2">No rooms available</h2>
            <p className="text-muted-foreground">Please try different dates or criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <Card
                key={room.id}
                className="overflow-hidden shadow-elegant hover:shadow-lg transition-shadow"
              >
                <div className="aspect-video bg-gradient-to-br from-primary-soft/20 to-primary-soft/10 flex items-center justify-center">
                  <div className="text-6xl opacity-20">🏨</div>
                </div>

                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl text-foreground">{room.name}</CardTitle>
                      <CardDescription className="mt-1">
                        <Badge variant="secondary" className="capitalize">
                          {room.type}
                        </Badge>
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 0,
                        }).format(room.price_per_night)}
                      </div>
                      <div className="text-sm text-muted-foreground">per night</div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-muted-foreground mb-4 line-clamp-2">{room.description}</p>

                  <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>Up to {room.capacity} guests</span>
                  </div>

                  <div className="space-y-2 mb-6">
                    <p className="text-sm font-medium text-foreground">Amenities:</p>
                    <div className="flex flex-wrap gap-2">
                      {room.amenities?.slice(0, 3).map((amenity, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1 text-xs text-muted-foreground bg-primary-soft/10 px-2 py-1 rounded-full"
                        >
                          {getAmenityIcon(amenity)}
                          <span>{amenity}</span>
                        </div>
                      ))}
                      {room.amenities?.length! > 3 && (
                        <div className="text-xs text-muted-foreground bg-primary-soft/10 px-2 py-1 rounded-full">
                          +{room.amenities!.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={() => handleBookRoom(room)}
                    className="w-full"
                    disabled={room.capacity < guests}
                  >
                    {room.capacity < guests ? 'Insufficient Capacity' : 'Book Now'}
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
