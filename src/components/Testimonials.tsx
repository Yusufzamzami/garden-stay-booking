import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    location: "Jakarta, Indonesia",
    rating: 5,
    review: "Absolutely stunning property! The Garden Residence exceeded all my expectations. The room was immaculate, the service impeccable, and the garden views were breathtaking. Will definitely return!",
    date: "March 2024"
  },
  {
    id: 2,
    name: "Michael Chen",
    location: "Singapore",
    rating: 5,
    review: "One of the best hotel experiences I've ever had. The attention to detail is remarkable, from the elegant room design to the exceptional spa services. The staff made us feel like royalty.",
    date: "February 2024"
  },
  {
    id: 3,
    name: "Emma Rodriguez",
    location: "Manila, Philippines",
    rating: 5,
    review: "Perfect for our anniversary celebration! The romantic atmosphere, delicious cuisine, and luxurious amenities made our stay unforgettable. The concierge team went above and beyond.",
    date: "January 2024"
  },
  {
    id: 4,
    name: "David Kim",
    location: "Seoul, South Korea",
    rating: 5,
    review: "Business trip turned into a relaxing retreat. The business center facilities were excellent, and after meetings, the pool and spa were perfect for unwinding. Highly recommended!",
    date: "March 2024"
  },
  {
    id: 5,
    name: "Lisa Thompson",
    location: "Sydney, Australia",
    rating: 5,
    review: "The Garden Residence is a hidden gem! The peaceful garden setting combined with modern luxury creates the perfect escape. The restaurant's cuisine was absolutely divine.",
    date: "February 2024"
  },
  {
    id: 6,
    name: "Carlos Mendoza",
    location: "Mexico City, Mexico",
    rating: 5,
    review: "Exceptional hospitality and stunning accommodations. Every moment of our stay was perfect, from the welcome drinks to the farewell gift. This place truly understands luxury.",
    date: "January 2024"
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
            What Our <span className="text-primary">Guests Say</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Read authentic reviews from our valued guests who have experienced 
            the luxury and hospitality that defines The Garden Residence.
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
              Based on <span className="font-semibold text-foreground">500+</span> reviews
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;