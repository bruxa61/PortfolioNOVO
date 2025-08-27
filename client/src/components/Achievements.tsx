import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, ExternalLink, Award, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AchievementModal from "./AchievementModal";
import type { AchievementWithStats } from "@shared/schema";

interface AchievementCardProps {
  achievement: AchievementWithStats;
  onLike: (id: string) => void;
  onComment: (id: string) => void;
  isAuthenticated: boolean;
}

function AchievementCard({ achievement, onLike, onComment, isAuthenticated, isLiked }: AchievementCardProps & { isLiked: boolean }) {
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    if (!isAuthenticated || isLiking) return;
    setIsLiking(true);
    try {
      await onLike(achievement.id);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <Card className="group h-full transition-all duration-300 hover:shadow-2xl hover:shadow-pink-200/50 border-gray-200 bg-white/90 backdrop-blur-sm shadow-lg">
      {achievement.image && (
        <div className="aspect-video overflow-hidden rounded-t-lg">
          <img
            src={achievement.image}
            alt={achievement.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
              {achievement.title}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <Calendar className="w-4 h-4" />
              {format(new Date(achievement.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </div>
            {achievement.organization && (
              <p className="text-sm text-gray-600 mb-2">
                {achievement.organization}
              </p>
            )}
          </div>
          {achievement.featured && (
            <Award className="w-5 h-5 text-yellow-500 flex-shrink-0" />
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Badge 
            variant="secondary" 
            className="bg-pink-100 text-pink-800"
          >
            {achievement.category}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-gray-700 text-sm mb-4 line-clamp-3">
          {achievement.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={!isAuthenticated || isLiking}
              className={`transition-colors ${
                isLiked 
                  ? "text-red-600 hover:text-red-700" 
                  : "text-gray-600 hover:text-pink-600"
              }`}
              data-testid={`button-like-achievement-${achievement.id}`}
            >
              <Heart className={`w-4 h-4 mr-1 ${isLiking ? 'animate-pulse' : ''} ${isLiked ? 'fill-current' : ''}`} />
              {achievement.likesCount}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onComment(achievement.id)}
              disabled={!isAuthenticated}
              className="text-gray-600 hover:text-pink-600"
              data-testid={`button-comment-achievement-${achievement.id}`}
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              {achievement.commentsCount}
            </Button>
          </div>

          {achievement.certificateUrl && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="border-pink-200 text-pink-600 hover:bg-pink-50"
            >
              <a
                href={achievement.certificateUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-testid={`link-certificate-${achievement.id}`}
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Certificado
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Achievements() {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [likedAchievements, setLikedAchievements] = useState<Set<string>>(new Set());
  const [selectedAchievement, setSelectedAchievement] = useState<AchievementWithStats | null>(null);
  
  const { data: achievements = [], isLoading } = useQuery<AchievementWithStats[]>({
    queryKey: ["/api/achievements"],
    staleTime: 0, // Always consider data stale to force updates
    refetchOnWindowFocus: true,
  });

  // Load user's liked achievements on component mount
  const { data: userAchievementLikes } = useQuery<{ achievementId: string }[]>({
    queryKey: ["/api/user/achievement-likes"],
    enabled: isAuthenticated,
  });

  // Initialize liked achievements from user data
  useEffect(() => {
    if (userAchievementLikes && userAchievementLikes.length > 0) {
      setLikedAchievements(new Set(userAchievementLikes.map(like => like.achievementId)));
    }
  }, [userAchievementLikes]);

  const toggleLikeMutation = useMutation({
    mutationFn: async (achievementId: string) => {
      const response = await apiRequest("POST", `/api/achievements/${achievementId}/like`);
      return response.json();
    },
    onSuccess: (data, achievementId) => {
      if (data.liked) {
        setLikedAchievements(prev => new Set(Array.from(prev).concat(achievementId)));
      } else {
        setLikedAchievements(prev => {
          const newSet = new Set(prev);
          newSet.delete(achievementId);
          return newSet;
        });
      }
      // Force refetch to ensure counters are updated
      queryClient.invalidateQueries({ queryKey: ["/api/achievements"] });
      queryClient.refetchQueries({ queryKey: ["/api/achievements"] });
      toast({
        title: data.liked ? "Conquista curtida!" : "Curtida removida",
        description: data.liked ? "Você curtiu esta conquista." : "Você removeu a curtida.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao curtir",
        description: "Não foi possível curtir a conquista. Tente novamente.",
        variant: "destructive",
      });
    },
  });



  const handleComment = (achievementId: string) => {
    const achievement = achievements.find(a => a.id === achievementId);
    if (achievement) {
      setSelectedAchievement(achievement);
    }
  };

  const handleToggleLike = (achievementId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Login necessário",
        description: "Faça login para curtir as conquistas.",
        variant: "destructive",
      });
      return;
    }
    toggleLikeMutation.mutate(achievementId);
  };

  if (isLoading) {
    return (
      <section id="achievements" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Conquistas
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Certificações, prêmios e marcos importantes na minha jornada profissional
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="h-64 animate-pulse">
                <div className="bg-gray-200 h-full rounded-lg"></div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const featuredAchievements = achievements.filter(a => a.featured);
  const regularAchievements = achievements.filter(a => !a.featured);

  return (
    <section id="achievements" className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Conquistas
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Certificações, prêmios e marcos importantes na minha jornada profissional
          </p>
        </div>

        {/* Featured Achievements */}
        {featuredAchievements.length > 0 && (
          <div className="mb-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              Conquistas em Destaque
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {featuredAchievements.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  onLike={handleToggleLike}
                  onComment={handleComment}
                  isAuthenticated={isAuthenticated}
                  isLiked={likedAchievements.has(achievement.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Regular Achievements */}
        {regularAchievements.length > 0 && (
          <div>
            {featuredAchievements.length > 0 && (
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Outras Conquistas
              </h3>
            )}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularAchievements.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  onLike={handleToggleLike}
                  onComment={handleComment}
                  isAuthenticated={isAuthenticated}
                  isLiked={likedAchievements.has(achievement.id)}
                />
              ))}
            </div>
          </div>
        )}

        {achievements.length === 0 && (
          <div className="text-center py-12">
            <Award className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Nenhuma conquista encontrada.
            </p>
          </div>
        )}

        {/* Achievement Modal */}
        {selectedAchievement && (
          <AchievementModal
            achievement={selectedAchievement}
            isOpen={!!selectedAchievement}
            onClose={() => setSelectedAchievement(null)}
            liked={likedAchievements.has(selectedAchievement.id)}
            onToggleLike={() => handleToggleLike(selectedAchievement.id)}
          />
        )}
      </div>
    </section>
  );
}