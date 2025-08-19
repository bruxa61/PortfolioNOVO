import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { Award, ExternalLink } from "lucide-react";

export default function Certificates() {
  useScrollAnimation();

  // Placeholder certificates - replace with real data
  const certificates = [
    {
      id: "1",
      title: "Certificado de Exemplo 1",
      issuer: "Instituição",
      date: "2024",
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300",
      link: "https://exemplo.com/certificado1",
      description: "Descrição do certificado e habilidades adquiridas"
    },
    {
      id: "2", 
      title: "Certificado de Exemplo 2",
      issuer: "Instituição",
      date: "2023",
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300",
      link: "https://exemplo.com/certificado2",
      description: "Descrição do certificado e habilidades adquiridas"
    },
    // Add more certificates as needed
  ];

  return (
    <section id="certificados" className="py-20 bg-light-gray">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-dark-gray mb-4">Certificados</h2>
          <div className="w-24 h-1 bg-primary-pink mx-auto rounded-full"></div>
          <p className="text-gray-600 mt-4">Cursos e certificações que complementam minha formação</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {certificates.map((certificate) => (
            <div key={certificate.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 fade-in group">
              <div className="relative overflow-hidden">
                <img 
                  src={certificate.image} 
                  alt={certificate.title} 
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <a
                    href={certificate.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white text-dark-gray px-4 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
                  >
                    <ExternalLink size={16} />
                    Ver Certificado
                  </a>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-start mb-3">
                  <Award className="text-primary-pink mr-3 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <h3 className="text-lg font-semibold text-dark-gray mb-1">{certificate.title}</h3>
                    <p className="text-primary-pink font-medium text-sm">{certificate.issuer}</p>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-3">{certificate.description}</p>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {certificate.date}
                  </span>
                  <a
                    href={certificate.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-pink hover:text-pink-600 transition-colors text-sm font-medium"
                  >
                    Ver Certificado →
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {certificates.length === 0 && (
          <div className="text-center py-12">
            <Award className="text-gray-300 mx-auto mb-4" size={64} />
            <p className="text-gray-500">Certificados serão adicionados em breve</p>
          </div>
        )}
      </div>
    </section>
  );
}