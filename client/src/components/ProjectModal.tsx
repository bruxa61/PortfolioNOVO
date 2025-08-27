import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { X, Github, ExternalLink, Send, MessageCircle, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Project, CommentWithUser } from "@shared/schema";
import { isUnauthorizedError } from "@/lib/authUtils";

interface ProjectModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  liked: boolean;
  onToggleLike: () => void;
}

export default function ProjectModal({ project, isOpen, onClose, liked, onToggleLike }: ProjectModalProps) {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [commentContent, setCommentContent] = useState("");

  const { data: comments = [] } = useQuery<CommentWithUser[]>({
    queryKey: ["/api/projects", project.id, "comments"],
    enabled: isOpen,
  });

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", `/api/projects/${project.id}/comments`, { content });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Comentário adicionado!",
        description: "Seu comentário foi publicado com sucesso.",
      });
      // Force refetch both the comments and the projects list to update counters
      queryClient.invalidateQueries({ queryKey: ["/api/projects", project.id, "comments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.refetchQueries({ queryKey: ["/api/projects"] });
      setCommentContent("");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Login necessário",
          description: "Faça login para comentar nos projetos.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1500);
        return;
      }
      toast({
        title: "Erro ao comentar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;
    
    if (!isAuthenticated) {
      toast({
        title: "Login necessário",
        description: "Faça login para comentar nos projetos.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1500);
      return;
    }
    
    addCommentMutation.mutate(commentContent);
  };

  const handleLike = () => {
    if (!isAuthenticated) {
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
    onToggleLike();
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-dark-gray">{project.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Project Image */}
          <div className="relative overflow-hidden rounded-lg">
            <img 
              src={project.image} 
              alt={project.title} 
              className="w-full h-64 object-cover"
            />
          </div>

          {/* Project Info */}
          <div className="space-y-4">
            <p className="text-gray-700 leading-relaxed">{project.description}</p>
            
            {/* Technologies */}
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech, index) => (
                <span
                  key={index}
                  className="bg-soft-pink text-primary-pink px-3 py-1 rounded-full text-sm font-semibold"
                >
                  {tech}
                </span>
              ))}
            </div>

            {/* Links and Like */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <div className="flex space-x-4">
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 bg-dark-gray text-white px-4 py-2 rounded-full font-semibold hover:bg-gray-800 transition-colors"
                  >
                    <Github size={16} />
                    <span>GitHub</span>
                  </a>
                )}
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 bg-primary-pink text-white px-4 py-2 rounded-full font-semibold hover:bg-pink-500 transition-colors"
                  >
                    <ExternalLink size={16} />
                    <span>Demo</span>
                  </a>
                )}
              </div>
              
              {/* Like Button */}
              <button
                onClick={handleLike}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
                  liked
                    ? "bg-red-100 text-red-600 hover:bg-red-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Heart size={16} className={liked ? "fill-current" : ""} />
                <span>Curtir</span>
              </button>
            </div>
          </div>

          {/* Comments Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-dark-gray mb-4 flex items-center">
              <MessageCircle size={20} className="mr-2 text-primary-pink" />
              Comentários ({comments.length})
            </h3>

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="mb-6">
              <div className="flex space-x-3">
                {user?.profileImageUrl && (
                  <img 
                    src={user.profileImageUrl} 
                    alt={user.firstName || 'User'} 
                    className="w-8 h-8 rounded-full border border-primary-pink flex-shrink-0"
                  />
                )}
                <div className="flex-1">
                  <Textarea
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    placeholder={isAuthenticated ? "Deixe seu comentário..." : "Faça login para comentar"}
                    rows={3}
                    disabled={!isAuthenticated}
                    className="resize-none"
                  />
                  <div className="flex justify-end mt-2">
                    <Button
                      type="submit"
                      disabled={!commentContent.trim() || addCommentMutation.isPending || !isAuthenticated}
                      className="bg-primary-pink text-white hover:bg-pink-500"
                    >
                      <Send size={16} className="mr-2" />
                      Comentar
                    </Button>
                  </div>
                </div>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {comments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Ainda não há comentários. Seja o primeiro a comentar!
                </p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3 p-4 bg-gray-50 rounded-lg">
                    <img 
                      src={comment.user.profileImageUrl || `/api/placeholder/32/32`} 
                      alt={comment.user.firstName || 'User'} 
                      className="w-8 h-8 rounded-full border border-primary-pink flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-semibold text-dark-gray text-sm">
                          {comment.user.firstName ? 
                            `${comment.user.firstName} ${comment.user.lastName || ''}`.trim() : 
                            comment.user.email
                          }
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(comment.createdAt!)}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm">{comment.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}