import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { Github, Linkedin } from "lucide-react";
import heroImage from "../assets/profile-image.png";

export default function Hero() {
  useScrollAnimation();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section 
      id="inicio" 
      className="min-h-screen flex items-center justify-center hero-gradient pt-16"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center fade-in">
          <div className="mb-8">
            <div className="w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-primary-pink shadow-lg">
              <img 
                src={heroImage} 
                alt="Rafaela Botelho - Desenvolvedora Full Stack" 
                className="w-full h-full object-cover" 
              />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-dark-gray mb-4">
            Olá, eu sou <span className="text-primary-pink">Rafaela</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 font-light">
            Desenvolvedora Full Stack em formação
          </p>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed">
            Estudante de Análise e Desenvolvimento de Sistemas, apaixonada por criar soluções digitais inovadoras
            e explorar o mundo da programação.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => scrollToSection("projetos")}
              className="bg-primary-pink text-white px-8 py-4 rounded-full font-semibold hover:bg-pink-500 transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
              Ver meus projetos
            </button>
            <button
              onClick={() => scrollToSection("contato")}
              className="border-2 border-primary-pink text-primary-pink px-8 py-4 rounded-full font-semibold hover:bg-primary-pink hover:text-white transition-all duration-300"
            >
              Entre em contato
            </button>
          </div>
          
          {/* Social Links */}
          <div className="flex justify-center space-x-6 mt-12">
            <a
              href="https://github.com/bruxa61"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-primary-pink transition-colors text-2xl"
            >
              <Github size={32} />
            </a>
            <a
              href="https://www.linkedin.com/in/rafaela-botelho-76a4a72b0/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-primary-pink transition-colors text-2xl"
            >
              <Linkedin size={32} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
