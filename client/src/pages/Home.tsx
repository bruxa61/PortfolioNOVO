import { useAuth } from "@/hooks/use-auth";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Projects from "@/components/Projects";
import Achievements from "@/components/Achievements";
import Contact from "@/components/Contact";
import Admin from "@/components/AdminNew";
import Footer from "@/components/Footer";

export default function Home() {
  const { user } = useAuth();
  const isAdmin = user?.isAdmin || false;
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <About />
      <Skills />
      <Projects />
      <Achievements />
      <Contact />
      {isAdmin && <Admin />}
      <Footer />
    </div>
  );
}
