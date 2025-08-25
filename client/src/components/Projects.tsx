import { useState } from "react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Github, ExternalLink, Loader2, Heart, MessageCircle, Eye } from "lucide-react";
import ProjectModal from "@/components/ProjectModal";
import type { ProjectWithStats } from "@shared/schema";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Projects() {
  useScrollAnimation();
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedProject, setSelectedProject] = useState<ProjectWithStats | null>(null);
  const [likedProjects, setLikedProjects] = useState<Set<string>>(new Set());

  const { data: projects, isLoading, error } = useQuery<ProjectWithStats[]>({
    queryKey: ["/api/projects"],
  });

  const toggleLikeMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/like`);
      return response.json();
    },
    onSuccess: (data, projectId) => {
      if (data.liked) {
        setLikedProjects(prev => new Set(Array.from(prev).concat(projectId)));
      } else {
        setLikedProjects(prev => {
          const newSet = new Set(prev);
          newSet.delete(projectId);
          return newSet;
        });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: data.liked ? "Projeto curtido!" : "Curtida removida",
        description: data.liked ? "Você curtiu este projeto." : "Você removeu a curtida.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Login necessário",
          description: "Faça login para curtir os projetos.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1500);
        return;
      }
      toast({
        title: "Erro ao curtir",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleToggleLike = (projectId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Login necessário",
        description: "Faça login para curtir os projetos.",
        variant: "destructive",
      });
      return;
    }
    toggleLikeMutation.mutate(projectId);
  };

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
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Meus Projetos</h2>
          <div className="w-24 h-1 bg-primary-pink mx-auto rounded-full"></div>
          <p className="text-gray-700 mt-4 max-w-2xl mx-auto">
            Alguns dos projetos que desenvolvi durante minha jornada de aprendizado
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-primary-pink" size={48} />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects?.map((project) => (
              <div key={project.id} className="bg-white rounded-xl shadow-lg hover:shadow-2xl border border-gray-200 transition-all duration-300 fade-in group backdrop-blur-sm">
                <div className="p-6 h-full flex flex-col">
                  <div className="relative overflow-hidden rounded-lg mb-4">
                    <img 
                      src={project.image} 
                      alt={`${project.title} project`} 
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                      onClick={() => setSelectedProject(project)}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="space-x-4">
                        <button
                          onClick={() => setSelectedProject(project)}
                          className="bg-white text-gray-800 px-4 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
                        >
                          <Eye size={16} />
                          Ver Detalhes
                        </button>
                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-dark-gray text-white px-4 py-2 rounded-full font-semibold hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Github size={16} />
                            GitHub
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 flex flex-col">
                    <h3 
                      className="text-xl font-bold text-dark-gray mb-2 cursor-pointer hover:text-primary-pink transition-colors"
                      onClick={() => setSelectedProject(project)}
                    >
                      {project.title}
                    </h3>
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed flex-1">
                      {project.description.length > 120 
                        ? `${project.description.substring(0, 120)}...` 
                        : project.description
                      }
                    </p>
                    
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.slice(0, 3).map((tech, techIndex) => (
                          <span
                            key={techIndex}
                            className="bg-soft-pink text-primary-pink px-3 py-1 rounded-full text-xs font-semibold"
                          >
                            {tech}
                          </span>
                        ))}
                        {project.technologies.length > 3 && (
                          <span className="text-xs text-gray-500 px-2 py-1">
                            +{project.technologies.length - 3} mais
                          </span>
                        )}
                      </div>
                      
                      {/* Stats and Actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Heart size={14} />
                            <span>{project.likesCount || 0}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <MessageCircle size={14} />
                            <span>{project.commentsCount || 0}</span>
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleLike(project.id);
                            }}
                            className={`p-2 rounded-full transition-colors ${
                              likedProjects.has(project.id) || project.userLiked
                                ? "bg-red-100 text-red-600 hover:bg-red-200"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                            title="Curtir projeto"
                          >
                            <Heart 
                              size={16} 
                              className={(likedProjects.has(project.id) || project.userLiked) ? "fill-current" : ""} 
                            />
                          </button>
                          
                          <button
                            onClick={() => setSelectedProject(project)}
                            className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                            title="Ver comentários"
                          >
                            <MessageCircle size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Project Modal */}
        {selectedProject && (
          <ProjectModal
            project={selectedProject}
            isOpen={!!selectedProject}
            onClose={() => setSelectedProject(null)}
            liked={likedProjects.has(selectedProject.id) || selectedProject.userLiked || false}
            onToggleLike={() => handleToggleLike(selectedProject.id)}
          />
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
