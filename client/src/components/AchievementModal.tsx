import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Heart, MessageCircle, Calendar, Award, ExternalLink, User, Clock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { AchievementWithStats } from "@shared/schema";

interface CommentWithUser {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
}

interface AchievementModalProps {
  achievement: AchievementWithStats;
  isOpen: boolean;
  onClose: () => void;
  liked: boolean;
  onToggleLike: () => void;
}

export default function AchievementModal({ achievement, isOpen, onClose, liked, onToggleLike }: AchievementModalProps) {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [commentContent, setCommentContent] = useState("");

  const { data: comments = [] } = useQuery<CommentWithUser[]>({
    queryKey: ["/api/achievements", achievement.id, "comments"],
    enabled: isOpen,
  });

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", `/api/achievements/${achievement.id}/comments`, { content });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Comentário adicionado!",
        description: "Seu comentário foi publicado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/achievements", achievement.id, "comments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/achievements"] });
      setCommentContent("");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Login necessário",
          description: "Faça login para comentar nas conquistas.",
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
        description: "Faça login para comentar nas conquistas.",
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
        description: "Faça login para curtir as conquistas.",
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
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">{achievement.title}</DialogTitle>
              <DialogDescription className="text-base">
                {achievement.description}
              </DialogDescription>
            </div>
            {achievement.featured && (
              <Award className="w-6 h-6 text-yellow-500 flex-shrink-0" />
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Achievement Image */}
          {achievement.image && (
            <div className="aspect-video overflow-hidden rounded-lg">
              <img
                src={achievement.image}
                alt={achievement.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Achievement Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(achievement.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
              </div>
              
              {achievement.organization && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>{achievement.organization}</span>
                </div>
              )}

              <Badge 
                variant="secondary" 
                className="bg-pink-100 text-pink-800 w-fit"
              >
                {achievement.category}
              </Badge>
            </div>

            <div className="space-y-3">
              {achievement.certificateUrl && (
                <a
                  href={achievement.certificateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Ver Certificado
                </a>
              )}
            </div>
          </div>

          {/* Like and Comment Buttons */}
          <div className="flex items-center gap-4 pt-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={!isAuthenticated}
              className={`transition-colors ${
                liked 
                  ? "text-red-600 hover:text-red-700" 
                  : "text-gray-500 hover:text-red-600"
              }`}
              data-testid={`button-like-achievement-${achievement.id}`}
            >
              <Heart className={`w-4 h-4 mr-1 ${liked ? "fill-current" : ""}`} />
              {achievement.likesCount || 0}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-blue-600 transition-colors"
              data-testid={`button-comment-achievement-${achievement.id}`}
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              {achievement.commentsCount || 0}
            </Button>
          </div>

          {/* Comment Form */}
          {isAuthenticated ? (
            <form onSubmit={handleAddComment} className="space-y-3">
              <Textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Adicione um comentário sobre esta conquista..."
                className="min-h-[100px]"
                data-testid={`textarea-comment-achievement-${achievement.id}`}
              />
              <Button 
                type="submit" 
                disabled={!commentContent.trim() || addCommentMutation.isPending}
                className="bg-pink-600 hover:bg-pink-700"
                data-testid={`button-submit-comment-achievement-${achievement.id}`}
              >
                {addCommentMutation.isPending ? "Publicando..." : "Publicar Comentário"}
              </Button>
            </form>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-gray-600 mb-2">
                Faça login para curtir e comentar nesta conquista
              </p>
              <Button 
                onClick={() => window.location.href = "/api/login"}
                className="bg-pink-600 hover:bg-pink-700"
                data-testid="button-login-to-comment"
              >
                Fazer Login
              </Button>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">
              Comentários ({comments.length})
            </h3>
            
            {comments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Nenhum comentário ainda. Seja o primeiro a comentar!
              </p>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 p-4 rounded-lg" data-testid={`comment-achievement-${comment.id}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-pink-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {comment.user.firstName && comment.user.lastName 
                              ? `${comment.user.firstName} ${comment.user.lastName}`
                              : comment.user.email
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {formatDate(comment.createdAt)}
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm">{comment.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}