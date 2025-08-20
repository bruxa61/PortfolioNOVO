import { useAuth } from "@/hooks/use-auth";
import Navigation from "@/components/Navigation";
import AdminNew from "@/components/AdminNew";

export default function AdminPage() {
  const { user } = useAuth();

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <Navigation />
        <div className="container mx-auto px-4 pt-20">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Acesso Negado
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Você não tem permissão para acessar esta área.
              </p>
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