import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Settings, 
  Users, 
  MessageSquare, 
  Heart, 
  Calendar,
  Star,
  BarChart3,
  Award,
  Upload
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Project {
  id: string;
  title: string;
  description: string;
  image?: string | null;
  githubUrl?: string | null;
  demoUrl?: string | null;
  technologies: string[];
  category: string;
  tags: string[];
  featured: boolean;
  status: string;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  image?: string | null;
  date: string;
  category: string;
  organization?: string | null;
  certificateUrl?: string | null;
  featured: boolean;
  status: string;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

interface ProjectForm {
  title: string;
  description: string;
  image?: string;
  githubUrl?: string;
  demoUrl?: string;
  technologies: string;
  category: string;
  tags: string;
  featured: boolean;
  status: string;
}

interface AchievementForm {
  title: string;
  description: string;
  image?: string;
  date: string;
  category: string;
  organization?: string;
  certificateUrl?: string;
  featured: boolean;
  status: string;
}

export default function Admin() {
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [isAchievementDialogOpen, setIsAchievementDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  
  const [projectForm, setProjectForm] = useState<ProjectForm>({
    title: "",
    description: "",
    image: "",
    githubUrl: "",
    demoUrl: "",
    technologies: "",
    category: "web",
    tags: "",
    featured: false,
    status: "published"
  });

  const [achievementForm, setAchievementForm] = useState<AchievementForm>({
    title: "",
    description: "",
    image: "",
    date: new Date().toISOString().split('T')[0],
    category: "certificação",
    organization: "",
    certificateUrl: "",
    featured: false,
    status: "published"
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const { data: projects = [], isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: achievements = [], isLoading: achievementsLoading } = useQuery<Achievement[]>({
    queryKey: ["/api/achievements"],
  });

  const { data: contacts = [], isLoading: contactsLoading } = useQuery<Contact[]>({
    queryKey: ["/api/admin/contacts"],
  });

  // Project Mutations
  const createProjectMutation = useMutation({
    mutationFn: async (data: ProjectForm) => {
      const response = await apiRequest("POST", "/api/projects", {
        ...data,
        technologies: data.technologies ? data.technologies.split(",").map(t => t.trim()) : [],
        tags: data.tags ? data.tags.split(",").map(t => t.trim()).filter(t => t) : []
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setIsProjectDialogOpen(false);
      resetProjectForm();
      toast({
        title: "Sucesso!",
        description: "Projeto criado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar projeto.",
        variant: "destructive",
      });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ProjectForm> }) => {
      const response = await apiRequest("PUT", `/api/projects/${id}`, {
        ...data,
        technologies: data.technologies ? data.technologies.split(",").map(t => t.trim()) : undefined,
        tags: data.tags ? data.tags.split(",").map(t => t.trim()).filter(t => t) : undefined
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setIsProjectDialogOpen(false);
      setEditingProject(null);
      resetProjectForm();
      toast({
        title: "Sucesso!",
        description: "Projeto atualizado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar projeto.",
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
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Sucesso!",
        description: "Projeto excluído com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir projeto.",
        variant: "destructive",
      });
    },
  });

  // Achievement Mutations
  const createAchievementMutation = useMutation({
    mutationFn: async (data: AchievementForm) => {
      const response = await apiRequest("POST", "/api/achievements", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/achievements"] });
      setIsAchievementDialogOpen(false);
      resetAchievementForm();
      toast({
        title: "Sucesso!",
        description: "Conquista criada com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar conquista.",
        variant: "destructive",
      });
    },
  });

  const updateAchievementMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AchievementForm> }) => {
      const response = await apiRequest("PUT", `/api/achievements/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/achievements"] });
      setIsAchievementDialogOpen(false);
      setEditingAchievement(null);
      resetAchievementForm();
      toast({
        title: "Sucesso!",
        description: "Conquista atualizada com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar conquista.",
        variant: "destructive",
      });
    },
  });

  const deleteAchievementMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/achievements/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/achievements"] });
      toast({
        title: "Sucesso!",
        description: "Conquista excluída com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir conquista.",
        variant: "destructive",
      });
    },
  });

  const resetProjectForm = () => {
    setProjectForm({
      title: "",
      description: "",
      image: "",
      githubUrl: "",
      demoUrl: "",
      technologies: "",
      category: "web",
      tags: "",
      featured: false,
      status: "published"
    });
  };

  const resetAchievementForm = () => {
    setAchievementForm({
      title: "",
      description: "",
      image: "",
      date: new Date().toISOString().split('T')[0],
      category: "certificação",
      organization: "",
      certificateUrl: "",
      featured: false,
      status: "published"
    });
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setProjectForm({
      title: project.title,
      description: project.description,
      image: project.image || "",
      githubUrl: project.githubUrl || "",
      demoUrl: project.demoUrl || "",
      technologies: project.technologies.join(", "),
      category: project.category,
      tags: project.tags.join(", "),
      featured: project.featured,
      status: project.status
    });
    setIsProjectDialogOpen(true);
  };

  const handleEditAchievement = (achievement: Achievement) => {
    setEditingAchievement(achievement);
    setAchievementForm({
      title: achievement.title,
      description: achievement.description,
      image: achievement.image || "",
      date: achievement.date.split('T')[0],
      category: achievement.category,
      organization: achievement.organization || "",
      certificateUrl: achievement.certificateUrl || "",
      featured: achievement.featured,
      status: achievement.status
    });
    setIsAchievementDialogOpen(true);
  };

  const handleDeleteProject = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este projeto?")) {
      deleteProjectMutation.mutate(id);
    }
  };

  const handleDeleteAchievement = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta conquista?")) {
      deleteAchievementMutation.mutate(id);
    }
  };

  const handleSubmitProject = () => {
    if (editingProject) {
      updateProjectMutation.mutate({ id: editingProject.id, data: projectForm });
    } else {
      createProjectMutation.mutate(projectForm);
    }
  };

  const handleSubmitAchievement = () => {
    if (editingAchievement) {
      updateAchievementMutation.mutate({ id: editingAchievement.id, data: achievementForm });
    } else {
      createAchievementMutation.mutate(achievementForm);
    }
  };

  // Calculate stats
  const totalLikes = projects.reduce((sum, project) => sum + (project.likesCount || 0), 0) + 
                    achievements.reduce((sum, achievement) => sum + (achievement.likesCount || 0), 0);
  const totalComments = projects.reduce((sum, project) => sum + (project.commentsCount || 0), 0) + 
                       achievements.reduce((sum, achievement) => sum + (achievement.commentsCount || 0), 0);
  const featuredProjects = projects.filter(p => p.featured).length;
  const featuredAchievements = achievements.filter(a => a.featured).length;
  const totalContacts = contacts.length;

  return (
    <section id="admin" className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-2">
            <Settings className="w-8 h-8 text-pink-600" />
            Dashboard Administrativo
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie seu conteúdo, visualize estatísticas e acompanhe o engajamento
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projetos</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projects.length}</div>
              <p className="text-xs text-muted-foreground">
                {featuredProjects} em destaque
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conquistas</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{achievements.length}</div>
              <p className="text-xs text-muted-foreground">
                {featuredAchievements} em destaque
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Curtidas</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLikes}</div>
              <p className="text-xs text-muted-foreground">
                Total de engajamento
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comentários</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalComments}</div>
              <p className="text-xs text-muted-foreground">
                Interações dos visitantes
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contatos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalContacts}</div>
              <p className="text-xs text-muted-foreground">
                Mensagens recebidas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="projects">Projetos</TabsTrigger>
            <TabsTrigger value="achievements">Conquistas</TabsTrigger>
            <TabsTrigger value="contacts">Contatos</TabsTrigger>
          </TabsList>

          {/* Projects Tab */}
          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Gerenciar Projetos</CardTitle>
                    <CardDescription>
                      Adicione, edite ou remova projetos do seu portfólio
                    </CardDescription>
                  </div>
                  <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        onClick={() => { resetProjectForm(); setEditingProject(null); }}
                        data-testid="button-add-project"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Projeto
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {editingProject ? "Editar Projeto" : "Novo Projeto"}
                        </DialogTitle>
                        <DialogDescription>
                          {editingProject ? "Edite os detalhes do projeto" : "Adicione um novo projeto ao seu portfólio"}
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="title">Título</Label>
                          <Input
                            id="title"
                            value={projectForm.title}
                            onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                            placeholder="Nome do projeto"
                            data-testid="input-project-title"
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="description">Descrição</Label>
                          <Textarea
                            id="description"
                            value={projectForm.description}
                            onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                            placeholder="Descrição do projeto"
                            className="min-h-[100px]"
                            data-testid="input-project-description"
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="project-image">Imagem de Capa</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="project-image"
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = () => {
                                    setProjectForm({ ...projectForm, image: reader.result as string });
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              data-testid="input-project-image-file"
                              className="hidden"
                            />
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={() => document.getElementById('project-image')?.click()}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Escolher Arquivo
                            </Button>
                          </div>
                          <Input
                            value={projectForm.image}
                            onChange={(e) => setProjectForm({ ...projectForm, image: e.target.value })}
                            placeholder="Ou cole a URL da imagem"
                            data-testid="input-project-image-url"
                          />
                          <p className="text-sm text-gray-500">Escolha um arquivo ou cole uma URL de imagem</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="githubUrl">GitHub URL</Label>
                            <Input
                              id="githubUrl"
                              value={projectForm.githubUrl}
                              onChange={(e) => setProjectForm({ ...projectForm, githubUrl: e.target.value })}
                              placeholder="https://github.com/..."
                              data-testid="input-project-github"
                            />
                          </div>
                          
                          <div className="grid gap-2">
                            <Label htmlFor="demoUrl">Demo URL</Label>
                            <Input
                              id="demoUrl"
                              value={projectForm.demoUrl}
                              onChange={(e) => setProjectForm({ ...projectForm, demoUrl: e.target.value })}
                              placeholder="https://..."
                              data-testid="input-project-demo"
                            />
                          </div>
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="technologies">Tecnologias</Label>
                          <Input
                            id="technologies"
                            value={projectForm.technologies}
                            onChange={(e) => setProjectForm({ ...projectForm, technologies: e.target.value })}
                            placeholder="React, TypeScript, Node.js"
                            data-testid="input-project-technologies"
                          />
                          <p className="text-sm text-gray-500">Separe por vírgulas</p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="featured"
                            checked={projectForm.featured}
                            onCheckedChange={(checked) => setProjectForm({ ...projectForm, featured: !!checked })}
                            data-testid="checkbox-project-featured"
                          />
                          <Label htmlFor="featured">Projeto em destaque</Label>
                        </div>
                      </div>
                      
                      <DialogFooter>
                        <Button
                          type="submit"
                          onClick={handleSubmitProject}
                          disabled={createProjectMutation.isPending || updateProjectMutation.isPending}
                          data-testid="button-save-project"
                        >
                          {createProjectMutation.isPending || updateProjectMutation.isPending
                            ? "Salvando..."
                            : editingProject
                            ? "Atualizar Projeto"
                            : "Criar Projeto"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              
              <CardContent>
                {projectsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Carregando projetos...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        data-testid={`project-item-${project.id}`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{project.title}</h3>
                            {project.featured && (
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            )}
                            <Badge variant={project.status === 'published' ? 'default' : 'secondary'}>
                              {project.status}
                            </Badge>
                          </div>
                          
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">
                            {project.description}
                          </p>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Heart className="w-4 h-4" />
                              {project.likesCount || 0} curtidas
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageSquare className="w-4 h-4" />
                              {project.commentsCount || 0} comentários
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {format(new Date(project.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditProject(project)}
                            data-testid={`button-edit-project-${project.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteProject(project.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            data-testid={`button-delete-project-${project.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {projects.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-gray-500">Nenhum projeto encontrado.</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Gerenciar Conquistas</CardTitle>
                    <CardDescription>
                      Adicione, edite ou remova suas conquistas e certificações
                    </CardDescription>
                  </div>
                  <Dialog open={isAchievementDialogOpen} onOpenChange={setIsAchievementDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        onClick={() => { resetAchievementForm(); setEditingAchievement(null); }}
                        data-testid="button-add-achievement"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Conquista
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {editingAchievement ? "Editar Conquista" : "Nova Conquista"}
                        </DialogTitle>
                        <DialogDescription>
                          {editingAchievement ? "Edite os detalhes da conquista" : "Adicione uma nova conquista ao seu portfólio"}
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="achievement-title">Título</Label>
                          <Input
                            id="achievement-title"
                            value={achievementForm.title}
                            onChange={(e) => setAchievementForm({ ...achievementForm, title: e.target.value })}
                            placeholder="Nome da conquista"
                            data-testid="input-achievement-title"
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="achievement-description">Descrição</Label>
                          <Textarea
                            id="achievement-description"
                            value={achievementForm.description}
                            onChange={(e) => setAchievementForm({ ...achievementForm, description: e.target.value })}
                            placeholder="Descrição da conquista"
                            className="min-h-[100px]"
                            data-testid="input-achievement-description"
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="achievement-image">Imagem de Capa</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="achievement-image"
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = () => {
                                    setAchievementForm({ ...achievementForm, image: reader.result as string });
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              data-testid="input-achievement-image-file"
                              className="hidden"
                            />
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={() => document.getElementById('achievement-image')?.click()}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Escolher Arquivo
                            </Button>
                          </div>
                          <Input
                            value={achievementForm.image}
                            onChange={(e) => setAchievementForm({ ...achievementForm, image: e.target.value })}
                            placeholder="Ou cole a URL da imagem"
                            data-testid="input-achievement-image-url"
                          />
                          <p className="text-sm text-gray-500">Escolha um arquivo ou cole uma URL de imagem</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="achievement-date">Data</Label>
                            <Input
                              id="achievement-date"
                              type="date"
                              value={achievementForm.date}
                              onChange={(e) => setAchievementForm({ ...achievementForm, date: e.target.value })}
                              data-testid="input-achievement-date"
                            />
                          </div>
                          
                          <div className="grid gap-2">
                            <Label htmlFor="achievement-category">Categoria</Label>
                            <Select
                              value={achievementForm.category}
                              onValueChange={(value) => setAchievementForm({ ...achievementForm, category: value })}
                            >
                              <SelectTrigger data-testid="select-achievement-category">
                                <SelectValue placeholder="Selecione a categoria" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="certificação">Certificação</SelectItem>
                                <SelectItem value="educação">Educação</SelectItem>
                                <SelectItem value="prêmio">Prêmio</SelectItem>
                                <SelectItem value="reconhecimento">Reconhecimento</SelectItem>
                                <SelectItem value="outro">Outro</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="achievement-organization">Organização</Label>
                          <Input
                            id="achievement-organization"
                            value={achievementForm.organization}
                            onChange={(e) => setAchievementForm({ ...achievementForm, organization: e.target.value })}
                            placeholder="Nome da instituição/organização"
                            data-testid="input-achievement-organization"
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="achievement-certificate">URL do Certificado</Label>
                          <Input
                            id="achievement-certificate"
                            value={achievementForm.certificateUrl}
                            onChange={(e) => setAchievementForm({ ...achievementForm, certificateUrl: e.target.value })}
                            placeholder="https://..."
                            data-testid="input-achievement-certificate"
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="achievement-featured"
                            checked={achievementForm.featured}
                            onCheckedChange={(checked) => setAchievementForm({ ...achievementForm, featured: !!checked })}
                            data-testid="checkbox-achievement-featured"
                          />
                          <Label htmlFor="achievement-featured">Conquista em destaque</Label>
                        </div>
                      </div>
                      
                      <DialogFooter>
                        <Button
                          type="submit"
                          onClick={handleSubmitAchievement}
                          disabled={createAchievementMutation.isPending || updateAchievementMutation.isPending}
                          data-testid="button-save-achievement"
                        >
                          {createAchievementMutation.isPending || updateAchievementMutation.isPending
                            ? "Salvando..."
                            : editingAchievement
                            ? "Atualizar Conquista"
                            : "Criar Conquista"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              
              <CardContent>
                {achievementsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Carregando conquistas...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {achievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        data-testid={`achievement-item-${achievement.id}`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{achievement.title}</h3>
                            {achievement.featured && (
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            )}
                            <Badge variant="secondary">
                              {achievement.category}
                            </Badge>
                          </div>
                          
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">
                            {achievement.description}
                          </p>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Heart className="w-4 h-4" />
                              {achievement.likesCount || 0} curtidas
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageSquare className="w-4 h-4" />
                              {achievement.commentsCount || 0} comentários
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {format(new Date(achievement.date), "dd/MM/yyyy", { locale: ptBR })}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditAchievement(achievement)}
                            data-testid={`button-edit-achievement-${achievement.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteAchievement(achievement.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            data-testid={`button-delete-achievement-${achievement.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {achievements.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-gray-500">Nenhuma conquista encontrada.</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contacts Tab */}
          <TabsContent value="contacts">
            <Card>
              <CardHeader>
                <CardTitle>Mensagens de Contato</CardTitle>
                <CardDescription>
                  Mensagens recebidas através do formulário de contato
                </CardDescription>
              </CardHeader>
              <CardContent>
                {contactsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Carregando mensagens...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {contacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        data-testid={`contact-item-${contact.id}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold">{contact.name}</h4>
                            <p className="text-sm text-gray-600">{contact.email}</p>
                          </div>
                          <span className="text-sm text-gray-500">
                            {format(new Date(contact.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                        
                        <p className="font-medium text-sm mb-2">{contact.subject}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{contact.message}</p>
                      </div>
                    ))}
                    
                    {contacts.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-gray-500">Nenhuma mensagem encontrada.</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}