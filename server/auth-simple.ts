import type { Express, RequestHandler } from "express";

// Simple auth for production without Replit OAuth
export async function setupSimpleAuth(app: Express) {
  // Simple session middleware for production
  app.use((req, res, next) => {
    // Simulate authenticated admin user for production
    (req as any).user = {
      claims: { 
        sub: "admin", 
        email: "rafaelaolbo@gmail.com",
        first_name: "Rafaela",
        last_name: "Botelho"
      }
    };
    (req as any).isAuthenticated = () => true;
    next();
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  next(); // Always allow in production
};

export const isAdmin: RequestHandler = (req, res, next) => {
  next(); // Always allow admin in production
};