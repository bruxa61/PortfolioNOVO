import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { Mail, Linkedin, Github, MessageCircle, Briefcase } from "lucide-react";
import avatarImage from "@assets/bottons (3)_1755631449256.png";

export default function Contact() {
  useScrollAnimation();

  return (
    <section id="contato" className="py-20 bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-dark-gray mb-4">Vamos conversar?</h2>
          <div className="w-24 h-1 bg-primary-pink mx-auto rounded-full"></div>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Estou sempre aberta a novas oportunidades e projetos interessantes. 
            Entre em contato comigo através do email abaixo!
          </p>
        </div>
        
        <div className="max-w-2xl mx-auto">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 fade-in">
            <div className="flex flex-col items-center text-center space-y-6">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-primary-pink/20">
                <img 
                  src={avatarImage} 
                  alt="Rafaela Botelho" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Info */}
              <div>
                <h3 className="text-2xl font-bold text-dark-gray mb-2">Rafaela Botelho</h3>
                <p className="text-gray-600 mb-6">Desenvolvedor Full Stack</p>
              </div>
              
              {/* Contact Info */}
              <div className="w-full space-y-4">
                <a
                  href="mailto:rafaelaolbo@gmail.com"
                  className="flex items-center justify-center space-x-3 w-full py-4 px-6 bg-gradient-to-r from-primary-pink to-pink-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  <Mail className="h-5 w-5" />
                  <span className="font-medium">rafaelaolbo@gmail.com</span>
                </a>
              </div>
              
              {/* Social Links */}
              <div className="flex space-x-4 pt-4">
                <a
                  href="https://linkedin.com/in/rafaela-botelho"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-colors duration-300"
                  title="LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a
                  href="https://github.com/rafaela-botelho"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-300"
                  title="GitHub"
                >
                  <Github className="h-5 w-5" />
                </a>
              </div>
              
              {/* Call to Action */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 w-full">
                <div className="flex items-center justify-center space-x-2 text-gray-600 mb-2">
                  <MessageCircle className="h-5 w-5 text-primary-pink" />
                  <span className="font-medium">Pronto para trabalhar juntos?</span>
                </div>
                <p className="text-sm text-gray-500 text-center">
                  Envie um email descrevendo seu projeto e vamos conversar!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
