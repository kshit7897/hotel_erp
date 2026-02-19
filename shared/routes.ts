import { z } from "zod";
import { createStaffSchema } from "./schema";

export const api = {
  staff: {
    create: {
      method: "POST",
      path: "/api/staff",
      input: createStaffSchema,
      responses: {
        201: z.object({ uid: z.string(), email: z.string() }),
        400: z.object({ message: z.string() }),
        403: z.object({ message: z.string() }), // Unauthorized
        500: z.object({ message: z.string() }),
      },
    },
  },
};
