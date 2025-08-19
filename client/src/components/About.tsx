import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { GraduationCap, Code, Download } from "lucide-react";

export default function About() {
  useScrollAnimation();

  return (
    <section id="sobre" className="py-20 bg-light-gray">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-dark-gray mb-4">Sobre mim</h2>
          <div className="w-24 h-1 bg-primary-pink mx-auto rounded-full"></div>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="fade-in">
            <div className="space-y-6">
              <p className="text-lg text-gray-600 leading-relaxed">
                Apaixonada por tecnologia e formada em Análise e Desenvolvimento de Sistemas pelo SENAI "Morvan Figueiredo", busco constantemente aprimorar minhas habilidades na área. Meu portfólio demonstra como realizo a união entre a lógica da programação com a criatividade do design, resultando em projetos visualmente atraentes e com foco em conversão. Tenho um forte interesse por front-end e design, o que me permite criar peças eficazes e com ótima experiência para o usuário.
              </p>
              
              {/* CV Button */}
              <div className="text-center mb-8">
                <a
                  href="https://drive.google.com/drive/folders/1ILBWKdl1zsjZ0jmk7LkG6MFQXvip7ns4"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 bg-primary-pink text-white px-6 py-3 rounded-full font-semibold hover:bg-pink-500 transition-colors"
                >
                  <Download size={20} />
                  <span>Acessar Currículo Virtual</span>
                </a>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 mt-8">
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                  <GraduationCap className="text-primary-pink text-3xl mb-3 mx-auto" />
                  <h4 className="font-semibold text-dark-gray mb-2">Formação</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Desenvolvimento de Sistemas (Curso Técnico)</strong><br/>SENAI</p>
                    <p><strong>Desenvolvimento de Software (Superior)</strong><br/>FATEC</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                  <Code className="text-primary-pink text-3xl mb-3 mx-auto" />
                  <h4 className="font-semibold text-dark-gray mb-2">Especialização</h4>
                  <p className="text-sm text-gray-600">Front-End & Design<br/>Full Stack Development</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
