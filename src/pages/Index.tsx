import Hero from "@/components/Hero";
import SearchForm from "@/components/SearchForm";
import RoomShowcase from "@/components/RoomShowcase";
import Facilities from "@/components/Facilities";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Hero />
      <section aria-label="Search and booking">
        <SearchForm />
      </section>
      <section aria-label="Room showcase">
        <RoomShowcase />
      </section>
      <section aria-label="Hotel facilities">
        <Facilities />
      </section>
      <section aria-label="Guest testimonials">
        <Testimonials />
      </section>
      <Footer />
    </main>
  );
};

export default Index;
