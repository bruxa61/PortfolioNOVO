import type { Express, RequestHandler } from "express";
import { storage } from "./storage-simple";

// Simple development auth that simulates Replit OAuth behavior
export async function setupAuth(app: Express) {
  // Simple session middleware for development
  app.use((req, res, next) => {
    // Simulate authenticated user based on environment
    const userEmail = process.env.DEV_USER_EMAIL || "rafaelaolbo@gmail.com";
    (req as any).user = {
      claims: { 
        sub: "dev-user", 
        email: userEmail,
        first_name: "Rafaela",
        last_name: "Botelho"
      }
    };
    (req as any).isAuthenticated = () => true;
    next();
  });

  // Mock auth routes for development
  app.get("/api/login", (req, res) => {
    res.redirect("/");
  });

  app.get("/api/logout", (req, res) => {
    res.redirect("/");
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  next(); // Always allow in development
};

export const isAdmin: RequestHandler = async (req, res, next) => {
  const userEmail = (req as any).user?.claims?.email;
  if (userEmail === "rafaelaolbo@gmail.com") {
    return next();
  }
  return res.status(403).json({ message: "Admin access required" });
};