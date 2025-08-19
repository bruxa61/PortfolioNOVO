import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { GraduationCap, Code } from "lucide-react";

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
                Minha jornada na programação começou com a curiosidade de entender como as coisas funcionam por trás das telas. 
                Atualmente estou cursando <strong className="text-primary-pink">Análise e Desenvolvimento de Sistemas</strong> 
                no Senai e FATEC, onde tenho a oportunidade de aprofundar meus conhecimentos técnicos.
              </p>
              
              <p className="text-lg text-gray-600 leading-relaxed">
                Meu interesse se estende desde o desenvolvimento full stack até projetos mais criativos como 
                <strong className="text-primary-pink"> pixel art games</strong> e aplicações web interativas. 
                Acredito que a tecnologia pode ser uma ferramenta poderosa para criar experiências únicas e significativas.
              </p>
              
              <p className="text-lg text-gray-600 leading-relaxed">
                Sempre busco aprender novas tecnologias e metodologias que possam agregar valor aos projetos em que trabalho. 
                Tenho especial interesse em interfaces intuitivas, experiência do usuário e soluções que fazem a diferença na vida das pessoas.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                  <GraduationCap className="text-primary-pink text-3xl mb-3 mx-auto" />
                  <h4 className="font-semibold text-dark-gray mb-2">Formação</h4>
                  <p className="text-sm text-gray-600">ADS - Senai & FATEC</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                  <Code className="text-primary-pink text-3xl mb-3 mx-auto" />
                  <h4 className="font-semibold text-dark-gray mb-2">Especialização</h4>
                  <p className="text-sm text-gray-600">Full Stack Development</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-primary-pink/20 rounded-full flex items-center justify-center">
                    <span className="text-primary-pink font-bold text-lg">🎮</span>
                  </div>
                  <h4 className="font-semibold text-dark-gray mb-2">Interesse</h4>
                  <p className="text-sm text-gray-600">Pixel Art Games</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
