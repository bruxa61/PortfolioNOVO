import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import AdminNew from "@/components/AdminNew";
import { Button } from "@/components/ui/button";

export default function AdminPage() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/auth");
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <Navigation />
        <div className="container mx-auto px-4 pt-20">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Carregando...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  if (!user.isAdmin) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <Navigation />
        <div className="container mx-auto px-4 pt-20">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Acesso Negado
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Você não tem permissão para acessar esta área administrativa.
              </p>
              <Button onClick={() => setLocation("/")} variant="outline">
                Voltar ao Início
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navigation />
      <div className="container mx-auto px-4 pt-20">
        <AdminNew />
      </div>
    </div>
  );
}