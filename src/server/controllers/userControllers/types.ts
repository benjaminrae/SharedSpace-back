import type { JwtPayload } from "jsonwebtoken";

export interface CustomTokenPayload extends JwtPayload {
  username: string;
  id: string;
}
