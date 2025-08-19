import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Projects from "@/components/Projects";
import Contact from "@/components/Contact";
import Admin from "@/components/Admin";
import Footer from "@/components/Footer";

export default function Home() {
  const { isAdmin } = useAuth();
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <About />
      <Skills />
      <Projects />
      <Contact />
      {isAdmin && <Admin />}
      <Footer />
    </div>
  );
}
