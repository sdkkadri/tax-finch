import { z } from "zod";

export const CreateUserDTO = z.object({
  email: z.email("Invalid email format"),
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
});

export type CreateUserDTOType = z.infer<typeof CreateUserDTO>;
