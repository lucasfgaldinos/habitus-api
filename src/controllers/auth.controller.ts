import axios, { isAxiosError } from "axios";
import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import env from "../../env";

export class AuthController {
	auth = async (_: Request, res: Response) => {
		const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${env.GITHUB_CLIENT_ID}`;

		res.status(StatusCodes.OK).json({ redirectUrl });
	};

	authCallback = async (req: Request, res: Response) => {
		try {
			const { code } = req.query;

			const accessTokenResult = await axios.post(
				"https://github.com/login/oauth/access_token",
				{
					client_id: env.GITHUB_CLIENT_ID,
					client_secret: env.GITHUB_CLIENT_SECRET,
					code,
				},
				{
					headers: {
						Accept: "application/json",
					},
				},
			);

			const userDataResult = await axios.get("https://api.github.com/user", {
				headers: {
					Authorization: `Bearer ${accessTokenResult?.data?.access_token}`,
				},
			});

			const { node_id: id, avatar_url: avatarUrl, name } = userDataResult.data;

			const token = jwt.sign({ id }, env.JWT_SECRET, {
				expiresIn: "1d",
			});

			return res.status(StatusCodes.OK).json({ token, id, avatarUrl, name });
		} catch (error) {
			if (isAxiosError(error)) {
				return res.status(StatusCodes.UNAUTHORIZED).json(error.response?.data);
			}

			return res
				.status(StatusCodes.UNAUTHORIZED)
				.json({ message: "Something went wrong.", error: error });
		}
	};
}
