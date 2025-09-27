import { Button } from "@/components/ui/button";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Instagram, 
  Twitter,
  Linkedin,
  Clock,
  Star
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-primary to-primary/90 text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Hotel Info */}
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">The Garden Residence</h3>
                <p className="text-primary-foreground/80 leading-relaxed">
                  Experience luxury and tranquility in our garden paradise. 
                  Where elegance meets nature's embrace.
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                  ))}
                </div>
                <span className="text-sm text-primary-foreground/80">
                  4.9/5 Rating
                </span>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold mb-4">Contact Information</h4>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gold mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-primary-foreground/90">
                      Jl. Garden Paradise No. 123<br />
                      Menteng, Jakarta Pusat 10310<br />
                      Indonesia
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gold flex-shrink-0" />
                  <div>
                    <p className="text-primary-foreground/90">+62 21 1234 5678</p>
                    <p className="text-sm text-primary-foreground/70">24/7 Reception</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gold flex-shrink-0" />
                  <div>
                    <p className="text-primary-foreground/90">info@gardenresidence.com</p>
                    <p className="text-sm text-primary-foreground/70">reservations@gardenresidence.com</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              
              <div className="space-y-2">
                {[
                  "Rooms & Suites",
                  "Facilities",
                  "Dining",
                  "Spa & Wellness",
                  "Events & Meetings",
                  "Special Offers",
                  "Gallery",
                  "About Us"
                ].map((link) => (
                  <a 
                    key={link} 
                    href="#" 
                    className="block text-primary-foreground/80 hover:text-gold hover:translate-x-1 transition-all duration-200"
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>

            {/* Operating Hours & Social */}
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gold" />
                  Operating Hours
                </h4>
                <div className="space-y-2 text-primary-foreground/80">
                  <div className="flex justify-between">
                    <span>Check-in:</span>
                    <span>15:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Check-out:</span>
                    <span>12:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reception:</span>
                    <span>24/7</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Restaurant:</span>
                    <span>06:00 - 23:00</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
                <div className="flex gap-3">
                  {[
                    { icon: Facebook, label: "Facebook" },
                    { icon: Instagram, label: "Instagram" },
                    { icon: Twitter, label: "Twitter" },
                    { icon: Linkedin, label: "LinkedIn" }
                  ].map((social) => (
                    <Button
                      key={social.label}
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 bg-white/10 hover:bg-gold hover:text-primary transition-all duration-300"
                      aria-label={social.label}
                    >
                      <social.icon className="h-5 w-5" />
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-6 border-t border-primary-foreground/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-primary-foreground/80">
                © 2024 The Garden Residence. All rights reserved.
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              {[
                "Privacy Policy",
                "Terms of Service", 
                "Cookie Policy",
                "Accessibility"
              ].map((link) => (
                <a 
                  key={link}
                  href="#" 
                  className="text-primary-foreground/80 hover:text-gold transition-colors duration-200"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;