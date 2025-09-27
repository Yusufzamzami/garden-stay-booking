-- Create rooms table
CREATE TABLE public.rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  price_per_night DECIMAL(10,2) NOT NULL,
  capacity INTEGER NOT NULL,
  amenities TEXT[],
  images TEXT[],
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  room_id UUID NOT NULL REFERENCES public.rooms(id),
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT NOT NULL,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  guests_count INTEGER NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  booking_status TEXT NOT NULL DEFAULT 'confirmed',
  special_requests TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Rooms policies (public read, admin write)
CREATE POLICY "Anyone can view available rooms" 
ON public.rooms 
FOR SELECT 
USING (is_available = true);

CREATE POLICY "Authenticated users can view all rooms" 
ON public.rooms 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage rooms" 
ON public.rooms 
FOR ALL 
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Bookings policies
CREATE POLICY "Users can view their own bookings" 
ON public.bookings 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookings" 
ON public.bookings 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can manage all bookings" 
ON public.bookings 
FOR ALL 
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Add update trigger for rooms
CREATE TRIGGER update_rooms_updated_at
BEFORE UPDATE ON public.rooms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add update trigger for bookings
CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample rooms data
INSERT INTO public.rooms (name, type, description, price_per_night, capacity, amenities, images) VALUES
('Garden View Standard', 'standard', 'Comfortable room with beautiful garden views and modern amenities', 150.00, 2, ARRAY['Free WiFi', 'Air Conditioning', 'Mini Fridge', 'Garden View'], ARRAY['/api/placeholder/400/300']),
('Deluxe Garden Suite', 'deluxe', 'Spacious deluxe room with premium furnishing and garden access', 280.00, 3, ARRAY['Free WiFi', 'Air Conditioning', 'Mini Bar', 'Garden Access', 'Balcony'], ARRAY['/api/placeholder/400/300']),
('Premium Garden Suite', 'suite', 'Luxurious suite with separate living area and private garden terrace', 450.00, 4, ARRAY['Free WiFi', 'Air Conditioning', 'Mini Bar', 'Living Area', 'Private Terrace', 'Garden View'], ARRAY['/api/placeholder/400/300']),
('Presidential Garden Villa', 'presidential', 'Ultimate luxury villa with private garden and exclusive amenities', 800.00, 6, ARRAY['Free WiFi', 'Air Conditioning', 'Full Kitchen', 'Private Garden', 'Jacuzzi', 'Butler Service'], ARRAY['/api/placeholder/400/300']);