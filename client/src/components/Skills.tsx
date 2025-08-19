import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { 
  SiJavascript, 
  SiReact, 
  SiNodedotjs, 
  SiPython, 
  SiHtml5, 
  SiCss3,
  SiBootstrap,
  SiMysql,
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

  const skills = [
    { icon: SiJavascript, name: "JavaScript", color: "text-yellow-500" },
    { icon: SiReact, name: "React", color: "text-blue-500" },
    { icon: SiNodedotjs, name: "Node.js", color: "text-green-500" },
    { icon: SiPython, name: "Python", color: "text-blue-600" },
    { icon: SiHtml5, name: "HTML5", color: "text-orange-500" },
    { icon: SiCss3, name: "CSS3", color: "text-blue-500" },
    { icon: SiBootstrap, name: "Bootstrap", color: "text-purple-600" },
    { icon: SiMysql, name: "SQL Server", color: "text-blue-600" },
    { icon: SiPostgresql, name: "PostgreSQL", color: "text-blue-700" },
    { icon: SiSqlite, name: "SQLite", color: "text-blue-600" },
    { icon: SiNotion, name: "Notion", color: "text-gray-800" },
    { icon: SiTrello, name: "Trello", color: "text-blue-600" },
    { icon: SiGit, name: "Git", color: "text-orange-600" },
    { icon: SiGithub, name: "GitHub", color: "text-gray-800" },
    { icon: SiGooglecloud, name: "Google Cloud", color: "text-blue-500" },
    { icon: SiFigma, name: "Figma", color: "text-purple-500" },
    { icon: SiSass, name: "SASS", color: "text-pink-500" },
  ];

  // WMS doesn't have a specific icon, so we'll create a custom one
  const CustomWMSIcon = () => (
    <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
      WMS
    </div>
  );

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-dark-gray mb-4">Tecnologias</h2>
          <div className="w-24 h-1 bg-primary-pink mx-auto rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 fade-in">
          {skills.map((skill, index) => (
            <div key={index} className="bg-light-gray p-6 rounded-xl text-center hover:shadow-lg transition-shadow group">
              <skill.icon className={`text-4xl ${skill.color} mb-3 mx-auto group-hover:scale-110 transition-transform`} />
              <p className="font-semibold text-dark-gray text-sm">{skill.name}</p>
            </div>
          ))}
          {/* Custom WMS card */}
          <div className="bg-light-gray p-6 rounded-xl text-center hover:shadow-lg transition-shadow group">
            <div className="mb-3 mx-auto group-hover:scale-110 transition-transform flex justify-center">
              <CustomWMSIcon />
            </div>
            <p className="font-semibold text-dark-gray text-sm">WMS</p>
          </div>
        </div>
      </div>
    </section>
  );
}