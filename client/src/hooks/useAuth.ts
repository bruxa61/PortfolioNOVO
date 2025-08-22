// Compatibility hook that redirects to use-auth
import { useAuth as useAuthContext } from "./use-auth";

export function useAuth() {
  const auth = useAuthContext();
  
  // Check if user is admin based on email
  const isAdmin = auth.user?.email === "rafaelaolbo@gmail.com";
  
  return {
    ...auth,
    isAuthenticated: !!auth.user,
    isAdmin,
  };
}