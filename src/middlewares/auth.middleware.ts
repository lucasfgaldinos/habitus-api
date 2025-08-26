import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import env from "../../env";
import type { User } from "../@types/user.type";

export const authMiddleware = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const authToken = req.headers.authorization;

	if (!authToken) {
		return res
			.status(StatusCodes.UNAUTHORIZED)
			.json({ message: "Token not provided." });
	}

	const [_, token] = authToken.split(" ");
	try {
		jwt.verify(token, env.JWT_SECRET, (err, decoded) => {
			if (err) {
				throw new Error();
			}

			req.user = decoded as User;
		});
	} catch {
		return res
			.status(StatusCodes.UNAUTHORIZED)
			.json({ message: "Token is invalid." });
	}

	return next();
};
