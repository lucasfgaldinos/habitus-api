import type { User } from "./user.type";

declare global {
	namespace Express {
		export interface Request {
			user: User;
		}
	}
}
