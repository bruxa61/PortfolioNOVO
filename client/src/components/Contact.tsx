import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Mail, Linkedin, Github, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function Contact() {
  useScrollAnimation();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const contactMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      const response = await apiRequest("POST", "/api/contact", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Mensagem enviada!",
        description: data.message,
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
    },
    onError: (error) => {
      toast({
        title: "Erro ao enviar mensagem",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    contactMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <section id="contato" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-dark-gray mb-4">Vamos conversar?</h2>
          <div className="w-24 h-1 bg-primary-pink mx-auto rounded-full"></div>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Estou sempre aberta a novas oportunidades e projetos interessantes. 
            Entre em contato e vamos criar algo incrível juntos!
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="fade-in">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary-pink/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="text-primary-pink text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-dark-gray mb-2">Email</h3>
                  <p className="text-gray-600">rafaela.botelho@contato.com</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary-pink/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Linkedin className="text-primary-pink text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-dark-gray mb-2">LinkedIn</h3>
                  <a
                    href="https://www.linkedin.com/in/rafaela-botelho-76a4a72b0/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-pink hover:underline"
                  >
                    /rafaela-botelho-76a4a72b0
                  </a>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary-pink/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Github className="text-primary-pink text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-dark-gray mb-2">GitHub</h3>
                  <a
                    href="https://github.com/bruxa61"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-pink hover:underline"
                  >
                    @bruxa61
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          {/* Contact Form */}
          <div className="fade-in">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-sm font-semibold text-dark-gray">
                  Nome
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Seu nome completo"
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="email" className="text-sm font-semibold text-dark-gray">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="seu@email.com"
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="subject" className="text-sm font-semibold text-dark-gray">
                  Assunto
                </Label>
                <Input
                  id="subject"
                  name="subject"
                  type="text"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Sobre o que você gostaria de conversar?"
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="message" className="text-sm font-semibold text-dark-gray">
                  Mensagem
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Conte-me mais sobre seu projeto ou ideia..."
                  className="mt-2 resize-none"
                />
              </div>
              
              <Button
                type="submit"
                disabled={contactMutation.isPending}
                className="w-full bg-primary-pink text-white px-8 py-4 rounded-lg font-semibold hover:bg-pink-500 transform hover:scale-105 transition-all duration-300 shadow-lg"
              >
                {contactMutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={16} />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2" size={16} />
                    Enviar mensagem
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
