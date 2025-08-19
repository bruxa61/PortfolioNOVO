import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { Github, Linkedin } from "lucide-react";
import heroImage from "@assets/Group 37 (2)_1755624497433.png";

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
            <div className="relative mx-auto w-64 h-80 mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-pink/20 to-purple-200/20 rounded-2xl blur-xl transform rotate-3"></div>
              <div className="relative bg-white rounded-2xl p-2 shadow-2xl transform -rotate-1 hover:rotate-0 transition-transform duration-500">
                <img 
                  src={heroImage} 
                  alt="Rafaela Botelho - Desenvolvedora Full Stack" 
                  className="w-full h-full object-cover rounded-xl shadow-lg" 
                />
              </div>
              <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-primary-pink/10 rounded-full blur-md"></div>
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-purple-300/20 rounded-full blur-sm"></div>
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
