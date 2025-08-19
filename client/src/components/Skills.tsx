import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { SiJavascript, SiReact, SiNodedotjs, SiPython, SiHtml5, SiCss3 } from "react-icons/si";

export default function Skills() {
  useScrollAnimation();

  const skills = [
    { icon: SiJavascript, name: "JavaScript", color: "text-yellow-500" },
    { icon: SiReact, name: "React", color: "text-blue-500" },
    { icon: SiNodedotjs, name: "Node.js", color: "text-green-500" },
    { icon: SiPython, name: "Python", color: "text-blue-600" },
    { icon: SiHtml5, name: "HTML5", color: "text-orange-500" },
    { icon: SiCss3, name: "CSS3", color: "text-blue-500" },
  ];

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
              <p className="font-semibold text-dark-gray">{skill.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
