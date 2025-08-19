import { useState, useEffect } from "react";
import { Menu, X, LogIn, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import avatarImage from "@assets/bottons (3)_1755623044380.png";

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("inicio");
  const { user, isAuthenticated, isAdmin } = useAuth();

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
    { id: "certificados", label: "Certificados" },
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
              
              {/* Auth buttons */}
              <div className="flex items-center space-x-4 ml-8 pl-8 border-l border-gray-200">
                {isAuthenticated ? (
                  <div className="flex items-center space-x-3">
                    {user?.profileImageUrl && (
                      <img 
                        src={user.profileImageUrl} 
                        alt={user.firstName || 'User'} 
                        className="w-8 h-8 rounded-full border border-primary-pink"
                      />
                    )}
                    <span className="text-sm text-gray-600">
                      {user?.firstName || user?.email}
                    </span>
                    {isAdmin && (
                      <button
                        onClick={() => scrollToSection("admin")}
                        className="text-primary-pink hover:text-pink-600 transition-colors"
                        title="Admin Panel"
                      >
                        <Settings size={20} />
                      </button>
                    )}
                    <a
                      href="/api/logout"
                      className="text-gray-500 hover:text-primary-pink transition-colors"
                      title="Logout"
                    >
                      <LogOut size={20} />
                    </a>
                  </div>
                ) : (
                  <a
                    href="/api/login"
                    className="flex items-center space-x-2 bg-primary-pink text-white px-4 py-2 rounded-full font-semibold hover:bg-pink-500 transition-colors text-sm"
                  >
                    <LogIn size={16} />
                    <span>Entrar</span>
                  </a>
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
                <a
                  href="/api/login"
                  className="flex items-center px-3 py-2 bg-primary-pink text-white rounded-md font-semibold hover:bg-pink-500 transition-colors mx-3"
                >
                  <LogIn size={16} className="mr-2" />
                  Entrar
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}