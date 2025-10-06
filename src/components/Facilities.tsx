import { Card, CardContent } from "@/components/ui/card";
import { 
  Utensils, 
  Dumbbell, 
  Waves, 
  Flower, 
  Car, 
  Wifi, 
  Coffee, 
  ShieldCheck,
  Sparkles,
  Users,
  Clock,
  MapPin
} from "lucide-react";

const facilities = [
  {
    icon: Utensils,
    title: "Fine Dining Restauarant",
    description: "Nikmati pengalaman kuliner terbaik dengan menu musiman koki pemenang penghargaan kami yang menyajikan masakan lokal dan internasional."
  },
  {
    icon: Dumbbell,
    title: "Fitness Center",
    description: "Peralatan olahraga canggih dan layanan pelatihan pribadi tersedia 24/7 untuk tamu kami."
  },
  {
    icon: Waves,
    title: "Infinity Pool",
    description: "Bersantailah di kolam renang infinity kami yang menakjubkan dengan pemandangan taman yang indah dan layanan di tepi kolam renang."
  },
  {
    icon: Flower,
    title: "Garden Spa",
    description: "Segarkan indra Anda dengan perawatan spa mewah kami di taman yang tenang."
  },
  {
    icon: Car,
    title: "Valet Parking",
    description: "Layanan valet parkir gratis untuk semua tamu dengan keamanan kendaraan 24 jam."
  },
  {
    icon: Wifi,
    title: "High-Speed WiFi",
    description: "Tetap terhubung dengan akses internet berkecepatan tinggi gratis di seluruh properti."
  },
  {
    icon: Coffee,
    title: "24/7 Room Service",
    description: "Nikmati hidangan dan minuman lezat yang diantar ke kamar Anda kapan saja sepanjang hari.."
  },
  {
    icon: ShieldCheck,
    title: "Concierge Service",
    description: "Tim concierge kami yang berdedikasi siap membantu segala permintaan atau pengaturan Anda."
  },
  {
    icon: Sparkles,
    title: "Event Spaces",
    description: "Tempat elegan untuk pernikahan, konferensi, dan acara khusus dengan layanan perencanaan lengkap."
  },
  {
    icon: Users,
    title: "Business Center",
    description: "Pusat bisnis yang lengkap dengan ruang pertemuan dan fasilitas konferensi."
  },
  {
    icon: Clock,
    title: "24-Hour Front Desk",
    description: "Bantuan sepanjang waktu dari staf meja depan kami yang profesional dan ramah."
  },
  {
    icon: MapPin,
    title: "Tour Services",
    description: "Temukan atraksi lokal dengan paket wisata dan pengaturan perjalanan pilihan kami."
  }
];

const Facilities = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-secondary/30 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            World-Class <span className="text-primary">Facilities</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Temukan beragam fasilitas dan layanan premium yang dirancang untuk menjadikan masa menginap Anda tak terlupakan. 
            Setiap detail dirancang untuk kenyamanan dan kesenangan Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {facilities.map((facility, index) => (
            <Card 
              key={index} 
              className="group h-full bg-gradient-card hover:shadow-elegant hover:-translate-y-1 transition-all duration-300 border-primary/10"
            >
              <CardContent className="p-8 h-full flex flex-col">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                    <facility.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                  {facility.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed flex-grow">
                  {facility.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gold-soft rounded-full">
            <Sparkles className="h-5 w-5 text-gold" />
            <span className="text-gold-foreground font-medium">
              All facilities included with your stay
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Facilities;