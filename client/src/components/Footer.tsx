import { Github, Linkedin, Heart, Coffee } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-dark-gray text-white py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-4">Rafaela Botelho</h3>
          <p className="text-gray-400 mb-6">Desenvolvedora Full Stack em formação</p>
          <div className="flex justify-center space-x-6 mb-8">
            <a
              href="https://github.com/bruxa61"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary-pink transition-colors text-xl"
            >
              <Github size={24} />
            </a>
            <a
              href="https://www.linkedin.com/in/rafaela-botelho-76a4a72b0/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary-pink transition-colors text-xl"
            >
              <Linkedin size={24} />
            </a>
          </div>
          <div className="border-t border-gray-700 pt-8">
            <p className="text-gray-400 text-sm flex items-center justify-center gap-2">
              © 2024 Rafaela Botelho. Feito com 
              <Heart className="text-red-500" size={16} fill="currentColor" /> 
              e muito 
              <Coffee className="text-yellow-600" size={16} />
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
