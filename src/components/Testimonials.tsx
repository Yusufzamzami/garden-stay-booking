import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    location: "Jakarta, Indonesia",
    rating: 5,
    review: "Properti yang benar-benar menakjubkan! The Garden Residence melampaui semua harapan saya. Kamarnya sangat bersih, pelayanannya sempurna, dan pemandangan tamannya sungguh memukau. Saya pasti akan kembali lagi!",
    date: "Maret 2024"
  },
  {
    id: 2,
    name: "Michael Chen",
    location: "Bali, Indonesia",
    rating: 5,
    review: "Salah satu pengalaman menginap terbaik yang pernah saya rasakan. Perhatian terhadap detailnya luar biasa, mulai dari desain kamar yang elegan hingga layanan spa yang istimewa. Stafnya membuat kami merasa seperti bangsawan.",
    date: "Februari 2024"
  },
  {
    id: 3,
    name: "Emma Rodriguez",
    location: "Jakarta, Indonesia",
    rating: 5,
    review: "Sempurna untuk perayaan hari jadi kami! Suasana romantis, hidangan yang lezat, dan fasilitas mewah membuat masa menginap kami tak terlupakan. Tim concierge benar-benar memberikan pelayanan yang luar biasa.",
    date: "Januari 2024"
  },
  {
    id: 4,
    name: "David Kim",
    location: "Bandung, Indonesia",
    rating: 5,
    review: "Perjalanan bisnis berubah menjadi liburan yang menenangkan. Fasilitas pusat bisnisnya sangat baik, dan setelah rapat, kolam renang serta spa menjadi tempat sempurna untuk bersantai. Sangat direkomendasikan!",
    date: "Maret 2024"
  },
  {
    id: 5,
    name: "Lisa Thompson",
    location: "Bandung, Indonesia",
    rating: 5,
    review: "The Garden Residence adalah permata tersembunyi! Suasana taman yang tenang dipadukan dengan kemewahan modern menciptakan tempat pelarian yang sempurna. Hidangan di restorannya benar-benar luar biasa.",
    date: "Februari 2024"
  },
  {
    id: 6,
    name: "Carlos Mendoza",
    location: "Jakarta, Indonesia",
    rating: 5,
    review: "Keramahan yang luar biasa dan akomodasi yang memukau. Setiap momen selama kami menginap terasa sempurna, mulai dari minuman sambutan hingga hadiah perpisahan. Tempat ini benar-benar memahami arti kemewahan.",
    date: "Januari 2024"
  }
];

const Testimonials = () => {
  const renderStars = (rating: number) => {
    return Array.from({ length: rating }, (_, index) => (
      <Star key={index} className="h-4 w-4 fill-gold text-gold" />
    ));
  };

  return (
    <section className="py-20 bg-gradient-to-b from-background to-primary-soft/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Apa Kata <span className="text-primary">Tamu Kami</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Baca ulasan asli dari para tamu kami yang telah merasakan kemewahan dan keramahtamahan yang menjadi ciri khas The Garden Residence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card 
              key={testimonial.id} 
              className="group bg-gradient-card hover:shadow-elegant hover:-translate-y-1 transition-all duration-300 border-primary/10"
            >
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-1">
                    {renderStars(testimonial.rating)}
                  </div>
                  <Quote className="h-6 w-6 text-primary/30" />
                </div>

                <p className="text-muted-foreground leading-relaxed mb-6 italic">
                  "{testimonial.review}"
                </p>

                <div className="border-t border-border pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-primary font-medium">
                        {testimonial.date}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-6 px-8 py-4 bg-white/80 backdrop-blur rounded-full shadow-elegant">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {renderStars(5)}
              </div>
              <span className="font-bold text-foreground">4.9/5</span>
            </div>
            <div className="w-px h-6 bg-border"></div>
            <div className="text-muted-foreground">
              Berdasarkan <span className="font-semibold text-foreground">500+</span> reviews
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;