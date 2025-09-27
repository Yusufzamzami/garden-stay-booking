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
    title: "Fine Dining Restaurant",
    description: "Experience culinary excellence with our award-winning chef's seasonal menu featuring local and international cuisine."
  },
  {
    icon: Dumbbell,
    title: "Fitness Center",
    description: "State-of-the-art gym equipment and personal training services available 24/7 for our guests."
  },
  {
    icon: Waves,
    title: "Infinity Pool",
    description: "Relax in our stunning infinity pool with panoramic garden views and poolside service."
  },
  {
    icon: Flower,
    title: "Garden Spa",
    description: "Rejuvenate your senses with our luxury spa treatments in a serene garden setting."
  },
  {
    icon: Car,
    title: "Valet Parking",
    description: "Complimentary valet parking service for all guests with 24-hour vehicle security."
  },
  {
    icon: Wifi,
    title: "High-Speed WiFi",
    description: "Stay connected with complimentary high-speed internet access throughout the property."
  },
  {
    icon: Coffee,
    title: "24/7 Room Service",
    description: "Enjoy gourmet meals and beverages delivered to your room at any time of day."
  },
  {
    icon: ShieldCheck,
    title: "Concierge Service",
    description: "Our dedicated concierge team is available to assist with any requests or arrangements."
  },
  {
    icon: Sparkles,
    title: "Event Spaces",
    description: "Elegant venues for weddings, conferences, and special events with full planning services."
  },
  {
    icon: Users,
    title: "Business Center",
    description: "Fully equipped business center with meeting rooms and conference facilities."
  },
  {
    icon: Clock,
    title: "24-Hour Front Desk",
    description: "Round-the-clock assistance from our professional and friendly front desk staff."
  },
  {
    icon: MapPin,
    title: "Tour Services",
    description: "Discover local attractions with our curated tour packages and travel arrangements."
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
            Discover an array of premium amenities and services designed to make 
            your stay unforgettable. Every detail crafted for your comfort and pleasure.
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