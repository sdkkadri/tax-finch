import { z } from "zod";

export const UpdateUserDTO = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
});

export type UpdateUserDTOType = z.infer<typeof UpdateUserDTO>;
