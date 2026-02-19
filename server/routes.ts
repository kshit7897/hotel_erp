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

  // Create Staff User Endpoint
  // This endpoint creates a user in Firebase Auth and sets their custom claim role to 'staff'
  app.post(api.staff.create.path, async (req, res) => {
    try {
      // 1. Validate Input
      const { email, password, name } = api.staff.create.input.parse(req.body);

      // 2. Create User in Firebase Auth
      const userRecord = await auth.createUser({
        email,
        password,
        displayName: name,
      });

      // 3. Set Custom User Claims (Role: staff)
      await auth.setCustomUserClaims(userRecord.uid, { role: "staff" });

      // 4. (Optional) Create a Firestore document for the user with additional details
      // The frontend can also do this, or we can do it here using admin SDK
      // For now, we'll just return success and let the frontend/firestore triggers handle profile creation if needed
      // or we can add it here:
      /*
      await db.collection("users").doc(userRecord.uid).set({
        uid: userRecord.uid,
        email: userRecord.email,
        name: userRecord.displayName,
        role: "staff",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      */

      res.status(201).json({ uid: userRecord.uid, email: userRecord.email });
    } catch (error: any) {
      console.error("Error creating staff user:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else {
        res.status(500).json({ message: error.message || "Internal Server Error" });
      }
    }
  });

  return httpServer;
}
