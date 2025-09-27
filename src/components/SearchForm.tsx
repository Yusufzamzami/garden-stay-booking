import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, MapPin, Search } from "lucide-react";

const SearchForm = () => {
  const [searchData, setSearchData] = useState({
    checkIn: "",
    checkOut: "",
    guests: "2",
    roomType: ""
  });

  const handleSearch = () => {
    console.log("Search data:", searchData);
    // Here you would typically handle the search logic
  };

  return (
    <section className="py-16 bg-gradient-to-b from-background to-primary-soft/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Find Your Perfect Room
          </h2>
          <p className="text-lg text-muted-foreground">
            Search for available rooms and enjoy luxury at its finest
          </p>
        </div>

        <Card className="max-w-4xl mx-auto shadow-elegant">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="space-y-2">
                <Label htmlFor="checkin" className="flex items-center gap-2 text-foreground font-medium">
                  <Calendar className="h-4 w-4 text-primary" />
                  Check-in Date
                </Label>
                <Input
                  id="checkin"
                  type="date"
                  value={searchData.checkIn}
                  onChange={(e) => setSearchData({...searchData, checkIn: e.target.value})}
                  className="border-primary/20 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkout" className="flex items-center gap-2 text-foreground font-medium">
                  <Calendar className="h-4 w-4 text-primary" />
                  Check-out Date
                </Label>
                <Input
                  id="checkout"
                  type="date"
                  value={searchData.checkOut}
                  onChange={(e) => setSearchData({...searchData, checkOut: e.target.value})}
                  className="border-primary/20 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="guests" className="flex items-center gap-2 text-foreground font-medium">
                  <Users className="h-4 w-4 text-primary" />
                  Guests
                </Label>
                <Select value={searchData.guests} onValueChange={(value) => setSearchData({...searchData, guests: value})}>
                  <SelectTrigger className="border-primary/20 focus:border-primary">
                    <SelectValue placeholder="Select guests" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Guest</SelectItem>
                    <SelectItem value="2">2 Guests</SelectItem>
                    <SelectItem value="3">3 Guests</SelectItem>
                    <SelectItem value="4">4 Guests</SelectItem>
                    <SelectItem value="5">5+ Guests</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="roomtype" className="flex items-center gap-2 text-foreground font-medium">
                  <MapPin className="h-4 w-4 text-primary" />
                  Room Type
                </Label>
                <Select value={searchData.roomType} onValueChange={(value) => setSearchData({...searchData, roomType: value})}>
                  <SelectTrigger className="border-primary/20 focus:border-primary">
                    <SelectValue placeholder="Any room type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard Room</SelectItem>
                    <SelectItem value="deluxe">Deluxe Room</SelectItem>
                    <SelectItem value="suite">Garden Suite</SelectItem>
                    <SelectItem value="presidential">Presidential Suite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-center">
              <Button 
                variant="hero" 
                size="lg" 
                onClick={handleSearch}
                className="px-12 py-4 text-lg"
              >
                <Search className="mr-2 h-5 w-5" />
                Search Available Rooms
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default SearchForm;