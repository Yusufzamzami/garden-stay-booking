import Hero from "@/components/Hero";
import SearchForm from "@/components/SearchForm";
import RoomShowcase from "@/components/RoomShowcase";
import Facilities from "@/components/Facilities";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <SearchForm />
      <RoomShowcase />
      <Facilities />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Index;
