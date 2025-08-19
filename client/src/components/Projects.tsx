import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { useQuery } from "@tanstack/react-query";
import { Github, ExternalLink, Loader2 } from "lucide-react";
import type { Project } from "@shared/schema";

export default function Projects() {
  useScrollAnimation();

  const { data: projects, isLoading, error } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  if (error) {
    return (
      <section id="projetos" className="py-20 bg-light-gray">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-500">Erro ao carregar projetos. Tente novamente mais tarde.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="projetos" className="py-20 bg-light-gray">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-dark-gray mb-4">Meus Projetos</h2>
          <div className="w-24 h-1 bg-primary-pink mx-auto rounded-full"></div>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Alguns dos projetos que desenvolvi durante minha jornada de aprendizado
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-primary-pink" size={48} />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects?.map((project, index) => (
              <div key={project.id} className="gradient-border fade-in group">
                <div className="p-6 h-full">
                  <div className="relative overflow-hidden rounded-lg mb-4">
                    <img 
                      src={project.image} 
                      alt={`${project.title} project`} 
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="space-x-4">
                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white text-dark-gray px-4 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
                          >
                            <Github size={16} />
                            GitHub
                          </a>
                        )}
                        {project.demoUrl && (
                          <a
                            href={project.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-primary-pink text-white px-4 py-2 rounded-full font-semibold hover:bg-pink-500 transition-colors inline-flex items-center gap-2"
                          >
                            <ExternalLink size={16} />
                            Demo
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-dark-gray mb-2">{project.title}</h3>
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, techIndex) => (
                      <span
                        key={techIndex}
                        className="bg-soft-pink text-primary-pink px-3 py-1 rounded-full text-xs font-semibold"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="text-center mt-12 fade-in">
          <a
            href="https://github.com/bruxa61"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center bg-dark-gray text-white px-8 py-4 rounded-full font-semibold hover:bg-gray-800 transition-colors gap-3"
          >
            <Github size={24} />
            Ver todos os projetos no GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
