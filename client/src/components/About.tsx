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
              <p className="text-lg text-gray-600 leading-relaxed text-justify">
                Apaixonada por tecnologia e formada em Análise e Desenvolvimento de Sistemas pelo SENAI "Morvan Figueiredo", atualmente cursando <strong className="text-primary-pink">Desenvolvimento de Software Multiplataforma na FATEC</strong>, busco constantemente aprimorar minhas habilidades na área. Meu portfólio demonstra como realizo a união entre a lógica da programação com a criatividade do design, resultando em projetos visualmente atraentes e com foco em conversão. Tenho um <strong className="text-primary-pink">forte interesse por front-end e design</strong>, o que me permite criar peças eficazes e com ótima experiência para o usuário.
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
                  <h4 className="font-semibold text-dark-gray mb-3">Formação</h4>
                  <div className="text-sm text-gray-600 space-y-3">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="font-semibold text-dark-gray">Técnico em Desenvolvimento de Sistemas</p>
                      <p className="text-primary-pink font-medium">SENAI "Morvan Figueiredo"</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="font-semibold text-dark-gray">Desenvolvimento de Software Multiplataforma</p>
                      <p className="text-primary-pink font-medium">FATEC - Em andamento</p>
                    </div>
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
