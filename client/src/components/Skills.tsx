import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { 
  SiJavascript, 
  SiReact, 
  SiNodedotjs, 
  SiPython, 
  SiHtml5, 
  SiCss3,
  SiBootstrap,
  SiPostgresql,
  SiSqlite,
  SiNotion,
  SiTrello,
  SiGit,
  SiGithub,
  SiGooglecloud,
  SiFigma,
  SiSass
} from "react-icons/si";

export default function Skills() {
  useScrollAnimation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(6);

  // Custom SQL Server Icon Component
  const SqlServerIcon = () => (
    <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
      SQL
    </div>
  );

  // Custom WMS Icon Component
  const WMSIcon = () => (
    <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
      WMS
    </div>
  );

  const skills = [
    { icon: SiJavascript, name: "JavaScript", color: "text-yellow-500", isCustom: false },
    { icon: SiReact, name: "React", color: "text-blue-500", isCustom: false },
    { icon: SiNodedotjs, name: "Node.js", color: "text-green-500", isCustom: false },
    { icon: SiPython, name: "Python", color: "text-blue-600", isCustom: false },
    { icon: SiHtml5, name: "HTML5", color: "text-orange-500", isCustom: false },
    { icon: SiCss3, name: "CSS3", color: "text-blue-500", isCustom: false },
    { icon: SiBootstrap, name: "Bootstrap", color: "text-purple-600", isCustom: false },
    { icon: SqlServerIcon, name: "SQL Server", color: "text-red-600", isCustom: true },
    { icon: SiPostgresql, name: "PostgreSQL", color: "text-blue-700", isCustom: false },
    { icon: SiSqlite, name: "SQLite", color: "text-blue-600", isCustom: false },
    { icon: SiNotion, name: "Notion", color: "text-gray-800", isCustom: false },
    { icon: SiTrello, name: "Trello", color: "text-blue-600", isCustom: false },
    { icon: SiGit, name: "Git", color: "text-orange-600", isCustom: false },
    { icon: SiGithub, name: "GitHub", color: "text-gray-800", isCustom: false },
    { icon: SiGooglecloud, name: "Google Cloud", color: "text-blue-500", isCustom: false },
    { icon: SiFigma, name: "Figma", color: "text-purple-500", isCustom: false },
    { icon: SiSass, name: "SASS", color: "text-pink-500", isCustom: false },
    { icon: WMSIcon, name: "WMS", color: "text-gray-600", isCustom: true },
  ];

  // Update items per view based on screen size
  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(2);
      } else if (window.innerWidth < 768) {
        setItemsPerView(3);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(4);
      } else {
        setItemsPerView(6);
      }
    };

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const maxIndex = Math.max(0, skills.length - itemsPerView);
        return prevIndex >= maxIndex ? 0 : prevIndex + 1;
      });
    }, 3000);

    return () => clearInterval(timer);
  }, [skills.length, itemsPerView]);

  const nextSlide = () => {
    const maxIndex = Math.max(0, skills.length - itemsPerView);
    setCurrentIndex((prevIndex) => (prevIndex >= maxIndex ? 0 : prevIndex + 1));
  };

  const prevSlide = () => {
    const maxIndex = Math.max(0, skills.length - itemsPerView);
    setCurrentIndex((prevIndex) => (prevIndex <= 0 ? maxIndex : prevIndex - 1));
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-dark-gray mb-4">Tecnologias</h2>
          <div className="w-24 h-1 bg-primary-pink mx-auto rounded-full"></div>
        </div>
        
        <div className="relative fade-in">
          {/* Carousel Container */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)` }}
            >
              {skills.map((skill, index) => (
                <div 
                  key={index} 
                  className="flex-shrink-0 px-3"
                  style={{ width: `${100 / itemsPerView}%` }}
                >
                  <div className="bg-light-gray p-6 rounded-xl text-center hover:shadow-lg transition-all duration-300 group hover:scale-105">
                    {skill.isCustom ? (
                      <div className="mb-3 mx-auto group-hover:scale-110 transition-transform flex justify-center">
                        <skill.icon />
                      </div>
                    ) : (
                      <skill.icon className={`text-4xl ${skill.color} mb-3 mx-auto group-hover:scale-110 transition-transform`} />
                    )}
                    <p className="font-semibold text-dark-gray text-sm">{skill.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors z-10"
          >
            <ChevronLeft className="text-primary-pink" size={20} />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors z-10"
          >
            <ChevronRight className="text-primary-pink" size={20} />
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: Math.ceil(skills.length / itemsPerView) }, (_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  Math.floor(currentIndex / 1) === index
                    ? 'bg-primary-pink'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}