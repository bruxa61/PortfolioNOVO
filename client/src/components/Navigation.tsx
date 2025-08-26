import { useState, useEffect } from "react";
import { Menu, X, LogOut, Settings, User, LogIn, Upload } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import avatarImage from "@assets/bottons (3)_1755631449256.png";

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("inicio");
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isAuthenticated = !!user;
  const isAdmin = user?.isAdmin || false;
  

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { profileImageUrl: string }) => {
      const response = await apiRequest("PUT", "/api/user/profile", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Perfil atualizado",
        description: "Sua foto de perfil foi atualizada com sucesso.",
      });
      setIsProfileDialogOpen(false);
      setProfileImageUrl("");
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar perfil:', error);
      if (error.message.includes('401') || error.message.includes('Não autenticado')) {
        toast({
          title: "Sessão expirada",
          description: "Por favor, faça login novamente para continuar.",
          variant: "destructive",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      } else {
        toast({
          title: "Erro ao atualizar perfil",
          description: error.message || "Tente novamente",
          variant: "destructive",
        });
      }
    },
  });

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("section[id]");
      let current = "";
      
      sections.forEach((section) => {
        const sectionTop = (section as HTMLElement).offsetTop - 100;
        if (window.pageYOffset >= sectionTop) {
          current = section.getAttribute("id") || "";
        }
      });
      
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  const navItems = [
    { id: "inicio", label: "Início" },
    { id: "sobre", label: "Sobre" },
    { id: "projetos", label: "Projetos" },
    { id: "achievements", label: "Conquistas" },
    { id: "contato", label: "Contato" },
  ];

  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary-pink/20 border-2 border-primary-pink overflow-hidden flex-shrink-0">
              <img 
                src={avatarImage} 
                alt="Rafaela Botelho" 
                className="w-full h-full object-cover" 
              />
            </div>
            <span className="text-xl font-bold text-dark-gray">Rafaela Botelho</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`transition-colors duration-300 font-medium ${
                    activeSection === item.id
                      ? "text-primary-pink"
                      : "text-dark-gray hover:text-primary-pink"
                  }`}
                >
                  {item.label}
                </button>
              ))}
              
              {/* User Menu */}
              <div className="flex items-center space-x-4 ml-8 pl-8 border-l border-gray-200">
                {!isAuthenticated ? (
                  <Link href="/auth">
                    <Button 
                      variant="outline" 
                      className="border-pink-500 text-pink-600 hover:bg-pink-50"
                      data-testid="button-login"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Entrar
                    </Button>
                  </Link>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center space-x-2 p-2 h-auto">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center">
                          {user.profileImageUrl ? (
                            <img 
                              src={user.profileImageUrl} 
                              alt={user.firstName || 'User'} 
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-4 w-4 text-white" />
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {user.firstName || user.email}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="flex items-center space-x-2 p-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center">
                          {user.profileImageUrl ? (
                            <img 
                              src={user.profileImageUrl} 
                              alt={user.firstName || 'User'} 
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-4 w-4 text-white" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setIsProfileDialogOpen(true)}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Editar Perfil</span>
                      </DropdownMenuItem>
                      {isAdmin && (
                        <DropdownMenuItem onClick={() => scrollToSection("admin")}>
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Admin Panel</span>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => logoutMutation.mutate()}
                        disabled={logoutMutation.isPending}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>{logoutMutation.isPending ? 'Saindo...' : 'Sair'}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-dark-gray hover:text-primary-pink transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="block w-full text-left px-3 py-2 text-dark-gray hover:text-primary-pink transition-colors"
              >
                {item.label}
              </button>
            ))}
            
            {/* Mobile Auth */}
            <div className="border-t border-gray-100 pt-3 mt-3">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="flex items-center px-3 py-2">
                    {user?.profileImageUrl && (
                      <img 
                        src={user.profileImageUrl} 
                        alt={user.firstName || 'User'} 
                        className="w-6 h-6 rounded-full border border-primary-pink mr-3"
                      />
                    )}
                    <span className="text-sm text-gray-600">
                      {user?.firstName || user?.email}
                    </span>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => scrollToSection("admin")}
                      className="flex items-center w-full text-left px-3 py-2 text-primary-pink hover:bg-gray-50 transition-colors"
                    >
                      <Settings size={16} className="mr-3" />
                      Admin Panel
                    </button>
                  )}
                  <a
                    href="/api/logout"
                    className="flex items-center w-full text-left px-3 py-2 text-gray-500 hover:text-primary-pink transition-colors"
                  >
                    <LogOut size={16} className="mr-3" />
                    Sair
                  </a>
                </div>
              ) : (
                <Link href="/auth">
                  <Button className="flex items-center w-full mx-3 bg-primary-pink text-white hover:bg-pink-500">
                    <User className="mr-2 h-4 w-4" />
                    Entrar
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Profile Dialog */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="sm:max-w-[425px]" aria-describedby="profile-dialog-description">
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
            <DialogDescription id="profile-dialog-description">
              Atualize sua foto de perfil aqui. Você pode escolher um arquivo ou colar uma URL.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="profile-image">Foto de Perfil</Label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <Input
                  id="profile-image-file"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Compress and resize image before uploading
                      const canvas = document.createElement('canvas');
                      const ctx = canvas.getContext('2d');
                      const img = new Image();
                      
                      img.onload = () => {
                        // Set max dimensions
                        const maxWidth = 400;
                        const maxHeight = 400;
                        
                        let { width, height } = img;
                        
                        // Calculate new dimensions while maintaining aspect ratio
                        if (width > height) {
                          if (width > maxWidth) {
                            height = (height * maxWidth) / width;
                            width = maxWidth;
                          }
                        } else {
                          if (height > maxHeight) {
                            width = (width * maxHeight) / height;
                            height = maxHeight;
                          }
                        }
                        
                        canvas.width = width;
                        canvas.height = height;
                        
                        // Draw and compress
                        ctx?.drawImage(img, 0, 0, width, height);
                        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
                        setProfileImageUrl(compressedDataUrl);
                      };
                      
                      const reader = new FileReader();
                      reader.onload = () => {
                        img.src = reader.result as string;
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  data-testid="input-profile-image-file"
                  className="hidden"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => document.getElementById('profile-image-file')?.click()}
                  className="w-full sm:w-auto"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Escolher Arquivo
                </Button>
              </div>
              <Input
                value={profileImageUrl}
                onChange={(e) => setProfileImageUrl(e.target.value)}
                placeholder="Ou cole a URL da imagem"
                data-testid="input-profile-image-url"
              />
              <p className="text-sm text-gray-500">Escolha um arquivo ou cole uma URL de imagem. As imagens serão automaticamente redimensionadas.</p>
            </div>
            
            {/* Preview */}
            {profileImageUrl && (
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center overflow-hidden">
                  <img 
                    src={profileImageUrl} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                    onError={() => setProfileImageUrl("")}
                  />
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              type="submit"
              onClick={() => updateProfileMutation.mutate({ profileImageUrl })}
              disabled={updateProfileMutation.isPending || !profileImageUrl}
              data-testid="button-save-profile"
            >
              {updateProfileMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </nav>
  );
}