import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Check if user is admin based on email
  const isAdmin = user?.email === "rafaelaolbo@gmail.com";

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin,
  };
}