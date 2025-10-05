import { Button } from "@/components/ui/button";
import { Search, Calendar, Users, User, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-room.jpg";

const Hero = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
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

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-4 sm:p-6 lg:p-8 gap-2">
        <h2 className="text-base sm:text-xl lg:text-3xl font-bold text-white truncate flex-shrink min-w-0">
          The Garden Residence
        </h2>
        <nav className="flex gap-2 sm:gap-3 flex-shrink-0">
          {user ? (
            <>
              <Button 
                variant="hero" 
                size="sm" 
                className="text-xs sm:text-sm lg:text-base px-2 sm:px-4 lg:px-8 h-8 sm:h-10 lg:h-11" 
                onClick={() => navigate('/dashboard')}
              >
                <Settings className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 sm:mr-2" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
              <Button 
                variant="hero" 
                size="sm" 
                className="text-xs sm:text-sm lg:text-base px-2 sm:px-4 lg:px-8 h-8 sm:h-10 lg:h-11" 
                onClick={signOut}
              >
                <span className="hidden sm:inline">Sign Out</span>
                <span className="sm:hidden">Out</span>
              </Button>
            </>
          ) : (
            <Button 
              variant="hero" 
              size="sm" 
              className="text-xs sm:text-sm lg:text-base px-3 sm:px-6 lg:px-8 h-8 sm:h-10 lg:h-11" 
              onClick={() => navigate('/auth')}
            >
              <User className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 sm:mr-2" />
              <span className="hidden sm:inline">Sign In</span>
            </Button>
          )}
        </nav>
      </header>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight animate-fade-in">
            The Garden
            <span className="block bg-gradient-to-r from-primary to-gold bg-clip-text text-transparent mt-1 sm:mt-2">
              Residence
            </span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-6 sm:mb-8 leading-relaxed px-2 sm:px-0 animate-fade-in">
            Experience luxury and tranquility in our garden paradise. 
            Where elegance meets nature's embrace.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 px-4 sm:px-0">
            <Button 
              variant="hero" 
              size="lg" 
              className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto hover-scale"
            >
              <Search className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Book Your Stay
            </Button>
            <Button 
              variant="elegant" 
              size="lg" 
              className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto hover-scale"
            >
              <Calendar className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              View Rooms
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-md sm:max-w-none mx-auto px-2 text-white/80">
            <div className="text-center transform transition-transform hover:scale-110">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gold mb-1">50+</div>
              <div className="text-xs sm:text-sm md:text-base">Luxury Rooms</div>
            </div>
            <div className="text-center transform transition-transform hover:scale-110">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gold mb-1">24/7</div>
              <div className="text-xs sm:text-sm md:text-base">Concierge</div>
            </div>
            <div className="text-center transform transition-transform hover:scale-110">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gold mb-1">5★</div>
              <div className="text-xs sm:text-sm md:text-base">Service</div>
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