import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerUserSchema, loginUserSchema, RegisterUser, LoginUser } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Heart, Code, Sparkles, LogIn, UserPlus } from "lucide-react";
import { motion } from "framer-motion";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const loginForm = useForm<LoginUser>({
    resolver: zodResolver(loginUserSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterUser>({
    resolver: zodResolver(registerUserSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
    },
  });

  const onLogin = (data: LoginUser) => {
    loginMutation.mutate(data);
  };

  const onRegister = (data: RegisterUser) => {
    registerMutation.mutate(data);
  };

  if (user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center min-h-screen">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto lg:mx-0"
              >
                <Heart className="h-10 w-10 text-white" />
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent text-center lg:text-left"
              >
                Rafaela Botelho
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-gray-600 dark:text-gray-400 text-center lg:text-left"
              >
                Desenvolvedora Full-Stack apaixonada por criar experiências digitais incríveis
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-6"
            >
              <div className="flex items-center space-x-4 justify-center lg:justify-start">
                <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-full">
                  <Code className="h-6 w-6 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Projetos Inovadores</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Soluções criativas com tecnologias modernas</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 justify-center lg:justify-start">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                  <Sparkles className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Design & Funcionalidade</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Interface bonita com experiência excepcional</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center lg:text-left"
            >
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Entre ou crie sua conta para explorar meu portfólio completo
              </p>
            </motion.div>
          </motion.div>

          {/* Auth Forms */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-md mx-auto"
          >
            <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="text-center space-y-2">
                <CardTitle className="text-2xl font-bold">Bem-vindo!</CardTitle>
                <CardDescription>
                  Entre em sua conta ou crie uma nova para continuar
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login" className="flex items-center space-x-2">
                      <LogIn className="h-4 w-4" />
                      <span>Login</span>
                    </TabsTrigger>
                    <TabsTrigger value="register" className="flex items-center space-x-2">
                      <UserPlus className="h-4 w-4" />
                      <span>Cadastro</span>
                    </TabsTrigger>
                  </TabsList>

                  {/* Login Form */}
                  <TabsContent value="login" className="space-y-4">
                    <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email">Email</Label>
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="seu@email.com"
                          {...loginForm.register("email")}
                          data-testid="input-login-email"
                        />
                        {loginForm.formState.errors.email && (
                          <p className="text-sm text-red-500">
                            {loginForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="login-password">Senha</Label>
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="Digite sua senha"
                          {...loginForm.register("password")}
                          data-testid="input-login-password"
                        />
                        {loginForm.formState.errors.password && (
                          <p className="text-sm text-red-500">
                            {loginForm.formState.errors.password.message}
                          </p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                        disabled={loginMutation.isPending}
                        data-testid="button-login"
                      >
                        {loginMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Entrando...
                          </>
                        ) : (
                          "Entrar"
                        )}
                      </Button>
                    </form>
                  </TabsContent>

                  {/* Register Form */}
                  <TabsContent value="register" className="space-y-4">
                    <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="register-firstName">Nome</Label>
                          <Input
                            id="register-firstName"
                            placeholder="Seu nome"
                            {...registerForm.register("firstName")}
                            data-testid="input-register-firstName"
                          />
                          {registerForm.formState.errors.firstName && (
                            <p className="text-sm text-red-500">
                              {registerForm.formState.errors.firstName.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="register-lastName">Sobrenome</Label>
                          <Input
                            id="register-lastName"
                            placeholder="Sobrenome"
                            {...registerForm.register("lastName")}
                            data-testid="input-register-lastName"
                          />
                          {registerForm.formState.errors.lastName && (
                            <p className="text-sm text-red-500">
                              {registerForm.formState.errors.lastName.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-email">Email</Label>
                        <Input
                          id="register-email"
                          type="email"
                          placeholder="seu@email.com"
                          {...registerForm.register("email")}
                          data-testid="input-register-email"
                        />
                        {registerForm.formState.errors.email && (
                          <p className="text-sm text-red-500">
                            {registerForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-password">Senha</Label>
                        <Input
                          id="register-password"
                          type="password"
                          placeholder="Mínimo 6 caracteres"
                          {...registerForm.register("password")}
                          data-testid="input-register-password"
                        />
                        {registerForm.formState.errors.password && (
                          <p className="text-sm text-red-500">
                            {registerForm.formState.errors.password.message}
                          </p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                        disabled={registerMutation.isPending}
                        data-testid="button-register"
                      >
                        {registerMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Criando conta...
                          </>
                        ) : (
                          "Criar conta"
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center mt-6"
            >
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Admin: rafaelaolbo@gmail.com | senha: dattebayo
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}