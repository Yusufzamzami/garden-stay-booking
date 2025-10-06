import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wifi, Coffee, Car, Users, Bed, Bath } from "lucide-react";
import deluxeRoom from "@/assets/deluxe-room.jpg";
import suiteRoom from "@/assets/suite-room.jpg";
import gardenView from "@/assets/garden-view.jpg";

const rooms = [
  {
    id: 1,
    name: "Deluxe Garden Room",
    image: deluxeRoom,
    price: 250.000,
    capacity: 2,
    size: "10 m²",
    features: ["King Bed", "Garden View", "Free WiFi", "Mini Bar"],
    amenities: [
      { icon: Bed, label: "King Bed" },
      { icon: Wifi, label: "Free WiFi" },
      { icon: Coffee, label: "Mini Bar" },
      { icon: Bath, label: "Private Bath" }
    ],
    description: "Kamar elegan dengan pemandangan taman yang menakjubkan dan fasilitas modern."
  },
  {
    id: 2,
    name: "Garden Suite",
    image: suiteRoom,
    price: 300.000,
    capacity: 4,
    size: "15 m²",
    features: ["Living Area", "Balcony", "Garden View", "Premium Amenities"],
    amenities: [
      { icon: Bed, label: "King Bed" },
      { icon: Users, label: "Living Area" },
      { icon: Car, label: "Valet Parking" },
      { icon: Coffee, label: "Premium Bar" }
    ],
    description: "Suite yang luas dengan ruang tamu terpisah dan balkon pribadi."
  },
  {
    id: 3,
    name: "Presidential Suite",
    image: gardenView,
    price: 350.000,
    capacity: 3,
    size: "20 m²",
    features: ["2 Bedrooms", "Panoramic Views", "Butler Service", "Private Terrace"],
    amenities: [
      { icon: Bed, label: "2 Bedrooms" },
      { icon: Users, label: "Butler Service" },
      { icon: Car, label: "Private Parking" },
      { icon: Coffee, label: "Premium Lounge" }
    ],
    description: "Kemewahan terbaik dengan pemandangan taman yang indah dan layanan yang dipersonalisasi.."
  }
];

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 3,
    maximumFractionDigits: 3
  }).format(price);
};

const RoomShowcase = memo(() => {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
          Kemewahan <span className="text-primary">Akomodasi</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Pilih dari koleksi kamar dan suite kami yang dikurasi dengan cermat,
            masing-masing dirancang untuk memberikan kenyamanan dan keanggunan terbaik.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {rooms.map((room) => (
            <Card key={room.id} className="group overflow-hidden shadow-elegant hover:shadow-xl transition-all duration-500 bg-gradient-card">
              <div className="relative overflow-hidden">
                <img 
                  src={room.image} 
                  alt={room.name}
                  loading="lazy"
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary" className="bg-white/90 text-foreground">
                    {room.size}
                  </Badge>
                </div>
                <div className="absolute top-4 right-4">
                  <Badge className="bg-primary text-primary-foreground">
                    <Users className="h-3 w-3 mr-1" />
                    {room.capacity} guests
                  </Badge>
                </div>
              </div>

              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-foreground mb-2">{room.name}</h3>
                  <p className="text-muted-foreground mb-3">{room.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-primary">
                      {formatPrice(room.price)}
                    </span>
                    <span className="text-sm text-muted-foreground">per night</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  {room.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <amenity.icon className="h-4 w-4 text-primary" />
                      {amenity.label}
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-3">
                  <Button variant="default" className="w-full">
                    Book Now
                  </Button>
                  <Button variant="outline" className="w-full">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="gold" size="lg" className="px-8">
            View All Rooms
          </Button>
        </div>
      </div>
    </section>
  );
});

RoomShowcase.displayName = 'RoomShowcase';

export default RoomShowcase;