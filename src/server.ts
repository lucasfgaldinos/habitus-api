import cors from "cors";
import express from "express";
import env from "../env";
import { setupMongo } from "./database";
import { routes } from "./routes";

const app = express();

setupMongo()
	.then(() => {
		app.use(
			cors({
				origin: true,
			}),
		);

		app.use(express.json());

		app.use(routes);

		app.listen(env.PORT, () =>
			console.log(`Server is running at port ${env.PORT}! 🚀`),
		);
	})
	.catch((error) => {
		console.log(error.message);
	});
