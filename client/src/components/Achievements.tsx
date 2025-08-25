import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, ExternalLink, Award, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Achievement {
  id: string;
  title: string;
  description: string;
  image?: string | null;
  date: string;
  category: string;
  certificateUrl?: string | null;
  organization?: string | null;
  featured: boolean;
  likesCount: number;
  commentsCount: number;
}

interface AchievementCardProps {
  achievement: Achievement;
  onLike: (id: string) => void;
  onComment: (id: string) => void;
  isAuthenticated: boolean;
}

function AchievementCard({ achievement, onLike, onComment, isAuthenticated }: AchievementCardProps) {
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
              className="text-gray-600 hover:text-pink-600"
              data-testid={`button-like-achievement-${achievement.id}`}
            >
              <Heart className={`w-4 h-4 mr-1 ${isLiking ? 'animate-pulse' : ''}`} />
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
  
  const { data: achievements = [], isLoading } = useQuery<Achievement[]>({
    queryKey: ["/api/achievements"],
  });

  const handleLike = async (achievementId: string) => {
    if (!isAuthenticated) return;
    
    try {
      const response = await fetch(`/api/achievements/${achievementId}/like`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        // Invalidate and refetch achievements to update like count
        window.location.reload(); // Simple approach for now
      }
    } catch (error) {
      console.error('Error liking achievement:', error);
    }
  };

  const handleComment = (achievementId: string) => {
    // TODO: Open comment modal/form
    console.log('Comment on achievement:', achievementId);
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
                  onLike={handleLike}
                  onComment={handleComment}
                  isAuthenticated={isAuthenticated}
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
                  onLike={handleLike}
                  onComment={handleComment}
                  isAuthenticated={isAuthenticated}
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
      </div>
    </section>
  );
}