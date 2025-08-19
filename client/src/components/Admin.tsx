import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Github, ExternalLink, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { Project, InsertProject } from "@shared/schema";

interface ProjectFormData {
  title: string;
  description: string;
  image: string;
  githubUrl: string;
  demoUrl: string;
  technologies: string;
}

export default function Admin() {
  useScrollAnimation();
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>({
    title: "",
    description: "",
    image: "",
    githubUrl: "",
    demoUrl: "",
    technologies: "",
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: InsertProject) => {
      const response = await apiRequest("POST", "/api/projects", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Projeto criado!",
        description: "O projeto foi adicionado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar projeto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertProject> }) => {
      const response = await apiRequest("PUT", `/api/projects/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Projeto atualizado!",
        description: "As alterações foram salvas com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar projeto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/projects/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Projeto deletado!",
        description: "O projeto foi removido com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao deletar projeto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      image: "",
      githubUrl: "",
      demoUrl: "",
      technologies: "",
    });
    setIsAddingProject(false);
    setEditingProject(null);
  };

  const startEditing = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      image: project.image,
      githubUrl: project.githubUrl || "",
      demoUrl: project.demoUrl || "",
      technologies: project.technologies.join(", "),
    });
    setIsAddingProject(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const projectData: InsertProject = {
      title: formData.title,
      description: formData.description,
      image: formData.image,
      githubUrl: formData.githubUrl || null,
      demoUrl: formData.demoUrl || null,
      technologies: formData.technologies.split(",").map(tech => tech.trim()).filter(Boolean),
    };

    if (editingProject) {
      updateProjectMutation.mutate({
        id: editingProject.id,
        data: projectData,
      });
    } else {
      createProjectMutation.mutate(projectData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <section id="admin" className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-dark-gray mb-4">Painel Admin</h2>
          <div className="w-24 h-1 bg-primary-pink mx-auto rounded-full"></div>
          <p className="text-gray-600 mt-4">Gerencie seus projetos</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Projects List */}
          <div className="fade-in">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-dark-gray">Projetos Existentes</h3>
                <Button
                  onClick={() => setIsAddingProject(true)}
                  className="bg-primary-pink text-white hover:bg-pink-500"
                >
                  <Plus size={16} className="mr-2" />
                  Novo Projeto
                </Button>
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {projects.map((project) => (
                  <div key={project.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-dark-gray">{project.title}</h4>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEditing(project)}
                          className="p-2"
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteProjectMutation.mutate(project.id)}
                          className="p-2 text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{project.description.substring(0, 100)}...</p>
                    <div className="flex space-x-2">
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-500 hover:text-primary-pink"
                        >
                          <Github size={16} />
                        </a>
                      )}
                      {project.demoUrl && (
                        <a
                          href={project.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-500 hover:text-primary-pink"
                        >
                          <ExternalLink size={16} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Project Form */}
          {isAddingProject && (
            <div className="fade-in">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-dark-gray">
                    {editingProject ? "Editar Projeto" : "Novo Projeto"}
                  </h3>
                  <Button
                    variant="outline"
                    onClick={resetForm}
                    className="p-2"
                  >
                    <X size={16} />
                  </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      placeholder="Nome do projeto"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      rows={3}
                      placeholder="Descrição detalhada do projeto"
                    />
                  </div>

                  <div>
                    <Label htmlFor="image">URL da Imagem</Label>
                    <Input
                      id="image"
                      name="image"
                      value={formData.image}
                      onChange={handleChange}
                      required
                      placeholder="https://exemplo.com/imagem.jpg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="githubUrl">URL do GitHub</Label>
                    <Input
                      id="githubUrl"
                      name="githubUrl"
                      value={formData.githubUrl}
                      onChange={handleChange}
                      placeholder="https://github.com/usuario/repositorio"
                    />
                  </div>

                  <div>
                    <Label htmlFor="demoUrl">URL do Demo</Label>
                    <Input
                      id="demoUrl"
                      name="demoUrl"
                      value={formData.demoUrl}
                      onChange={handleChange}
                      placeholder="https://meusite.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="technologies">Tecnologias</Label>
                    <Input
                      id="technologies"
                      name="technologies"
                      value={formData.technologies}
                      onChange={handleChange}
                      required
                      placeholder="React, Node.js, MongoDB (separadas por vírgula)"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={createProjectMutation.isPending || updateProjectMutation.isPending}
                    className="w-full bg-primary-pink text-white hover:bg-pink-500"
                  >
                    <Save size={16} className="mr-2" />
                    {editingProject ? "Salvar Alterações" : "Criar Projeto"}
                  </Button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}