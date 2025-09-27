import { Button } from "@/components/ui/button";
import { Search, Calendar, Users } from "lucide-react";
import heroImage from "@/assets/hero-room.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Luxury hotel room at The Garden Residence"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            The Garden
            <span className="block bg-gradient-to-r from-primary to-gold bg-clip-text text-transparent">
              Residence
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
            Experience luxury and tranquility in our garden paradise. 
            Where elegance meets nature's embrace.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button variant="hero" size="lg" className="text-lg px-8 py-4">
              <Search className="mr-2 h-5 w-5" />
              Book Your Stay
            </Button>
            <Button variant="elegant" size="lg" className="text-lg px-8 py-4">
              <Calendar className="mr-2 h-5 w-5" />
              View Rooms
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="flex justify-center space-x-8 text-white/80">
            <div className="text-center">
              <div className="text-2xl font-bold text-gold">50+</div>
              <div className="text-sm">Luxury Rooms</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gold">24/7</div>
              <div className="text-sm">Concierge</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gold">5★</div>
              <div className="text-sm">Service</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-bounce"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;