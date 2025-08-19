import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema, insertProjectSchema, insertProjectCommentSchema, insertAchievementSchema, insertAchievementCommentSchema, insertExperienceSchema } from "@shared/schema";
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

  // Achievement routes
  app.get("/api/achievements", async (req, res) => {
    try {
      const achievements = await storage.getAchievements();
      res.json(achievements);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });

  app.get("/api/achievements/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const achievement = await storage.getAchievement(id);
      if (!achievement) {
        return res.status(404).json({ message: "Achievement not found" });
      }
      res.json(achievement);
    } catch (error) {
      console.error("Error fetching achievement:", error);
      res.status(500).json({ message: "Failed to fetch achievement" });
    }
  });

  // Admin - Create achievement
  app.post("/api/achievements", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validatedData = insertAchievementSchema.parse(req.body);
      const achievement = await storage.createAchievement(validatedData);
      res.json(achievement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors 
        });
      } else {
        console.error("Error creating achievement:", error);
        res.status(500).json({ message: "Erro interno do servidor" });
      }
    }
  });

  // Admin - Update achievement
  app.put("/api/achievements/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertAchievementSchema.partial().parse(req.body);
      const achievement = await storage.updateAchievement(id, validatedData);
      res.json(achievement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors 
        });
      } else {
        console.error("Error updating achievement:", error);
        res.status(500).json({ message: "Erro interno do servidor" });
      }
    }
  });

  // Admin - Delete achievement
  app.delete("/api/achievements/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteAchievement(id);
      res.json({ message: "Achievement deleted successfully" });
    } catch (error) {
      console.error("Error deleting achievement:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Achievement likes
  app.post("/api/achievements/:id/like", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      const liked = await storage.toggleAchievementLike(id, userId);
      res.json({ liked });
    } catch (error) {
      console.error("Error toggling achievement like:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Achievement comments
  app.get("/api/achievements/:id/comments", async (req, res) => {
    try {
      const { id } = req.params;
      const comments = await storage.getAchievementComments(id);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching achievement comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post("/api/achievements/:id/comments", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      const validatedData = insertAchievementCommentSchema.parse(req.body);
      const comment = await storage.addAchievementComment({
        ...validatedData,
        achievementId: id,
        userId
      });
      res.json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors 
        });
      } else {
        console.error("Error adding achievement comment:", error);
        res.status(500).json({ message: "Erro interno do servidor" });
      }
    }
  });

  // Experience routes
  app.get("/api/experiences", async (req, res) => {
    try {
      const experiences = await storage.getExperiences();
      res.json(experiences);
    } catch (error) {
      console.error("Error fetching experiences:", error);
      res.status(500).json({ message: "Failed to fetch experiences" });
    }
  });

  // Admin - Create experience
  app.post("/api/experiences", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validatedData = insertExperienceSchema.parse(req.body);
      const experience = await storage.createExperience(validatedData);
      res.json(experience);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors 
        });
      } else {
        console.error("Error creating experience:", error);
        res.status(500).json({ message: "Erro interno do servidor" });
      }
    }
  });

  // Admin - Update experience
  app.put("/api/experiences/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertExperienceSchema.partial().parse(req.body);
      const experience = await storage.updateExperience(id, validatedData);
      res.json(experience);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors 
        });
      } else {
        console.error("Error updating experience:", error);
        res.status(500).json({ message: "Erro interno do servidor" });
      }
    }
  });

  // Admin - Delete experience
  app.delete("/api/experiences/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteExperience(id);
      res.json({ message: "Experience deleted successfully" });
    } catch (error) {
      console.error("Error deleting experience:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
