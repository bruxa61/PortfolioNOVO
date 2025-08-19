import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema, insertProjectSchema, insertProjectCommentSchema } from "@shared/schema";
import { z } from "zod";
import { setupAuth, isAuthenticated, isAdmin } from "./replitAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get all projects
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  // Admin - Create project
  app.post("/api/projects", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(validatedData);
      res.json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors 
        });
      } else {
        console.error("Error creating project:", error);
        res.status(500).json({ message: "Erro interno do servidor" });
      }
    }
  });

  // Admin - Update project
  app.put("/api/projects/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(id, validatedData);
      res.json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors 
        });
      } else {
        console.error("Error updating project:", error);
        res.status(500).json({ message: "Erro interno do servidor" });
      }
    }
  });

  // Admin - Delete project
  app.delete("/api/projects/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteProject(id);
      res.json({ message: "Projeto deletado com sucesso" });
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Toggle project like
  app.post("/api/projects/:id/like", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      const liked = await storage.toggleProjectLike(id, userId);
      res.json({ liked });
    } catch (error) {
      console.error("Error toggling like:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Get project comments
  app.get("/api/projects/:id/comments", async (req, res) => {
    try {
      const { id } = req.params;
      const comments = await storage.getProjectComments(id);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Add project comment
  app.post("/api/projects/:id/comments", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      const validatedData = insertProjectCommentSchema.parse({
        ...req.body,
        projectId: id,
        userId
      });
      const comment = await storage.addProjectComment(validatedData);
      res.json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors 
        });
      } else {
        console.error("Error adding comment:", error);
        res.status(500).json({ message: "Erro interno do servidor" });
      }
    }
  });

  // Submit contact form
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(validatedData);
      
      // In a real application, you would send an email here
      // For now, we'll just log the contact submission
      console.log("New contact submission:", contact);
      
      res.json({ 
        message: "Mensagem enviada com sucesso! Entrarei em contato em breve.",
        id: contact.id 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors 
        });
      } else {
        console.error("Error creating contact:", error);
        res.status(500).json({ message: "Erro interno do servidor" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
