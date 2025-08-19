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
        
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="fade-in">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                alt="Professional workspace setup" 
                className="w-full h-80 object-cover"
              />
            </div>
          </div>
          
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
                Acredito que a tecnologia pode ser uma ferramenta poderosa para criar experiências únicas.
              </p>
              
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <GraduationCap className="text-primary-pink text-2xl mb-2" />
                  <h4 className="font-semibold text-dark-gray">Formação</h4>
                  <p className="text-sm text-gray-600">ADS - Senai & FATEC</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <Code className="text-primary-pink text-2xl mb-2" />
                  <h4 className="font-semibold text-dark-gray">Foco</h4>
                  <p className="text-sm text-gray-600">Full Stack Development</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
