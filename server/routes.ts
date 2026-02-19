import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { auth } from "./firebase";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Create Staff User Endpoint - DEPRECATED
  // Moved to client-side creation in Staff.tsx
  // app.post(api.staff.create.path, async (req, res) => { ... });

  return httpServer;
}
