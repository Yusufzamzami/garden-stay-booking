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
      <section aria-label="Pencarian dan Pemesanan">
        <SearchForm />
      </section>
      <section aria-label="Tampilan Kamar Hotel">
        <RoomShowcase />
      </section>
      <section aria-label="Fasilitas Hotel">
        <Facilities />
      </section>
      <section aria-label="Testimoni Tamu">
        <Testimonials />
      </section>
      <Footer />
    </main>
  );
};

export default Index;
